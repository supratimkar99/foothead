const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Team', TeamSchema);