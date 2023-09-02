const Player = require('../models/Player');
const asyncHandler = require('express-async-handler');

// @desc Get all players
// @route GET /players
// @access Public
const getAllPlayers = asyncHandler( async (req, res) => {
    const players = await Player.find().lean();
    if(!players?.length) {
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
    const duplicate = await Player.findOne({ identifier }).lean().exec();

    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate player identifier' });
    }

    const playerObject = { identifier, fullname, activeStatus };

    // Create and store new user
    const player = await Player.create(playerObject);

    if (player) {
        res.status(201).json({ message: `New user ${identifier} created`});
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    } 
});

// @desc Update a player
// @route PATCH /players
// @access Private
const updatePlayer = asyncHandler( async (req, res) => {
    const { id, identifier, fullname, activeStatus } = req.body;

    // Confirming data
    if(!identifier || !fullname || !activeStatus) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const player = await Player.findById(id).exec();

    if (!player) {
        return res.status(400).json({ message: "User not found"});
    }

    // Check for duplicate
    const duplicate = await Player.findOne({ identifier }).lean().exec();
    // Restrict update if the username is a duplicate of a different player 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate Identifier'});
    }
    // Allow if the identifier is of the same player
    player.identifier = identifier;
    player.fullname = fullname;
    player.activeStatus = activeStatus;

    const updatedPlayer = await player.save();

    res.json({ message: `${updatedPlayer.identifier} updated`});
})

module.exports = {
    getAllPlayers,
    addNewPlayer,
    updatePlayer
};