const startFace = async () => {

}

function loadLabeledImg(){
    const labels = ['Andrey', 'Arthur', 'Marcela']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`../image/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                return detections.lenth
            }
        })
    )
}

module.exports = {
    startFace
}