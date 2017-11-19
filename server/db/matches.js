import monk from 'monk';
import { addMongoDbId } from '../util/addMongoDbId';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);

const matches = db.get('matches');

getMatches.operation = 'READ';
export function getMatches(teamId) {
  return matches.find({ teamId });
}

getMatch.operation = 'READ';
getMatch.byId = true;
export function getMatch(teamId, matchId) {
  const _id = `${teamId}${matchId}`;
  return matches.find({ _id });
}

addMatch.operation = 'CREATE';
// addMatch.invalidates = ['getMatches'];
export function addMatch(match) {
  const matchWithId = addMongoDbId(match, ['team_id', 'id']);
  return matches.insert(matchWithId);
}

deleteMatch.operation = 'DELETE';
// deleteMatch.invalidates = ['getMatches'];
export function deleteMatch(teamId, matchId) {
  const _id = `${teamId}${matchId}`;
  return matches.remove({ _id });
}
