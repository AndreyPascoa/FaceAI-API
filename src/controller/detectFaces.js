const faceapi = require('face-api.js');
const canvas = require('canvas');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

process.on('message', async (msg) => {
  const { image } = msg;
  const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
  process.send(detections);
});
