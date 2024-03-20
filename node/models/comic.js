const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: String,
    words: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Word'
    }]
})


module.exports = mongoose.model('Comic', comicSchema)