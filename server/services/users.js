import DB from '../db';

export async function addUser(teamId, user) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!user) {
    throw new Error('User not provided.');
  }
  const newUser = {
    _id: `${teamId}${user.id}`,
    team_id: teamId,
    active: true,
    snooze: false,
    ...user
  };
  try {
    return await DB.users.updateUser(newUser);
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
  const oldUser = await DB.users.getUser(_id);
  const newUser = { ...oldUser, ...user };
  try {
    return await DB.users.updateUser(newUser);
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
