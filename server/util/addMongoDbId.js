import { get, isArray } from 'lodash';

export function addMongoDbId(item, keyOfId = 'id') {
  const keys = isArray(keyOfId) ? keyOfId : [keyOfId];
  const compositeId = keys.reduce((id, key) => {
    const idValue = get(item, key, '');
    if (idValue) {
      return id + idValue;
    }
    return id;
  }, '');
  if (!compositeId) {
    throw Error('Item does not contain an id.');
  }
  return { ...item, _id: compositeId };
}
