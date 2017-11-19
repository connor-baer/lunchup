import monk from 'monk';
import CONFIG from '../../config';
import logger from '../util/logger';

const db = monk(CONFIG.mongodb.url);
const groups = db.get('groups', { castIds: false });

getGroups.operation = 'READ';
export function getGroups(teamId) {
  logger.debug('getGroups', teamId);
  return groups.find({ team_id: teamId });
}

getGroup.operation = 'READ';
getGroup.byId = true;
export function getGroup(_id) {
  logger.debug('getGroup', _id);
  return groups.findOne({ _id });
}

updateGroup.operation = 'CREATE';
updateGroup.invalidates = ['getGroups', 'getGroup'];
export function updateGroup(group) {
  logger.debug('updateGroup', group);
  const { _id } = group;
  return groups.update({ _id }, group, {
    upsert: true
  });
}

removeGroup.operation = 'DELETE';
removeGroup.invalidates = ['getGroups', 'getGroup'];
export function removeGroup(_id) {
  logger.debug('removeGroup', _id);
  return groups.remove({ _id });
}
