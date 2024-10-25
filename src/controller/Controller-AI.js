const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs').promises;
const Jimp = require('jimp');
const { LogaBioId, DadosBioId } = require('../api/API');
const { DateTime } = require('../components/Components');

const { Canvas, Image, ImageData, loadImage } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_URL = path.join(__dirname, '../../model');
let modelsLoaded = false;
let labeledFaceDescriptors;

async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.mtcnn.loadFromDisk(MODELS_URL),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL)
    ]);
    modelsLoaded = true;
    console.log('Modelos carregados');
    labeledFaceDescriptors = await DadosBioId();
  } catch (error) {
    console.error('Erro ao carregar modelos:', error);
  }
}

loadModels().catch(err => {
  console.error('Erro ao carregar modelos:', err);
});

function getNumberName(input) {
  const regex = /^(\d+)\s+\((\d+\.\d+)\)$/;
  const match = input.match(regex);

  if (match) {
    const code = match[1].trim();
    const number = parseFloat(match[2]);
    console.log(`Código: ${code}, Número: ${number}`);
    return { code, number };
  } else {
    throw new Error('Código ou número não encontrados na string');
  }
}

const Controller = async (req, res) => {
  console.log("Valida Face");
  
  if (!modelsLoaded) {
    return res.status(503).json({ message: 'Modelos ainda não carregados. Por favor, tente novamente mais tarde.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada' });
  }

  try {
    const start = Date.now();

    const imageBuffer = await fs.readFile(req.file.path);
    const img = await Jimp.read(imageBuffer);
    img.resize(512, Jimp.AUTO);
    const resizedBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

    const image = await loadImage(resizedBuffer);
    console.log('Imagem enviada carregada: ' + DateTime());

    const mtcnnOptions = new faceapi.MtcnnOptions({
      minFaceSize: 30,
      scaleFactor: 0.8,
      maxNumScales: 10,
      scoreThresholds: [0.6, 0.7, 0.7]
    });

    const detections = await faceapi.detectAllFaces(image, mtcnnOptions).withFaceLandmarks().withFaceDescriptors();

    console.log(`Detecções encontradas: ${detections.length}`);

    await fs.unlink(req.file.path);

    if (detections.length === 0) {
      return res.status(400).json({ message: 'Nenhum rosto detectado na imagem' });
    }

    const validDetections = detections.filter(d => d.descriptor);

    if (validDetections.length === 0) {
      return res.status(400).json({ message: 'Não foi possível extrair descritores dos rostos detectados' });
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    const results = validDetections.map(d => {
      return faceMatcher.findBestMatch(d.descriptor);
    });

    let bestMatch = null;
    let lowestNumber = Infinity;

    results.forEach(result => {
      if (result.label.toString() !== 'unknown') {
        console.log(`Correspondência encontrada: ${result.toString()}`);
        const { code, number } = getNumberName(result.toString());

        if (number < lowestNumber) {
          lowestNumber = number;
          bestMatch = result;
        }

        validDetections.forEach(detection => {
          const descricao = detection.descriptor;
          const parameter = (descricao + '|' + code + '|' + number);
          LogaBioId(parameter);
        });
      } else {
        console.log(`Nenhum rosto encontrado: ${result.label.toString()}`);
      }
    });

    const end = Date.now();
    console.log(`Tempo de execução: ${(end - start) / 1000}s`);

    if (bestMatch) {
      return res.status(200).json({ codigo: bestMatch.label });
    } else {
      return res.status(401).json({ message: 'Nenhum rosto correspondente encontrado' });
    }

  } catch (error) {
    console.error('Erro ao processar a imagem', error);
    res.status(500).json({ message: 'Erro ao processar a imagem' });
  }
};

module.exports = { Controller };
