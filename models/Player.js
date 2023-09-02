const mongoose = require('mongoose')

const PlayerSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
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
})

module.exports = mongoose.model('Player', PlayerSchema)