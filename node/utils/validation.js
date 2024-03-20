const Joi = require('joi');

module.exports.createWordSchema = Joi.object({
    word: Joi.object({
        title: Joi.string().trim().required(),  // 前後のスペースを削除する
        human: Joi.string().required(),
        number: Joi.number().required().min(0),
        word: Joi.string().required()
    }).required()
});

module.exports.createFileSchema = Joi.object({
    originalname: Joi.string().required()
}).unknown(true);  // originalname以外は無視

module.exports.editSchema = Joi.object({  // 画像はあってもなくてもどちらでも問題ない
    word: Joi.object({
        title: Joi.string().forbidden(),  // タイトルは変更させない
        human: Joi.string().required(),
        number: Joi.number().required().min(0),
        word: Joi.string().required()
    }).required()
});

module.exports.userSchema = Joi.object({
    username: Joi.string().trim().required(),  // 前後のスペースを削除する
    password: Joi.string().required().min(8),
    repassword: Joi.string().required()
});