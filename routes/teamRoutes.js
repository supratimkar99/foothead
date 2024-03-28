const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');

router.route('/')
    .get(teamsController.getAllTeams)
    .post(teamsController.addNewTeam)
    .patch(teamsController.updateTeam)

module.exports = router;