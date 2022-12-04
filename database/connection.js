const config = {};
const pgp = require('pg-promise')(config);

const params = {
  host: 'localhost',
  port: 5432,
  database: 'movies-info',
  user: 'postgres',
  password: 'changeme',
  max: 30
};

const DB = pgp(params);
console.log("Connect to PostgresSQL: " + DB);

module.exports = {
  user: {
    add: async (data) => {
      let res = {};
      try {
        res = await DB.one('INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *',
          [data.uid, data.username, data.password]);
      } catch (ex) {
        console.log(ex);
      }
      return res;
    },
    findByName: async (username) => {
      let user = {};
      try {
        user = await DB.one('SELECT * FROM users WHERE username=$1', [username]);
      } catch (e) {
        console.log(e);
      };
      return user;
    }
  },
  movie: {
    all: async () => {
      let movies = [];
      try {
        movies = await DB.any('SELECT * FROM movies');
      } catch (e) {
        console.log(e);
      }
      return movies;
    },

    findById: async (id) => {
      let movie = {};
      try {
        movie = await DB.one('SELECT * FROM movies WHERE id=$1', [id]);
      } catch (e) {
        console.log(e);
      }
      return movie;
    },

    findByTitle: async (title) => {
      let movies = {};
      try {
        movies = await DB.any('SELECT * FROM movies WHERE title LIKE \'%$1#%\' OR genres LIKE \'%$1#%\'', [title]);
      } catch (e) {
        console.log(e);
      }
      return movies;
    },

    findFavoritesByUserId: async (userId) => {
      let favourites = [];
      try {
        favourites = await DB.any("SELECT * FROM user_favorites WHERE userid=$1", [userId]);
      } catch (e) {
        console.log(e);
      };

      const distinctMovieId = favourites.map(favourite => favourite.movieid)
        .filter((v, i, a) => a.indexOf(v) === i);

      let movies = [];
      for (const movieId of distinctMovieId) {
        let movie = {};
        try {
          movie = await DB.one("SELECT * FROM movies WHERE id=$1", [movieId]);
        } catch (e) {
          console.log(e);
          continue;
        }
        movies.push(movie);
      }
      return movies;
    },
    addFavorites: async (data) => {
      let res = {};
      try {
        res = await DB.one('INSERT INTO user_favorites(id, userId, movieId) VALUES($1, $2, $3) RETURNING *',
          [data.id, data.userId, data.movieId]);
      } catch (e) {
        console.log(e);
      }
      return res;
    },
    removeFavorite: async (id) => {
      try {
        await DB.query('DELETE FROM user_favorites WHERE movieid=$1', [id]);
      } catch (e) {
        console.log(e);
      }
    }
  },
  review: {
    findAllyByMovieId: async (movieId) => {
      let reviews = [];
      try {
        reviews = await DB.any('SELECT * FROM reviews WHERE movieid=$1', [movieId]);
      } catch (e) {
        console.log(e);
      }
      return reviews;
    }
  },
  cast: {
    findById: async (id) => {
      let cast = {};
      try {
        await DB.one('SELECT * FROM casts WHERE id=$1', [id]);
      } catch (e) {
        console.log(e);
      }
      return cast;
    },
    findByName: async (name) => {
      let casts = [];
      try {
        casts = await DB.any('SELECT * FROM casts WHERE name LIKE \'%$1#%\'', [name]);
      } catch (e) {
        console.log(e);
      }
      return casts;
    }
  }
};