const mongoose = require('mongoose');
const autoIncrementModel = require('./Counter');

const tournamentSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    format: {
        type: String,
        enum: ['GROUP & KNOCKOUT', 'KNOCKOUT', 'LEAGUE'],
        default: 'GROUP & KNOCKOUT'
    },
    status: {
        type: String,
        enum: ['FUTURE', 'INPROGRESS', 'COMPLETED', 'ABANDONED'],
        defult: 'FUTURE'
    },
    stages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage'
    }],
    participants: [{
        player: {
            type: mongoose.Schema.Types.String,
            ref: 'Player',
            required: true
        },
        team: {
            type: mongoose.Schema.Types.String,
            ref: 'Team',
        }
    }],
    winner: {
        player: {
            type: mongoose.Schema.Types.String,
            ref: 'Player'
        },
        team: {
            type: mongoose.Schema.Types.String,
            ref: 'Team'
        }
    },
    runnersUp: {
        player: {
            type: mongoose.Schema.Types.String,
            ref: 'Player'
        },
        team: {
            type: mongoose.Schema.Types.String,
            ref: 'Team'
        }
    },
});

tournamentSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
        return;
    }
    autoIncrementModel('Tournament', 'serialNumber', this, next);
});

module.exports = mongoose.model('Tournament', tournamentSchema);