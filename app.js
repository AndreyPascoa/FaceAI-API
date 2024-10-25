const express = require('express')
const router = require('./src/routes/router')
const conrs = require('cors')

const app = express()

app.use(conrs())
app.use(express.json())
app.use(router)

module.exports = app