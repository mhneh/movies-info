var express = require('express');
var router = express.Router();
const cryptoJS = require("crypto-js");
const {
  v1: uuid1,
  v4: uuid4,
} = require('uuid');

const DB = require('./../database/connection.js');
const hashLength = 64;

/* GET home page. */
router.get('/', async function(req, res, next) {
  const movies = await DB.movie.all();
  console.log(movies);
  const bestRating = movies.map(movie => movie.rating).reduce(function(prev, current) {
    return (prev.y > current.y) ? prev : current;
  });
  console.log(bestRating);
  const bestRatingMovies = movies.filter(movie => movie.rating == bestRating);
  res.render('index', { movies: bestRatingMovies });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const user = await DB.user.findByName(username);
  if (!user) {
    res.redirect('/login?error=1');
  }
  const userPassword = user.password;
  const salt = userPassword.slice(hashLength);
  const pwSalt = password + salt;
  const pwHashed = cryptoJS.SHA3(pwSalt, {outputLength: hashLength * 4}).toString(cryptoJS.enc.Hex);
  if (userPassword != (pwHashed + salt)) {
    res.redirect('/login?error=2');
    return;
  }

  if (req.body.rmbme) {
    res.cookie('uid', user.id);
    res.cookie('username', user.username);
  } else {
    res.clearCookie('uid');
    res.clearCookie('username');
  }
  req.session.uid = user.id;
  req.session.username = user.username;

  res.redirect('/');
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/register', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const salt = Date.now().toString(16);
  const passwordSalt = password + salt;
  const pwHashed = cryptoJS.SHA3(passwordSalt, {outputLength: hashLength * 4})
    .toString(cryptoJS.enc.Hex);
  const user = {
    uid: uuid4(),
    username: username,
    password: pwHashed + salt
  };
  const newUser = await DB.user.add(user);
  res.redirect('/login');
});

router.get('/logout', function (req, res) {
  delete req.session.uid;
  delete req.session.username;
  res.clearCookie('uid');
  res.clearCookie('username');

  res.redirect("/login");
})

module.exports = router;
