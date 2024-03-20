const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    activeUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    passiveWord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Word'
    }
})

module.exports = mongoose.model('Like', likeSchema)