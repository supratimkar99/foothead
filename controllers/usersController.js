const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler( async (req, res) => {
    /**
     * -password removes the password field from the response
     * lean() makes sure only json data is returned and not the methods associated with it
     */
    // get all users
    const users = await User.find().select('-password').lean();

    // If no users found
    if(!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }

    res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler( async (req, res) => {
    const { username, password, roles } = req.body;

    // Confirming data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Documentation says use exec() when await is used w mongoose methods
    // Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();

    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    // Hashing the password
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = { username, "password": hashedPwd, roles};

    // Create and store new user
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: `New user ${username} created`});
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    } 
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler( async (req, res) => {
    const { id, username, password, roles } = req.body;

    // Confirming data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: "User not found"});
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec();
    // Restrict update if the username is a duplicate of a different player 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate Username'});
    }
    // Allow if the username is of the same user
    user.username = username;
    user.roles = roles;

    if (password) {
        // Hashing the password
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.username} updated`});
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler( async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'User ID Required'});
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User Not Found' });
    }

    const reply = `Username ${result.username} with ID ${result._id} deleted`;

    res.json(reply);
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
};