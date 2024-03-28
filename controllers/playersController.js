const Player = require('../models/Player');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const asyncHandler = require('express-async-handler');

// @desc Get all players
// @route GET /players
// @access Public
const getAllPlayers = asyncHandler( async (req, res) => {
    let player = null;
    if (req.query.onlyActive === 'true') {
        const query = { activeStatus: 'ACTIVE' };
        players = await Player.find(query).select('-activeStatus').lean().exec();
    } else {
        players = await Player.find().lean();
    }
    if (!players?.length) {
        return res.status(400).json({ message: 'No players found' })
    }
    res.json(players);
});

// @desc Add new player
// @route POST /players
// @access Private
const addNewPlayer = asyncHandler( async (req, res) => {
    const { identifier, fullname, activeStatus } = req.body;

    // Confirming data
    if(!identifier || !fullname) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for duplicates
    const duplicate = await Player.findById(identifier).lean().exec();

    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate player identifier' });
    }

    const playerObject = { _id: identifier, fullname, activeStatus };

    // Create and store new player
    const player = await Player.create(playerObject);

    if (player) {
        res.status(201).json({ message: `New player ${identifier} created`});
    } else {
        res.status(400).json({ message: 'Invalid player data received' });
    } 
});

// @desc Update a player
// @route PATCH /players
// @access Private
const updatePlayer = asyncHandler( async (req, res) => {
    const { identifier, fullname, activeStatus } = req.body;

    // Confirming data
    if(!identifier || !fullname || !activeStatus) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const player = await Player.findById(identifier).exec();

    if (!player) {
        return res.status(400).json({ message: "Player not found"});
    }

    player.fullname = fullname;
    player.activeStatus = activeStatus;

    const updatedPlayer = await player.save();

    res.json({ message: `${updatedPlayer._id} updated`});
})

const getPlayerById = asyncHandler( async (req, res) => {
    const player = await Player.findById(req.params.playerId).lean();
    if (!player) {
        return res.status(400).json({ message: "Player not found"});
    }
    if (req.query.includeTourDetails !== 'true') {
        return res.json(player);
    }
    const tournaments = await Tournament.find().lean();
    let toursPlayed = 0;
    let toursWon = 0;
    let tourFinals = 0;
    let trophiesWon = [];
    let finalsReached = [];
    if(tournaments && tournaments.length) {
        for (const tournament of tournaments) {
            if (tournament.status === 'ABANDONED') {
                continue;
            }
            if (tournament.winner && tournament.winner.player === req.params.playerId) {
                toursPlayed = toursPlayed + 1;
                toursWon = toursWon + 1;
                tourFinals = tourFinals + 1;
                trophiesWon.push(tournament.name);
            } else if (tournament.runnersUp && tournament.runnersUp.player === req.params.playerId) {
                toursPlayed = toursPlayed + 1;
                tourFinals = tourFinals + 1;
                finalsReached.push(tournament.name);
            } else {
                for (const participantsData of tournament.participants) {
                    if (participantsData.player === req.params.playerId) {
                        toursPlayed = toursPlayed + 1;
                        break;
                    }
                }
            }
        }
    }
    const tournamentsData = {
        played: toursPlayed,
        won: toursWon,
        finalist: tourFinals,
        trophies: trophiesWon,
        finals: finalsReached,
    }
    player.tournamentsData = tournamentsData;
    res.json(player);
});

const getMatchStatsByPlayerId = asyncHandler( async(req, res) => {
    const playerId = req.params.playerId;
    matches = await Match.find({
        $or: [
            { 'scoreline.home.player': playerId },
            { 'scoreline.away.player': playerId }
        ]
    }).sort({ identifier: -1 }).lean().exec();

    if (!matches) {
        return res.status(400).json({ message: `No matches found for playerId: ${playerId}`});
    }

    const totalMatchesN = matches.length;
    let matchesWonN = 0, matchesLostN = 0, matchesDrawnN = 0, nGA = 0, nGF = 0;

    const playerTeamMap = new Map();

    for (const match of matches) {
        if (!match.winner) {
            matchesDrawnN = matchesDrawnN + 1;
        } else if (match.winner.player === playerId) {
            matchesWonN = matchesWonN + 1;
        } else {
            matchesLostN = matchesLostN + 1;
        }

        if (match.scoreline.home.player === playerId) {

            const tempKey = match.scoreline.home.team;
            if (match.scoreline.home.team) {
                if (playerTeamMap.has(tempKey)) {
                    // Key exists, increment its value
                    const currentValue = playerTeamMap.get(tempKey);
                    playerTeamMap.set(tempKey, currentValue + 1);
                } else {
                    // Key does not exist, set value to 1
                    playerTeamMap.set(tempKey, 1);
                }
            }

            nGF = nGF + match.scoreline.home.score;
            nGA = nGA + match.scoreline.away.score;
        } else {
            nGF = nGF + match.scoreline.away.score;
            nGA = nGA + match.scoreline.home.score;
        }
    }

    const favTeam = {
        id: null,
        value: 0,
    }
    for (const [key, value] of playerTeamMap.entries()) {
        if (value > favTeam.value) {
            favTeam.id = key;
            favTeam.value = value;
        }
    }

    const responseObject = {
        played: totalMatchesN,
        winPercent: ((matchesWonN/totalMatchesN) * 100).toFixed(2),
        favTeam: favTeam.id,
        won: matchesWonN,
        drawn: matchesDrawnN,
        lost: matchesLostN,
        goalsFor: nGF,
        goalsAgainst: nGA,
        goalDifference: nGF - nGA,
    }
    res.json(responseObject);
});

module.exports = {
    getAllPlayers,
    addNewPlayer,
    updatePlayer,
    getPlayerById,
    getMatchStatsByPlayerId
};