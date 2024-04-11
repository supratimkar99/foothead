const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const tokenValidator = require('../middleware/tokenValidator');

router.route('/')
    .get(matchesController.getMatchesByQuery)
    .post(tokenValidator, matchesController.addNewMatch)

router.route('/authenticate').post(matchesController.authenticate)

module.exports = router;