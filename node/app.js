const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const Word = require('./models/word');
const methodOverride = require('method-override');
const multer = require('multer');
require('dotenv').config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Comic = require('./models/comic');
const path = require('path');
const errorAsync = require('./utils/errorAsync');
const { createValidation, editValidation, userValidation } = require('./utils/validation');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MemcachedStore = require('connect-memcached')(session);
const wordsController = require('./controllers/words');
const usersController = require('./controllers/users');
const Like = require('./models/like');
const likesController = require('./controllers/likes');
const crypto = require('crypto')
const showsController = require('./controllers/shows');
const { dbConnection } = require('./models/connection');


dbConnection();

if(process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use(session({
    name: 'customsession',
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    store: new MemcachedStore({
      hosts: process.env.ELASTICACHE
    }),
    cookie: {
      secure: true,
      maxAge: 1000 * 60 * 60,
      httpOnly: true
    }
  }));
} else {
  app.use(session({
    name: 'customsession',
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: true
    }
  }));
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // app.jsを実行したディレクトリにあるviewsディクレトリを探しにいくようにしてる

app.use(express.static(path.join(__dirname, 'scripts')))
app.use(express.urlencoded({ extended: true }));  // フォームからのリクエストのbodyを受け付けるために必要
app.use(methodOverride('_method'));
app.use(passport.authenticate('session'));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.failure = req.flash('error');
  res.locals.currentUser = req.user;
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});
app.use(mongoSanitize());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'script-src': ['self', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', (req, res) => `'nonce-${res.locals.cspNonce}'`],
      'img-src': ['self', 'data:', `https://${process.env.S3BUCKET}.s3.${process.env.REGION}.amazonaws.com`]
    }
  }
}));


// ミドルウェア
const isUser = async (req, res, next) => {
  const word = await Word.findById(req.params.id);
  if(!word.user.equals(req.user._id)) {
    req.flash('error', '権限がありません');
    return res.redirect('/');
  };
  next();
};

passport.use(new LocalStrategy(
  async function verify(username, password, cb) {
    const findUser = await User.findOne({ username: username });
    if(!findUser) {
      return cb(null, false);
    };
    const hash = await bcrypt.compare(password, findUser.password);
    if(!hash) {
      return cb(null, false);
    } else {
      return cb(null, findUser); 
    };
  }
));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { _id: user._id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

const isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    req.flash('error', 'ログインしてください');
    return res.redirect('/login');
  };
  next();
};


// ホーム画面
app.get('/', errorAsync(async (req, res) => {
  const words = await Word.find({}).sort({ date: -1 }).limit(5);
  if(!req.user) {
    res.render('home', { words: words });
  } else {
    const userLike = await User.findById(req.user._id).populate('likes');
    const likes = userLike.likes;
    res.render('home', { words: words, likes: likes });
  };
}));

// 漫画画面
app.get('/comics', errorAsync(async (req, res) => {
  const search = req.query.search
  if(req.query.search || req.query.search === '') {
    const comics = await Comic.find({ title: {$regex: req.query.search} }).sort({ title: 1 });
    res.render('comics/index', { comics: comics, search: search });
  } else {
    const comics = await Comic.find({}).sort({ title: 1 });
    res.render('comics/index', { comics: comics, search: search  });
  }
}));

// 言葉画面
app.get('/comics/:comicId/words', errorAsync(showsController.renderShowPage));
app.get('/comics/:comicId/words/page/:id', errorAsync(showsController.renderPaginateShowPage));

// ユーザ画面
app.get('/signup', usersController.renderSignupForm);

app.post('/signup', userValidation, errorAsync(usersController.createUser));

app.get('/login', usersController.renderLoginForm);

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'ユーザ名またはパスワードが違います' }), usersController.Login);

app.get('/logout', isLoggedIn, usersController.Logout);

app.get('/mypage', isLoggedIn, errorAsync(usersController.renderMypage));

app.get('/comics/words/new', isLoggedIn, wordsController.renderCreateForm);

app.post('/comics/words/new', isLoggedIn, upload.single('word[image]'), createValidation, errorAsync(wordsController.createWord));

app.get('/comics/words/:id/edit', isLoggedIn, isUser, errorAsync(wordsController.renderEditForm));

app.put('/comics/words/:id', isLoggedIn, isUser, upload.single('word[image]'), editValidation, errorAsync(wordsController.editWord));

app.delete('/comics/:comicId/words/:id', isLoggedIn, isUser, errorAsync(wordsController.deleteWord));

app.get('/setting', isLoggedIn, errorAsync(usersController.renderSettingPage));

app.get('/likes', isLoggedIn, errorAsync(usersController.renderLikePage));

app.get('/delete', isLoggedIn, errorAsync(usersController.renderDeleteAccountPage));

app.delete('/delete', isLoggedIn, errorAsync(usersController.deleteAccount));

app.post('/:wordId/like/toggle', isLoggedIn, errorAsync(likesController.likeToggle));


app.all('*', (req, res) => {
  req.flash('error', 'ページが見つかりません');
  res.redirect('/');
})

if(process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    req.flash('error', '無効なページです');
    res.redirect('/');
  });
} else {
  app.use((err, req, res, next) => {
    res.status(500).render('error', { err: err });
  });
};

app.listen(port, () => {
  console.log(`${port}ポートで起動中・・・`);
});