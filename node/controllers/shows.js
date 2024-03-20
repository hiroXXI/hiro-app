const Word = require('../models/word');
const Comic = require('../models/comic');
const User = require('../models/user');


module.exports.renderShowPage = async (req, res) => {
  const sort = req.query.sort
  const wordsCount = await Word.find({ comic: req.params.comicId });
  const comic = await Comic.findById(req.params.comicId);
  const id = req.params.id
  if(req.query.sort === 'rank') {
    const words = await Word.aggregate([
      { $match: { title: comic.title } },
      { $addFields: { likesCount: { $size: "$likes" } } },  // likes配列の要素数を新しいフィールドとして追加
      { $sort: { "likesCount": -1 } }  // likesCountフィールドを基準に降順でソート
    ]).limit(5);
    if(!req.user) {
      res.render('words/show', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
    } else {
      const userLike = await User.findById(req.user._id).populate('likes')
      const likes = userLike.likes
      res.render('words/show', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
    }
  } else if(req.query.sort === 'new') {
    const words = await Word.find({ comic: req.params.comicId }).sort({ date: -1 }).limit(5);
    if(!req.user) {
      res.render('words/show', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
    } else {
      const userLike = await User.findById(req.user._id).populate('likes')
      const likes = userLike.likes
      res.render('words/show', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
    }
  } else if(req.query.sort === 'old') {
    const words = await Word.find({ comic: req.params.comicId }).sort({ date: 1 }).limit(5);
    if(!req.user) {
      res.render('words/show', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
    } else {
      const userLike = await User.findById(req.user._id).populate('likes')
      const likes = userLike.likes
      res.render('words/show', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
    }
  } else {
    const words = await Word.find({ comic: req.params.comicId }).limit(5);
    if(!req.user) {
      res.render('words/show', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
    } else {
      const userLike = await User.findById(req.user._id).populate('likes')
      const likes = userLike.likes
      res.render('words/show', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
    }
  }
}

module.exports.renderPaginateShowPage = async (req, res) => {
  const sort = req.query.sort
  const wordsCount = await Word.find({ comic: req.params.comicId });
  const comic = await Comic.findById(req.params.comicId);
  const id = req.params.id
  if(parseInt(id) >= 2 && parseInt(id) <= Math.ceil(wordsCount.length / 5)) {
    if(req.query.sort === 'rank') {
      const words = await Word.aggregate([
        { $match: { title: comic.title } },
        { $addFields: { likesCount: { $size: "$likes" } } },  // likes配列の要素数を新しいフィールドとして追加
        { $sort: { "likesCount": -1 } }  // likesCountフィールドを基準に降順でソート
      ]).skip((parseInt(id) - 1) * 5).limit(5);
      if(!req.user) {
        res.render('words/paginateshow', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
      } else {
        const userLike = await User.findById(req.user._id).populate('likes')
        const likes = userLike.likes
        res.render('words/paginateshow', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
      }
    } else if(req.query.sort === 'new') {
      const words = await Word.find({ comic: req.params.comicId }).sort({ date: -1 }).skip((parseInt(id) - 1) * 5).limit(5);
      if(!req.user) {
        res.render('words/paginateshow', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
      } else {
        const userLike = await User.findById(req.user._id).populate('likes')
        const likes = userLike.likes
        res.render('words/paginateshow', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
      }
    } else if(req.query.sort === 'old') {
      const words = await Word.find({ comic: req.params.comicId }).sort({ date: 1 }).skip((parseInt(id) - 1) * 5).limit(5);
      if(!req.user) {
        res.render('words/paginateshow', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
      } else {
        const userLike = await User.findById(req.user._id).populate('likes')
        const likes = userLike.likes
        res.render('words/paginateshow', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
      }
    } else {
      const words = await Word.find({ comic: req.params.comicId }).skip((parseInt(id) - 1) * 5).limit(5);
      if(!req.user) {
        res.render('words/paginateshow', { words: words, comic: comic, sort: sort, wordsCount: wordsCount, id: id });
      } else {
        const userLike = await User.findById(req.user._id).populate('likes')
        const likes = userLike.likes
        res.render('words/paginateshow', { words: words, comic: comic, likes: likes, sort: sort, wordsCount: wordsCount, id: id });
      }
    }
  } else {
    if(req.query.sort === 'rank') {
      res.redirect(`/comics/${comic.id}/words?sort=rank`)
    } else if(req.query.sort === 'new') {
      res.redirect(`/comics/${comic.id}/words?sort=new`)
    } else if(req.query.sort === 'old') {
      res.redirect(`/comics/${comic.id}/words?sort=old`)
    } else {
      res.redirect(`/comics/${comic.id}/words`)
    }
  }  
}
