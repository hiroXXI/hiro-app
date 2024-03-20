const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    title: String,
    human: String,
    number: {
        type: Number,
        min: 0
    },
    word: String,
    image: String,
    date: {
        type: Date,
        default: function () {
            return Date.now() + (1000 * 60 * 60 * 9)  // 日本時間に変換
        }
    },
    comic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comic'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }]
})

module.exports = mongoose.model('Word', wordSchema)