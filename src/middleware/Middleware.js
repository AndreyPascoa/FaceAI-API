const multer = require('multer');

const upload = multer({ dest: 'uploads' });
const file = upload.single('image');

module.exports = { file };
