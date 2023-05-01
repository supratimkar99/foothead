const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    shortname: {
        type: String,
        required: true
    },
    legacyName: {
        type: String,
        default: 'N/A'
    },
    universe: {
        type: String,
        enum: ['CHOO', 'BEST'],
        default: 'CHOO'
    }
});

module.exports = mongoose.model('Team', TeamSchema);