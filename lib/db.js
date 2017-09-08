const low = require('lowdb');
const { find, filter } = require('lodash');
const fileAsync = require('lowdb/lib/storages/file-async');
const Cryptr = require('cryptr');

const { cryptrKey } = require('../config.json');

const cryptr = new Cryptr(cryptrKey);

const folder = 'data/';
const db = low(`${folder}db.json`, {
  storage: fileAsync,
  format: {
    deserialize: str => {
      const decrypted = cryptr.decrypt(str);
      const obj = JSON.parse(decrypted);
      return obj;
    },
    serialize: obj => {
      const str = JSON.stringify(obj);
      const encrypted = cryptr.encrypt(str);
      return encrypted;
    }
  }
});

db
  .defaults({
    teams: []
  })
  .write();

function addTeam(teamId, teamInfo) {
  if (hasTeam(teamId)) {
    return updateTeam(teamId, teamInfo);
  }

  return new Promise((resolve, reject) => {
    const newTeam = {
      id: teamId,
      sys: teamInfo,
      users: [],
      matches: [],
      locations: []
    };

    db
      .get('teams')
      .push(newTeam)
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function updateTeam(teamId, teamInfo) {
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .assign({ sys: teamInfo })
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function hasTeam(teamId) {
  return db
    .get('teams')
    .find({ id: teamId })
    .value();
}

function getTeam(teamId) {
  return new Promise((resolve, reject) => {
    if (!db.has('teams').value()) {
      return reject('No teams exist yet');
    }
    const team = db
      .get('teams')
      .find({ id: teamId })
      .value();
    if (!team) {
      return reject('Team does not exist');
    }
    return resolve(team);
  });
}

function getTeams() {
  return new Promise((resolve, reject) => {
    if (!db.has('teams').value()) {
      return reject('No teams exist yet');
    }
    const teams = db.get('teams').value();
    return resolve(teams);
  });
}

function addUser(teamId, user) {
  if (hasUser(teamId, user.id)) {
    return updateUser(teamId, user.id, user);
  }
  const newUser = Object.assign(user, {
    location: '',
    active: true,
    snooze: false
  });
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .get('users')
      .push(newUser)
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function updateUser(teamId, userId, updates = {}) {
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .get('users')
      .find({ id: userId })
      .assign(updates)
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function removeUser(teamId, userId) {
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .get('users')
      .find({ id: userId })
      .assign({ active: false, snooze: false })
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function hasUser(teamId, userId) {
  const users = db
    .get('teams')
    .find({ id: teamId })
    .get('users')
    .value();
  return find(users, { id: userId }) || false;
}

function getUsers(teamId) {
  return new Promise((resolve, reject) => {
    const users = db
      .get('teams')
      .find({ id: teamId })
      .get('users')
      .value();
    return resolve(users);
  });
}

function addLocation(teamId, location) {
  const newLocation = { city: encodeURI(location) };
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .get('locations')
      .push(newLocation)
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function removeLocation(teamId, location) {
  const oldLocation = { city: encodeURI(location) };
  return new Promise((resolve, reject) => {
    db
      .get('teams')
      .find({ id: teamId })
      .get('locations')
      .remove(oldLocation)
      .write()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function getLocations(teamId) {
  return new Promise((resolve, reject) => {
    const locations = db
      .get('teams')
      .find({ id: teamId })
      .get('locations')
      .value();
    return resolve(locations);
  });
}

function hasMatch(teamId, matchId) {
  const matches = db
    .get('teams')
    .find({ id: teamId })
    .get('matches')
    .value();
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
  updateTeam,
  hasTeam,
  getTeam,
  getTeams,
  addUser,
  updateUser,
  removeUser,
  hasUser,
  getUsers,
  addLocation,
  removeLocation,
  getLocations,
  hasMatch,
  addMatch,
  getMatches
};
