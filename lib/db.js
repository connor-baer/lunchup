const _ = require('lodash');
const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');
const Cryptr = require('cryptr');

const { cryptrKey } = require('../config.json');
const cryptr = new Cryptr(cryptrKey);

const folder = 'data/';
const db = low(`${folder}db.json`, {
  storage: fileAsync,
  format: {
    deserialize: (str) => {
      const decrypted = cryptr.decrypt(str)
      const obj = JSON.parse(decrypted)
      return obj
    },
    serialize: (obj) => {
      const str = JSON.stringify(obj)
      const encrypted = cryptr.encrypt(str)
      return encrypted
    }
  }
});

db
  .defaults({
    teams: []
  })
  .write();

function getItems(fileName) {

}

function addTeam(teamId, teamInfo) {
  const newTeam = { [teamId]: teamInfo };
  db.get('teams').push(newStudent).write();
}

function removeItem(fileName, id) {

}

function updateItem(fileName, id) {

}

module.exports = {
  getItems,
  addTeam,
  removeItem,
  updateItem
};
