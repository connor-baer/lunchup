const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');
const Cryptr = require('cryptr');

const { cryptrKey } = require('../config.json');

const cryptr = new Cryptr(cryptrKey);

const folder = 'data/';
const db = low(`${folder}db.json`, {
  storage: fileAsync
});

db
  .defaults({
    teams: []
  })
  .write();

function addTeam(teamId, teamInfo) {
  const newTeam = { id: teamId, sys: teamInfo, users: [] };

  return new Promise((resolve, reject) => {
    db.get('teams')
      .push(newTeam)
      .write()
      .then(resolve())
      .catch(err => reject(err));
  });
}

function getTeams() {
  return db.get('teams').value();
}

function addUser(teamId, user) {
  return new Promise((resolve, reject) => {
    db.get('teams')
      .find({ id: teamId })
      .get('users')
      .push(user)
      .write()
      .then(resolve())
      .catch(err => reject(err));
  });
}

module.exports = {
  addTeam,
  getTeams,
  addUser
};
