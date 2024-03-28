const express = require('express');
const router = express.Router();
const tournamentsController = require('../controllers/tournamentsController');

router.route('/')
    .get(tournamentsController.getAllTournaments)
    .post(tournamentsController.createNewTournament)
    // .patch(tournamentsController.updateTournament)

router.route('/:tournamentId').get(tournamentsController.getTournamentById)
module.exports = router;