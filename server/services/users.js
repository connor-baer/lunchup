import DB from '../db';

export async function addUser(teamId, user) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!user) {
    throw new Error('User not provided.');
  }
  const fullUser = {
    _id: `${teamId}${user.id}`,
    active: true,
    snooze: false
  };
  try {
    return await DB.users.updateUser(fullUser);
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateUser(teamId, user) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!user) {
    throw new Error('User not provided.');
  }
  const _id = `${teamId}${user.id}`;
  try {
    return await DB.users.updateUser({ ...user, _id });
  } catch (e) {
    throw new Error(e);
  }
}

export async function removeUser(teamId, userId) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!userId) {
    throw new Error('User name not provided.');
  }
  const _id = `${teamId}${userId}`;
  try {
    return await DB.users.removeUser(_id);
  } catch (e) {
    throw new Error(e);
  }
}

export async function getUsers(teamId) {
  try {
    return await DB.users.getUsers(teamId);
  } catch (e) {
    throw new Error(e);
  }
}
