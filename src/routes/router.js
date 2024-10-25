const express = require('express')
const { Controller } = require('../controller/Controller-AI')
const { file } = require('../middleware/Middleware')

const router = express.Router()

//POST
router.post('/detectFace', file , Controller)

module.exports = router