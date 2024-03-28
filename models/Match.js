const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    scoreline: {
        home: {
            player: {
                type: String,
                ref: 'Player'
            },
            team: {
                type: String,
                ref: 'Team'
            },
            score: {
                type: Number,
            }
        },
        away:  {
            player: {
                type: String,
                ref: 'Player'
            },
            team: {
                type: String,
                ref: 'Team'
            },
            score: {
                type: Number,
            }
        },
    },
    winner: {
        player: {
            type: String,
            ref: 'Player'
        },
        team: {
            type: String,
            ref: 'Team'
        }
    },
    stage: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stage',
            required: true,
        },
        name: {
            type: String
        }
    },
    tournament: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tournament',
            required: true,
        },
        name: {
            type: String
        }
    }
});

module.exports = mongoose.model('Match', matchSchema);