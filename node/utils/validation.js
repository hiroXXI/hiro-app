const Joi = require('joi');
const Word = require('../models/word');
const User = require('../models/user');

createWordSchema = Joi.object({
    word: Joi.object({
        title: Joi.string().trim().required(),  // 前後のスペースを削除する
        human: Joi.string().required(),
        number: Joi.number().required().min(0),
        word: Joi.string().required()
    }).required()
});

createFileSchema = Joi.object({
    originalname: Joi.string().required()
}).unknown(true);  // originalname以外は無視

editSchema = Joi.object({  // 画像はあってもなくてもどちらでも問題ない
    word: Joi.object({
        title: Joi.string().forbidden(),  // タイトルは変更させない
        human: Joi.string().required(),
        number: Joi.number().required().min(0),
        word: Joi.string().required()
    }).required()
});

userSchema = Joi.object({
    username: Joi.string().trim().required(),  // 前後のスペースを削除する
    password: Joi.string().required().min(8),
    repassword: Joi.string().required()
});


module.exports.createValidation = (req, res, next) => {
    const bodyError = createWordSchema.validate(req.body).error;
    const fileError = createFileSchema.validate(req.file).error;
    if(bodyError || fileError) {
      req.flash('error', '無効なデータです。投稿内容を見直してください');
      return res.redirect('/comics/words/new');
    } else {
      req.validationTitle = createWordSchema.validate(req.body).value.word.title
      next();
    };
};

module.exports.editValidation = async (req, res, next) => {
    const bodyError = editSchema.validate(req.body).error;
    if(bodyError) {
      const word = await Word.findById(req.params.id);
      req.flash('error', '無効なデータです。更新内容を見直してください');
      return res.redirect(`/comics/words/${word._id}/edit`);
    } else {
      next();
    };
};
  
module.exports.userValidation = async (req, res, next) => {
    req.body.username = userSchema.validate(req.body).value.username
    const findUser = await User.findOne({username: req.body.username})
    if(findUser) {
      req.flash('error', `ユーザ名 ${req.body.username} が既に使用されています`);
      return res.redirect("/signup");
    }
    if(req.body.username.length < 2) {
      req.flash('error', 'ユーザ名が短すぎます。2文字以上のユーザ名にしてください');
      return res.redirect("/signup");
    }
    const regex = new RegExp('^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$')
    if(req.body.password.length < 8 || !regex.test(req.body.password)) {
      req.flash('error', 'パスワードは8文字以上の英数字にしてください');
      return res.redirect("/signup");
    }
    if(req.body.password !== req.body.repassword) {
      req.flash('error', 'パスワードとパスワード再入力が一致していません');
      return res.redirect("/signup");
    }
    const bodyError = userSchema.validate(req.body).error;
    if(bodyError) {
      req.flash('error', '無効なデータです。登録内容を見直してください');
      return res.redirect('/signup');
    } else {
      req.validationUsername = userSchema.validate(req.body).value.username
      next();
    };
};
