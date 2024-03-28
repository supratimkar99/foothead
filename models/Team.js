const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model('Team', teamSchema);