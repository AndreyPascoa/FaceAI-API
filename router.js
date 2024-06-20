const express = require('express')
const Controller = require('./controller/Controller')
const Middleware = require('./middleware/Middleware')

const router = express.Router()

router.post('/validateFace', Middleware.file, Controller.validateFace)

module.exports = router