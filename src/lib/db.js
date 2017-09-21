import low from 'lowdb';
import { find, filter, isEmpty } from 'lodash';
import fileAsync from 'lowdb/lib/storages/file-async';
import Cryptr from 'cryptr';

import { cryptrKey } from '../../config.json';

let format;

if (cryptrKey) {
  const cryptr = new Cryptr(cryptrKey);
  format = {
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
  };
}

const folder = 'data/';
const db = low(`${folder}db.json`, {
  storage: fileAsync,
  format
});

db
  .defaults({
    teams: []
  })
  .write();

export function addTeam(teamId, teamInfo) {
  if (hasTeam(teamId)) {
    return updateTeam(teamId, teamInfo);
  }

  return new Promise((resolve, reject) => {
    if (!teamId) {
      return reject('Team id not provided.');
    }

    if (isEmpty(teamInfo)) {
      return reject('Team info not provided.');
    }

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
      .then(() => resolve(true))
      .catch(err => reject(err));
  });
}

export function updateTeam(teamId, teamInfo) {
  return new Promise((resolve, reject) => {
    if (!teamId) {
      return reject('Team id not provided.');
    }

    if (isEmpty(teamInfo)) {
      return reject('Team info not provided.');
    }

    db
      .get('teams')
      .find({ id: teamId })
      .assign({ sys: teamInfo })
      .write()
      .then(() => resolve(true))
      .catch(err => reject(err));
  });
}

export function hasTeam(teamId) {
  return db
    .get('teams')
    .find({ id: teamId })
    .value();
}

export function getTeam(teamId) {
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

export function getTeams() {
  return new Promise((resolve, reject) => {
    if (!db.has('teams').value()) {
      return reject('No teams exist yet');
    }
    const teams = db.get('teams').value();
    return resolve(teams);
  });
}

export function addUser(teamId, user) {
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

export function updateUser(teamId, userId, updates = {}) {
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

export function removeUser(teamId, userId) {
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

export function hasUser(teamId, userId) {
  const users = db
    .get('teams')
    .find({ id: teamId })
    .get('users')
    .value();
  return find(users, { id: userId }) || false;
}

export function getUsers(teamId) {
  return new Promise((resolve, reject) => {
    const users = db
      .get('teams')
      .find({ id: teamId })
      .get('users')
      .value();
    if (!users) {
      return reject('No users exist yet');
    }
    return resolve(users);
  });
}

export function addLocation(teamId, location) {
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

export function removeLocation(teamId, location) {
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

export function getLocations(teamId) {
  return new Promise(resolve => {
    const locations = db
      .get('teams')
      .find({ id: teamId })
      .get('locations')
      .value();
    return resolve(locations);
  });
}

export function hasMatch(teamId, matchId) {
  const matches = db
    .get('teams')
    .find({ id: teamId })
    .get('matches')
    .value();
  return find(matches, { id: matchId }) || false;
}

export function addMatch(teamId, match) {
  db
    .get('teams')
    .find({ id: teamId })
    .get('matches')
    .push(match)
    .uniqBy('id')
    .write();
}

export function getMatches(teamId, timestamp) {
  const matches = db
    .get('teams')
    .find({ id: teamId })
    .get('matches')
    .value();
  return filter(matches, { timestamp });
}
