const express = require('express');
const router = express.Router();

const {
  v1: uuid1,
  v4: uuid4,
} = require('uuid');
const formidable = require('formidable');

const DB = require('./../database/connection.js');

router.get('/import', function(req, res) {
  res.render('movies/import');
});

router.post('/import', function(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log(require(files.movies.filepath));
    res.redirect("/movies/import");
  });
});

router.get('/favorites', async function (req, res) {
  const data = await DB.movie.findFavoritesByUserId(req.session.uid);
  res.render("movies/favorites", {movies: data});
});

router.get('/favorites/:id', async function (req, res) {
  const data = {
    id: uuid4(),
    userId: req.session.uid,
    movieId: req.params.id
  }

  await DB.movie.addFavorites(data);
  res.redirect('/movies/favorites');
})

router.get('/favorites/remove/:id', async function (req, res) {
  await DB.movie.removeFavorite(req.params.id);
  res.redirect('/movies/favorites');
});

router.get('/search', async function (req, res) {
  const page = (req.query.page) ? req.query.page : 1;
  const pageSize = 4;
  const titleSample = req.query.movieName;
  const movies = await DB.movie.findByTitle(titleSample);
  const pagingMovies = movies.slice((page - 1) * pageSize, page * pageSize);

  res.render('movies/search', {
    titleSample: titleSample,
    movies: pagingMovies,
    page: page,
    pageSize: pageSize,
    prevPage: (page == 1) ? +page : (+page - 1),
    nextPage: +page + 1
  });
});

router.get('/detail/:id', async function(req, res) {
  const movie = await DB.movie.findById(req.params.id);
  const reviews = await DB.review.findAllyByMovieId(movie.id);
  res.render("movies/detail", {
    movie: movie,
    reviews: reviews,
    page: 1
  });
});

router.get('/:id/reviews', async function (req, res) {
  const page = (req.query.page) ? req.query.page : 1;
  const pageSize = 2;
  const reviews = await DB.review.findAllyByMovieId(req.params.id);
  const pagingReviews = reviews.slice((page - 1) * pageSize, page * pageSize);
  res.send(pagingReviews);
});

module.exports = router;

