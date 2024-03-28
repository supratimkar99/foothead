const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
});

counterSchema.index({ _id: 1, seq: 1 }, { unique: true })

const counterModel = mongoose.model('counter', counterSchema);

const autoIncrementModel = async(modelName, fieldName, doc, next) => {
    try {
        /**
         * modelName is the key (ID) here
         * $inc indicates what field to increment and by how much
         * new: return the new value
         * upsert: create document if it doesn't exist
         */
        const counterObject = await counterModel.findByIdAndUpdate(
            modelName,
            { $inc: { count: 1 } },
            { new: true, upsert: true },
        );

        if (counterObject) {
            if (modelName == 'Tournament') {
                doc[fieldName] = counterObject.count;
            }
            next();
        }
    } catch (error) {
        next(error);
    }
};

module.exports = autoIncrementModel;