import monk from 'monk';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);
const users = db.get('users');

getUsers.operation = 'READ';
export function getUsers(teamId) {
  return users.find({ team_id: teamId });
}

getUser.operation = 'READ';
getUser.byId = true;
export function getUser(_id) {
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
  return users.insert(user);
}

removeUser.operation = 'DELETE';
// removeUser.invalidates = ['getUsers'];
export function removeUser(_id) {
  return users.remove({ _id });
}
