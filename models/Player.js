const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true
    },
    activeStatus: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
});

module.exports = mongoose.model('Player', playerSchema);