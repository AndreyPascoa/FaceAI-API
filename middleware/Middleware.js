const multer = require('multer')

const uploads = multer({dest: 'uploads/'})
const file = uploads.single('file')

module.exports = file