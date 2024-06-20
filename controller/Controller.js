const { startFace } = require('../model-api/model');

const validateFace = async (req, res) => {

    const image = req.file.path;

    const start = startFace(image)

    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('../models')
    ]).then(start)
}

module.exports = validateFace;