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
      all: async () => {
        const users = await DB.any('SELECT * FROM users');
        return users;
      },
      add: async (data) => {
        const res = await DB.one('INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *',
          [data.id, data.username, data.password]);
        return res;
      },
      findByName: async (username) => {
        const user = await DB.one('SELECT * FROM users WHERE username=$1', [username]);
        return user;
      }
    },
  movie: {
    all: async () => {
      const movies = await DB.any('SELECT * FROM movies');
      return movies;
    },

    findById: async (id) => {
      const movie = await DB.one('SELECT * FROM movies WHERE id=$1', [id]);
      return movie;
    },

    findByTitle: async (title) => {
      const movies = await DB.any('SELECT * FROM movies WHERE title LIKE \'%$1#%\' OR genres LIKE \'%$1#%\'', [title]);
      return movies;
    },

    findFavoritesByUserId: async (userId) => {
      const favourites = await DB.any("SELECT * FROM user_favorites WHERE userid=$1", [userId]);
      const distinctMovieId = favourites.map(favourite => favourite.movieid)
        .filter((v, i, a) => a.indexOf(v) === i)
      let movies = [];
      for (const movieId of distinctMovieId) {
        const movie = await DB.one("SELECT * FROM movies WHERE id=$1", [movieId]);
        movies.push(movie);
      }
      return movies;
    },
    addFavorites: async (data) => {
      const res = await DB.one('INSERT INTO user_favorites(id, userId, movieId) VALUES($1, $2, $3) RETURNING *',
        [data.id, data.userId, data.movieId]);
      return res;
    },
    removeFavorite: async (id) => {
      await DB.query('DELETE FROM user_favorites WHERE movieid=$1', [id]);
    },
    delete: async (uid) => {
      await DB.query('DELETE FROM products WHERE uid=$1', [uid]);
    }
  },
  productCat: {
    all: async () => {
      const categories = await DB.any('SELECT * FROM product_cats');
      return categories;
    }
  }
};