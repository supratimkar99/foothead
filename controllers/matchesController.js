const bcrypt = require('bcrypt');
const Match = require('../models/Match');
const Stage = require('../models/Stage');
const Tournament = require('../models/Tournament');
const MatchCounter = require('../models/MatchCounter');
const asyncHandler = require('express-async-handler');

// @desc Get all tournaments
// @route GET /tournaments
// @access Public
const getMatchesByQuery = asyncHandler( async (req, res) => {
    const { player, player1, player2 } = req.query;

    let matches;
    if ( player1 !== undefined && player2 !== undefined ) {
        matches = await Match.find({
            $or: [
              { $and: [{ 'scoreline.home.player': player1 }, { 'scoreline.away.player': player2 }] },
              { $and: [{ 'scoreline.home.player': player2 }, { 'scoreline.away.player': player1 }] }
            ]
        }).sort({ identifier: -1 }).lean().exec();
    } else if ( player !== undefined ) {
        matches = await Match.find({ $or: [{ 'scoreline.home.player': player }, { 'scoreline.away.player': player }] }).sort({ identifier: -1 }).lean().exec();
    } else {
        matches = await Match.find().lean().exec();
    }

    if(!matches?.length) {
        return res.status(400).json({ message: 'No matches found' });
    }

    res.json(matches);
});

// @desc Create a tournament
// @route POST /tournaments
// @access Private
const addNewMatch = asyncHandler( async(req, res) => {
    const { stageId, tournamentId, scoreline } = req.body;
    let teamsIncluded = req.body.teamsIncluded;
    let identifier = req.body.identifier;

    const stage = await Stage.findById(stageId).lean().exec();
    if (!stage) {
        return res.status(400).json({ message: `Invalid StageId ${stageId}` });
    }

    const tournament = await Tournament.findById(tournamentId).lean().exec();
    if (!tournament) {
        return res.status(400).json({ message: `Invalid TournamentId ${tournamentId}` });
    }
    if (tournament.participants[0].team) {
        teamsIncluded = teamsIncluded ?? true;
    }
    
    if (stage.tournament !== tournament.name) {
        return res.status(400).json({ message: `Stage (ID: ${stageId}) doesn't belong to Tournament (ID: ${tournamentId})` });
    }
    let homeCheck = false;
    let awayCheck = false;
    for (const participant of tournament.participants) {
        if (scoreline.home.player === participant.player) {
            if (teamsIncluded) {
                if (scoreline.home.team === participant.team) {
                    homeCheck = true;
                    continue;
                }
            } else {
                homeCheck = true;
                continue;
            }
        }
        if (scoreline.away.player === participant.player) {
            if (teamsIncluded) {
                if (scoreline.away.team === participant.team) {
                    awayCheck = true;
                }
            } else {
                awayCheck = true;
            }
        }
        if (homeCheck && awayCheck) {
            break;
        }
    }

    if (!homeCheck || !awayCheck) {
        return res.status(400).json({ message: `Participants don't belong to the tournament` });
    }

    let winner = null;
    if (scoreline.home.score !== scoreline.away.score) {
        winner = scoreline.home.score > scoreline.away.score ? scoreline.home : scoreline.away;
    }

    const matchCount = await MatchCounter.findById(identifier).lean();
    if (matchCount) {
        const updatedMatchCount = await MatchCounter.findByIdAndUpdate(identifier, { count: matchCount.count+1 }, { new: true });
        identifier = identifier + '_' + (updatedMatchCount.count > 9 ? updatedMatchCount.count : ('0' + updatedMatchCount.count));
    } else {
        const createdMatchCount = await MatchCounter.create({ _id: identifier, count: 1 });
        identifier = identifier + '_01';
    }

    const matchObject = {
        identifier,
        stage: {
            _id: stageId,
            name: stage.type
        },
        tournament: {
            _id: tournamentId,
            name: tournament.name
        },
        scoreline,
        winner
    };
    const match = await Match.create(matchObject);

    if (match) {
        res.status(201).json({ message: `New match added in ${tournament.name} ${stage.type}`});
    } else {
        res.status(400).json({ message: 'Invalid match data received' });
    }
});

const authenticate = asyncHandler( async(req, res) => {
    const { password } = req.body;
    const hashedPassword = decodeURIComponent(process.env.ADMIN_PASSWORD);
    const isPasswordCorrect = bcrypt.compareSync(password, hashedPassword);
    if (isPasswordCorrect) {
        res.status(201).json({ message: 'Authentication Successfull!'});
    } else {
        res.status(400).json({ message: 'Incorrect Password' });
    }
});

module.exports = {
    getMatchesByQuery,
    addNewMatch,
    authenticate,
};