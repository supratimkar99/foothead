const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    tournamentId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    format: {
        type: String,
        enum: ['GROUP & KNOCKOUT', 'KNOCKOUT', 'LEAGUE'],
        default: 'GROUP & KNOCKOUT'
    },
    participants: [{
        player: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Player'
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Team'
        }
    }],
    winner: {
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        }
    },
    runnersUp: {
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        }
    },
    status: {
        type: String,
        enum: ['FUTURE', 'INPROGRESS', 'COMPLETED', 'ABANDONED'],
        defult: 'FUTURE'
    }
});

module.exports = mongoose.model('Tournament', TournamentSchema);