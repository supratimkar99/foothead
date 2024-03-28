const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Stage = require('../models/Stage');
const asyncHandler = require('express-async-handler');

// @desc Get all tournaments
// @route GET /tournaments
// @access Public
const getAllTournaments = asyncHandler( async (req, res) => {
    const tournaments = await Tournament.find().lean().exec();
    if (!tournaments?.length) {
        return res.status(400).json({ message: 'No tournaments found' });
    }
    res.json(tournaments);
});

// @desc Create a tournament
// @route POST /tournaments
// @access Private
const createNewTournament = asyncHandler( async(req, res) => {
    // TO-DO: Remove after auto-increment has been implemented
    const {
        name,
        format,
        status,
        stages,
        participants,
        winner,
        runnersUp,
        teamsIncluded,
    } = req.body;

    /**
     * CHECKING DATA
     * Serial Number is an auto-increment field
     * participants must never be empty
     * Completed Tournaments must have winners and runnersUp
     * Each participant, winner and runnersUp must have atleast playerId (teamId is optional)
     * each playerId/teamId 
     */
    if (!name || !Array.isArray(participants) || !participants.length) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    if (status == "COMPLETED" && (!winner || !runnersUp)) {
        return res.status(400).json({ message: 'Missing required fields for a completed tournament' });
    }
    if (status == "COMPLETED" && (!winner.player || !runnersUp.player)) {
        return res.status(400).json({ message: 'Each participant must have a player' });
    }
    const players = await Player.find().select('_id').lean();
    const playerIds = await players.map(obj => obj._id);

    if (status == "COMPLETED" && !playerIds.includes(winner.player)) {
        return res.status(400).json({ message: 'Invalid Winner\'s Player ID' });
    }

    if (status == "COMPLETED" && !playerIds.includes(runnersUp.player)) {
        return res.status(400).json({ message: 'Invalid Runner Up\'s Player ID' });
    }

    let teamIds = [];

    if (teamsIncluded) {
        if (status == "COMPLETED" && (!winner.team || !runnersUp.team)) {
            return res.status(400).json({ message: 'Each participant must have a team' });
        }
        const teams = await Team.find().select('_id').lean();
        teamIds = await teams.map(obj => obj._id);
    
        if (status == "COMPLETED" && !teamIds.includes(winner.team)) {
            return res.status(400).json({ message: 'Invalid Winner\'s Team ID' });
        }
    
        if (status == "COMPLETED" && !teamIds.includes(runnersUp.team)) {
            return res.status(400).json({ message: 'Invalid Runner Up\'s Team ID' });
        }
    }

    for (const participant of participants) {
        if (!participant.player) {
            return res.status(400).json({ message: 'Each participant must have a player' });
        }
        if (!playerIds.includes(participant.player)) {
            return res.status(400).json({ message: 'Invalid Participant\'s Player ID' });
        }
        if (teamsIncluded && !teamIds.includes(participant.team)) {
            return res.status(400).json({ message: 'Invalid Participant\'s Team ID' });
        }
    }

    // Check for duplicates
    const duplicate = await Tournament.findOne({ name }).lean().exec();
    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate tournament name' });
    }

    const stageIds = [];
    // TO-DO: Add Stages Creation
    if (stages && stages.length !== 0) {
        for (const stage of stages) {
            const stageObject = {
                type: stage,
                tournament: name,
            }
            const createdStage = await Stage.create(stageObject);
            stageIds.push(createdStage._id);
        }
    }

    const tournamentObject = { name, format, status, participants, winner, runnersUp, stages: stageIds };

    // Create and store new user
    const tournament = await Tournament.create(tournamentObject);

    if (tournament) {
        res.status(201).json({ message: `New tournament ${name} created`});
    } else {
        res.status(400).json({ message: 'Invalid tournament data received' });
    } 
});

const getTournamentById = asyncHandler( async (req, res) => {
    const tournament = await Tournament.findById(req.params.tournamentId).lean();
    if (!tournament) {
        return res.status(400).json({ message: `Invalid TournamentId ${tournamentId}` });
    }

    let stageDetails = [];
    if(tournament.stages && tournament.stages.length !== 0) {
        for (const stage of tournament.stages) {
            const stageData = await Stage.findById(stage).lean();
            const stageObject = {
                id: stage,
                type: stageData.type,
            }
            stageDetails.push(stageObject);
            tournament.stages = stageDetails;
        }
    }

    if(req.query.getOptions === 'true') {
        let optionsObject = { stages: stageDetails, players: tournament.participants};

        return res.json(optionsObject);
    }

    res.json(tournament);
});

module.exports = {
    getAllTournaments,
    createNewTournament,
    getTournamentById
};
