import monk from 'monk';
import CONFIG from '../../config';
import logger from '../util/logger';

const db = monk(CONFIG.mongodb.url);
const users = db.get('users', { castIds: false });

getUsers.operation = 'READ';
export function getUsers(teamId) {
  logger.debug('getUsers', teamId);
  return users.find({ team_id: teamId });
}

getUser.operation = 'READ';
getUser.byId = true;
export function getUser(_id) {
  logger.debug('getUser', _id);
  return users.findOne({ _id });
}

updateUser.operation = 'UPDATE';
updateUser.invalidates = ['getUsers', 'getUser'];
export function updateUser(user) {
  logger.debug('updateUser', user);
  const { _id } = user;
  return users.update({ _id }, user, {
    upsert: true
  });
}

removeUser.operation = 'DELETE';
removeUser.invalidates = ['getUsers', 'getUser'];
export function removeUser(_id) {
  logger.debug('removeUser', _id);
  return users.remove({ _id });
}
