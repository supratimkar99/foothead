const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['GROUP_STAGE', 'LEAGUE', "QUARTER_FINAL", "SEMI_FINAL", "FINAL"],
        required: true
    },
    tournament: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Stage', stageSchema);