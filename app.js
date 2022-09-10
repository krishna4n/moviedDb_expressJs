const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const initiateDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};

initiateDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {};

//Get all movie records
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name FROM movie`;
  const moviesList = await db.all(getMovieQuery);
  const movieArray = moviesList.map((obj) => {
    return {
      movieName: obj.movie_name,
    };
  });
  response.send(movieArray);
});

//Add new movie record
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO 
  movie(director_id,movie_name,lead_actor) 
  values (${directorId},'${movieName}','${leadActor}')`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get a movie record
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const movieDetails = await db.get(getMovieQuery);
  const movieList = {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  };

  response.send(movieList);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `UPDATE movie set director_id =${directorId},movie_name = '${movieName}',lead_actor ='${leadActor}' WHERE movie_id=${movieId} `;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director order by director_id asc`;
  const directorsList = await db.all(getDirectorsQuery);
  const directorsObject = directorsList.map((obj) => {
    return {
      directorId: obj.director_id,
      directorName: obj.director_name,
    };
  });
  response.send(directorsObject);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `select movie_name from director 
  left join movie where director.director_id = director.director_id 
  and director.director_id = ${directorId}; order by movie.movie_id asc`;

  const directorMovies = await db.all(getDirectorQuery);
  const directorObject = directorMovies.map((obj) => {
    return {
      movieName: obj.movie_name,
    };
  });

  response.send(directorObject);
});

module.exports = app;
