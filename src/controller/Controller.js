
const express = require('express');
const multer = require('multer');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

const { Canvas, Image, ImageData, loadImage } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_URL = path.join(__dirname, '../models');
let modelsLoaded = false;
let labeledFaceDescriptors;

async function loadModels() {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL),
    faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL),
    faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL)
  ]);
  modelsLoaded = true;
  console.log('Modelos carregados');
  labeledFaceDescriptors = await loadLabeledImages();
}

loadModels().catch(err => {
  console.error('Erro ao carregar modelos:', err);
});

const validateFace = async (req, res) => {
  if (!modelsLoaded) {
    return res.status(503).json({ message: 'Modelos ainda não carregados. Por favor, tente novamente mais tarde.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada' });
  }

  try {
    const imagePath = req.file.path;
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ message: 'Arquivo de imagem não encontrado' });
    }

    const img = await Jimp.read(imagePath);
    img.resize(250, Jimp.AUTO);
    const resizedImagePath = path.join(__dirname, '../uploads', `resized-${Date.now()}.jpg`);
    await img.writeAsync(resizedImagePath);

    const image = await loadImage(resizedImagePath);
    console.log(`Imagem enviada carregada: ${resizedImagePath}`);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    console.log(`Detecções encontradas: ${detections.length}`);

    fs.unlinkSync(imagePath);
    fs.unlinkSync(resizedImagePath);

    if (detections.length === 0) {
      return res.status(400).json({ message: 'Nenhum rosto detectado na imagem' });
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));

    results.forEach(result => {
      console.log(`Correspondência encontrada: ${result.toString()}`);
    });

    const bestMatch = results.find(result => result.label !== 'unknown');
    if (bestMatch) {
      return res.status(200).json({ label: bestMatch.label });
    }

    return res.status(200).json({ message: 'Nenhum rosto correspondente encontrado' });
  } catch (error) {
    console.error('Erro ao processar a imagem', error);
    res.status(500).json({ message: 'Erro ao processar a imagem' });
  }
}

async function loadLabeledImages() {
  const labels = ['Andrey', 'Arthur', 'Marcela'];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 1; i++) {
        const imgPath = path.join(__dirname, `../../image/${label}/${i}.jpg`);
        if (!fs.existsSync(imgPath)) {
          console.error(`Imagem não encontrada: ${imgPath}`);
          continue;
        }
        console.log(`Imagem carregada: ${imgPath} - Rotulada: ${label}`);
        const img = await loadImage(imgPath);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detection && detection.descriptor) {
          descriptions.push(detection.descriptor);
          console.log(`Descritor para ${label}: ${detection.descriptor}`);
        } else {
          console.log(`Nenhuma detecção para ${label} em ${imgPath}`);
        }
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

module.exports = { validateFace };
