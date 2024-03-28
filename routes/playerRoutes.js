const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');

router.route('/')
    .get(playersController.getAllPlayers)
    .post(playersController.addNewPlayer)
    .patch(playersController.updatePlayer)
    
router.route('/:playerId').get(playersController.getPlayerById)
router.route('/:playerId/match_stats').get(playersController.getMatchStatsByPlayerId)

module.exports = router;