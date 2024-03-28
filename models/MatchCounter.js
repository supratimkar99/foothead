const mongoose = require('mongoose');

const matchCounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model('MatchCounter', matchCounterSchema);