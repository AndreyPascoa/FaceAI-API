const multer = require('multer')

const upload = multer({ dest: 'upload'})
const file = upload.single('image')

module.exports = { file }