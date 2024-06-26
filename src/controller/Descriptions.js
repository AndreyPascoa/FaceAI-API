const connection = require('../connection/connection')
const faceapi = require('face-api.js')

async function saveDescription(label, description) {
    try{
        await connection.query('INSERT INTO face_descriptors (label, description) VALUES (?,?)', 
            [label, Buffer.from(description)]
        )
    }
    finally{
        connection.release()
    }
}

async function loadLabeledImages() {
    try{
        const [rows] = await connection.query('SELECT label, description FROM face_descriptors')
        return new faceapi.LabeledFaceDescriptors(
            row.label,
            [new Float32Array(row.descriptor)]
          )
    }finally{
        connection.release()
    }
}

module.exports = {
    saveDescription,
    loadLabeledImages
}