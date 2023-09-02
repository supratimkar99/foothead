const express = require('express')
const router = express.Router()
const playersController = require('../controllers/playersController')

router.route('/')
    .get(playersController.getAllPlayers)
    .post(playersController.addNewPlayer)
    .patch(playersController.updatePlayer)

module.exports = router