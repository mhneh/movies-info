var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const castRouter = require('./routes/casts');

var app = express();

const session = require('express-session');
const {cast} = require("./database/connection");
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  const uid = req.cookies.uid;
  const username = req.cookies.username;
  if (uid || username) {
    req.session.uid = uid;
    req.session.username = username;
    res.locals.loggedIn = true;
  }
  next();
});

function needLogin(req, res, next) {
  const uid = req.cookies.uid;
  const username = req.cookies.username;
  if (!uid || !username) {
    res.status(403);
    res.render('error');
  };
  next();
}

app.use('/', indexRouter);
app.use('/movies', needLogin, movieRouter);
app.use('/casts', needLogin, castRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
