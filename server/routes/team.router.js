const express = require('express');
const pool = require('../modules/pool');
const {rejectUnauthenticated} = require('../modules/authentication-middleware');
const router = express.Router();

router.get('/all', (req, res) => {
  if(!req.isAuthenticated()) {
    res.sendStatus(403)
    return;
  }

  const teamQuery = `SELECT "team".name, "team".id
    FROM "team"
    JOIN "connection" ON "connection".team_id = "team".id
    FULL OUTER JOIN "user" ON "user".id = "connection".user_id
    WHERE "user".id = $1`
  ;

  const teamId = req.user.id;

  pool
    .query(teamQuery, [teamId])
    .then((result) => {
      res.send(result.rows);
    })
    .catch(error => {
      console.log('Error getting teams', error);
      res.sendStatus(500)
    })
})

router.post('/', (req, res) => {
  const teamName = req.body.name;

  const teamQuery = `INSERT INTO "team" ("name")
    VALUES ($1)`;
  pool
    .query(teamQuery, [teamName])
    .then(() => res.sendStatus(201))
    .catch((err) => {
      console.log('Team registration failed: ', err);
      res.sendStatus(500);
    });
});

module.exports = router;