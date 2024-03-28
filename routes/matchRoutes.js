const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');

router.route('/')
    .get(matchesController.getMatchesByQuery)
    .post(matchesController.addNewMatch)

router.route('/authenticate').post(matchesController.authenticate)

module.exports = router;