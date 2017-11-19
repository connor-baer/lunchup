import low from 'lowdb';
import { find, filter } from 'lodash';
import fileAsync from 'lowdb/lib/storages/file-async';

const db = low(`data/db.json`, {
  storage: fileAsync
});

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
