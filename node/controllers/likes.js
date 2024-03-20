const Word = require('../models/word');
const User = require('../models/user');
const Like = require('../models/like');


module.exports.likeToggle = async (req, res) => {
    const user = await User.findById(req.user._id).populate('likes')
    const userLike = user.likes.some((like) => {
      return like.passiveWord.toString() === req.params.wordId
    })
    if(!userLike) {
      const newLike = new Like();
      const currentUser = req.user._id
      const currentWord = req.params.wordId
      newLike.activeUser = currentUser
      newLike.passiveWord = currentWord
      const like = await newLike.save()
      const user = await User.findById(req.user._id)
      const word = await Word.findById(req.params.wordId)
      user.likes.push(like)
      word.likes.push(like)
      await user.save()
      await word.save()
    } else {
      const likes = await Like.find({passiveWord: req.params.wordId})
      for(let like of likes) {
        if(like.activeUser.toString() === req.user._id) {
          await Word.updateOne({likes: {$in: like._id}}, {
            $pull: { likes: like._id },
          });
          await User.updateOne({likes: {$in: like._id}}, {
            $pull: { likes: like._id },
          });
          await Like.findByIdAndDelete(like._id);
        }
      }
    }
    res.sendStatus(200);
}