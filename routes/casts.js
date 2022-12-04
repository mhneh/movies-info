const express = require('express');
const router = express.Router();

const {
  v1: uuid1,
  v4: uuid4,
} = require('uuid');

const DB = require('./../database/connection.js');
const {cast} = require("../database/connection");

router.get('/detail/:id',  async function(req, res) {
  const id = req.params.id;
  const cast = await DB.cast.findById(id);
  console.log(cast);
  if (!cast) {
    res.sendStatus(404);
  };

  res.render("casts/cast", {
    cast: cast,
    isMale: (cast.gender == '0')
  });
});

router.get('/search', async function(req, res) {
  const name = (req.query.name) ? (req.query.name) : "";
  const page = (req.query.page) ? req.query.page : 1;
  const pageSize = 2;
  const casts = await DB.cast.findByName(name);

  const pagingCasts = casts.slice((page - 1) * pageSize, page * pageSize);
  console.log(pagingCasts);

  res.render('casts/search', {
    name: name,
    casts: pagingCasts,
    page: page,
    pageSize: pageSize,
    prevPage: (page == 1) ? +page : (+page - 1),
    nextPage: +page + 1
  })
});

module.exports = router;