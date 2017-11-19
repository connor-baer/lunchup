import monk from 'monk';
import { addMongoDbId } from '../util/addMongoDbId';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);

const users = db.get('users');

getUsers.operation = 'READ';
export function getUsers(teamId) {
  return users.find({ teamId });
}

getUser.operation = 'READ';
getUser.byId = true;
export function getUser(teamId, userId) {
  const _id = `${teamId}${userId}`;
  return users.find({ _id });
}

updateUser.operation = 'UPDATE';
// updateUser.invalidates = ['getUsers'];
export function updateUser(user) {
  const { _id } = user;
  return users.update({ _id }, user, {
    upsert: true
  });
}

addUser.operation = 'CREATE';
// addUser.invalidates = ['getUsers'];
export function addUser(user) {
  const newUser = {
    location: '',
    active: true,
    snooze: false,
    ...user
  };
  const userWithId = addMongoDbId(newUser, ['team_id', 'id']);
  return users.insert(userWithId);
}

removeUser.operation = 'DELETE';
// removeUser.invalidates = ['getUsers'];
export function removeUser(teamId, userId) {
  const _id = `${teamId}${userId}`;
  return users.remove({ _id });
}
