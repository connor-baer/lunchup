import DB from '../db';

export async function addLocation(teamId, locationName) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!locationName) {
    throw new Error('Location name not provided.');
  }
  const locationId = encodeURI(locationName);
  const location = {
    _id: `${teamId}${locationId}`,
    locationId,
    name: locationName
  };
  try {
    return await DB.locations.addLocation(location);
  } catch (e) {
    throw new Error(e);
  }
}

export async function removeLocation(teamId, locationName) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!locationName) {
    throw new Error('Location name not provided.');
  }
  const locationId = encodeURI(locationName);
  const _id = `${teamId}${locationId}`;
  try {
    return await DB.locations.removeLocation(_id);
  } catch (e) {
    throw new Error(e);
  }
}

export async function getLocations(teamId) {
  try {
    return await DB.locations.getLocations(teamId);
  } catch (e) {
    throw new Error(e);
  }
}
