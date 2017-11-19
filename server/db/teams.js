import monk from 'monk';
import CONFIG from '../../config';
import logger from '../util/logger';

const db = monk(CONFIG.mongodb.url);
const teams = db.get('teams', { castIds: false });

getTeams.operation = 'NO_OPERATION';
export function getTeams() {
  logger.debug('getTeams');
  return teams.find();
}

getTeam.operation = 'READ';
getTeam.byId = true;
export function getTeam(_id) {
  logger.debug('getTeam', _id);
  return teams.findOne({ _id });
}

updateTeam.operation = 'UPDATE';
updateTeam.invalidates = ['getTeams', 'getTeam'];
export function updateTeam(team) {
  logger.debug('updateTeam', team);
  const { _id } = team;
  return teams.update({ _id }, team, {
    upsert: true
  });
}

removeTeam.operation = 'DELETE';
removeTeam.byId = true;
removeTeam.invalidates = ['getTeams', 'getTeam'];
export function removeTeam(_id) {
  logger.debug('removeTeam', _id);
  return teams.remove({ _id });
}
