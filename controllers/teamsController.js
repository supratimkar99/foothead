const Team = require('../models/Team');
const asyncHandler = require('express-async-handler');

// @desc Get all teams
// @route GET /teams
// @access Public
const getAllTeams = asyncHandler( async (req, res) => {
    const teams = await Team.find().lean();
    if(!teams?.length) {
        return res.status(400).json({ message: 'No teams found' })
    }
    res.json(teams);
});

// @desc Add new team
// @route POST /teams
// @access Private
const addNewTeam = asyncHandler( async (req, res) => {
    const { identifier, fullname } = req.body;

    // Confirming data
    if(!identifier || !fullname) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for duplicates
    const duplicate = await Team.findOne({ _id: identifier }).lean().exec();

    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate player identifier' });
    }

    const teamObject = { _id: identifier, fullname };

    // Create and store new team
    const team = await Team.create(teamObject);

    if (team) {
        res.status(201).json({ message: `New team ${fullname} created`});
    } else {
        res.status(400).json({ message: 'Invalid team data received' });
    } 
});

// @desc Update a team
// @route PATCH /teams
// @access Private
const updateTeam = asyncHandler( async (req, res) => {
    // const { id, identifier, fullname, activeStatus } = req.body;

    // // Confirming data
    // if(!identifier || !fullname || !activeStatus) {
    //     return res.status(400).json({ message: 'Missing required fields' });
    // }

    // const player = await Player.findById(id).exec();

    // if (!player) {
    //     return res.status(400).json({ message: "User not found"});
    // }

    // // Check for duplicate
    // const duplicate = await Player.findOne({ identifier }).lean().exec();
    // // Restrict update if the username is a duplicate of a different player 
    // if (duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate Identifier'});
    // }
    // // Allow if the identifier is of the same player
    // player.identifier = identifier;
    // player.fullname = fullname;
    // player.activeStatus = activeStatus;

    // const updatedPlayer = await player.save();

    // res.json({ message: `${updatedPlayer.identifier} updated`});
})

module.exports = {
    getAllTeams,
    addNewTeam,
    updateTeam
};