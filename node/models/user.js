const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        minLength: 8
    },
    words: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Word'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }]
})

module.exports = mongoose.model('User', userSchema)