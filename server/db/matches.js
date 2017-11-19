import monk from 'monk';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);
const matches = db.get('matches');

getMatches.operation = 'READ';
export function getMatches(teamId) {
  return matches.find({ team_id: teamId });
}

getMatch.operation = 'READ';
getMatch.byId = true;
export function getMatch(_id) {
  return matches.find({ _id });
}

addMatch.operation = 'CREATE';
// addMatch.invalidates = ['getMatches'];
export function addMatch(match) {
  return matches.insert(match);
}

deleteMatch.operation = 'DELETE';
// deleteMatch.invalidates = ['getMatches'];
export function deleteMatch(_id) {
  return matches.remove({ _id });
}
