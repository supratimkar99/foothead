const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    universe: {
        type: String,
        enum: ['CHOO', 'BEST'],
        default: 'CHOO'
    }
});

module.exports = mongoose.model('Player', PlayerSchema);