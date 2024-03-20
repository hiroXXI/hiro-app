const Word = require('../models/word');
const Comic = require('../models/comic');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const Like = require('../models/like');


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
}

module.exports.createUser = async (req, res) => {
    req.body.username = req.validationUsername
    const hash = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      username: req.body.username,
      password: hash
    })
    const user = await newUser.save()
    req.login(user, function() {
      req.flash('success', '登録ありがとう！');
      res.redirect("/mypage");
    })
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.Login = (req, res) => {
    req.flash('success', 'おかえりなさい');
    res.redirect("/mypage");
}

module.exports.Logout = (req, res) => {
    req.logout(function() {
      req.flash('success', 'ログアウトしました');
      res.redirect("/");
    })
}

module.exports.renderMypage = async (req, res) => {
    const words = await Word.find({user: req.user._id});
    const user = await User.findById(req.user._id);
    res.render("users/mypage", { words: words, user: user });
}

module.exports.renderSettingPage = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/setting", { user: user })
}

module.exports.renderDeleteAccountPage = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/delete", { user: user })
}

module.exports.deleteAccount = async (req, res) => {
    const words = await Word.find({user: req.user._id});
    for(let word of words) {
      const comic = await Comic.findOneAndUpdate({words: {$in: word._id}}, {
        $pull: { words: word._id },
      }, { new: true });
      if(!comic.words.length) {
        await Comic.deleteOne({_id: comic._id})
      }
      const wordLikes = await Like.find({passiveWord: word._id});
      for(let like of wordLikes) {
        await User.updateOne({likes: {$in: like._id}}, {
          $pull: { likes: like._id },
        });
      }
      await Like.deleteMany({passiveWord: word._id})
    }
    const userLikes = await Like.find({activeUser: req.user._id})
    for(let like of userLikes) {
      await Word.updateOne({likes: {$in: like._id}}, {
        $pull: { likes: like._id },
      });
    }
    await Word.deleteMany({user: req.user._id});
    await Like.deleteMany({activeUser: req.user._id})
    await User.findByIdAndDelete(req.user._id);
    req.logout(function() {
      req.flash('success', 'アカウントを削除しました')
      res.redirect("/")
    })
}

module.exports.renderLikePage = async (req, res) => {
  const words = await Like.find({ activeUser: req.user._id }).populate('passiveWord')
  const user = await User.findById(req.user._id).populate('likes')
  const likes = user.likes
  res.render('users/like', { words: words, likes: likes, user: user })
}