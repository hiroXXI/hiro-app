const Word = require('../models/word');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const Comic = require('../models/comic');
const User = require('../models/user');
const Like = require('../models/like');


const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESSKEY,
      secretAccessKey: process.env.SECRETKEY,
    },
  });


module.exports.renderCreateForm = (req, res) => {
    res.render("words/new");
}

module.exports.createWord = async (req, res) => {
    const file = req.file;
    req.body.word.title = req.validationTitle
    const params = {
      Bucket: process.env.S3BUCKET,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await s3Client.send(new PutObjectCommand(params));
    const imageUrl = `https://${params.Bucket}.s3.${process.env.REGION}.amazonaws.com/${params.Key}`;
    const word = new Word(req.body.word);
    word.image = imageUrl;
    const comic = await Comic.findOne({ title: word.title });
    if (!comic) {
      const newComic = new Comic();
      newComic.title = word.title;
      newComic.words.push(word);
      await newComic.save();
      word.comic = await Comic.findOne({ title: word.title });
      word.user = req.user._id
      await word.save();
      const user = await User.findOne({username: req.user.username})
      user.words.push(word)
      await user.save()
    } else {
      comic.words.push(word);
      await comic.save();
      word.comic = comic;
      word.user = req.user._id
      await word.save();
      const user = await User.findOne({username: req.user.username})
      user.words.push(word)
      await user.save()
    }
    req.flash('success', '新しい言葉を投稿しました');
    res.redirect("/mypage");
}

module.exports.renderEditForm = async (req, res, next) => {
    const word = await Word.findById(req.params.id);
    res.render("words/edit", { word: word });
}

module.exports.editWord = async (req, res) => {
    const file = req.file;
    if (file) {
      const params = {
        Bucket: process.env.S3BUCKET,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const imageUrl = `https://${params.Bucket}.s3.${process.env.REGION}.amazonaws.com/${params.Key}`;
      const word = await Word.findByIdAndUpdate(req.params.id, {
        human: req.body.word.human,
        number: req.body.word.number,
        word: req.body.word.word,
        image: imageUrl,
      });
      await s3Client.send(new PutObjectCommand(params));
    } else {
      await Word.findByIdAndUpdate(req.params.id, {
        human: req.body.word.human,
        number: req.body.word.number,
        word: req.body.word.word,
      });
    }
    req.flash('success', '言葉を更新しました')
    res.redirect("/mypage");
}

module.exports.deleteWord = async (req, res) => {
    const comic = await Comic.findByIdAndUpdate(req.params.comicId, {
      $pull: { words: req.params.id },
    }, { new: true });
    if(!comic.words.length) {
      await Comic.deleteOne({_id: comic._id})
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { words: req.params.id },
    });
    const likes = await Like.find({passiveWord: req.params.id})
    for(let like of likes) {
      await User.updateOne({likes: {$in: like._id}}, {
        $pull: { likes: like._id },
      });
    }
    await Like.deleteMany({passiveWord: req.params.id})
    await Word.findByIdAndDelete(req.params.id);
    req.flash('success', '言葉を削除しました')
    res.redirect("/mypage");
}