const low = require('lowdb');
const { find, filter } = require('lodash');
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
  if (hasTeam(teamId)) {
    return;
  }

  const newTeam = { id: teamId, sys: teamInfo, users: [], matches: [] };

  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .push(newTeam)
      .write()
      .then(resolve(newTeam))
      .catch(err => reject(err));
  });
}

function hasTeam(teamId) {
  return db.get('teams').find({ id: teamId }).value();
}

function getTeam(teamId) {
  return new Promise((resolve, reject) => {
    if (!db.has('teams').value()) {
      reject('No teams exist yet');
    }
    const team = db.get('teams').find({ id: teamId }).value();
    if (team) {
      resolve(team);
    }
    reject('Team does not exist');
  });
}

function getTeams() {
  return new Promise((resolve, reject) => {
    if (!db.has('teams').value()) {
      reject('No teams exist yet');
    }
    const teams = db.get('teams').value();
    resolve(teams);
  });
}

function addUser(teamId, user) {
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .get('users')
      .push(user)
      .uniqBy('id')
      .write()
      .then(resolve())
      .catch(err => reject(err));
  });
}

function getUsers(teamId) {
  return new Promise((resolve, reject) => {
    const users = db.get('teams').find({ id: teamId }).get('users').value();
    resolve(users);
  });
}

function hasMatch(teamId, matchId) {
  const matches = db.get('teams').find({ id: teamId }).get('matches').value();
  return find(matches, { id: matchId }) || false;
}

function addMatch(teamId, match) {
  db
    .get('teams')
    .find({ id: teamId })
    .get('matches')
    .push(match)
    .uniqBy('id')
    .write();
}

function getMatches(teamId, timestamp) {
  const matches = db
    .get('teams')
    .find({ id: teamId })
    .get('matches')
    .value();
  return filter(matches, { timestamp });
}

module.exports = {
  addTeam,
  hasTeam,
  getTeam,
  getTeams,
  addUser,
  getUsers,
  hasMatch,
  addMatch,
  getMatches
};
