const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server is running");
    });
  } catch (e) {
    console.log(`An error has occurred: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Get players details
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM cricket_team ORDER BY player_id`;
  const playerList = await db.all(getPlayers);
  response.send(playerList);
});

// Upload player details
app.post("/players", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team (playerName, jerseyNumber, role)
    VALUES (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    );
  `;
  const result = await db.run(addPlayerQuery);
  const player_id = result.lastID;
  response.send("Player Added to Team");
});

// GET playerId
app.get("/players/:playerId/", async (request, response) => {
  const player_id = request.params.playerId;
  const getPlayerDetails = `SELECT * FROM cricket_team WHERE player_id = ${player_id};`;

  const playerInfo = await db.get(getPlayerDetails);
  response.send(playerInfo);
});

// Update player details
app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const player_id = request.params.playerId;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `UPDATE cricket_team
    SET playerName = '${playerName}',
        jerseyNumber = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${player_id};
  `;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// DELETE PLAYER DETAILS
app.delete("/players/:playerId/", async (request, response) => {
  const player_id = request.params.playerId;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = ${player_id};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
