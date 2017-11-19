import { build } from 'ladda-cache';
import { logger } from 'ladda-logger';
import * as teams from './teams';
import * as users from './users';
import * as locations from './locations';
import * as groups from './groups';
import CONFIG from '../../config';

const plugins = CONFIG.environment === 'dev' ? [logger()] : [];

const config = {
  teams: {
    ttl: CONFIG.mongodb.timeToLive,
    api: teams
  },
  users: {
    ttl: CONFIG.mongodb.timeToLive,
    api: users
  },
  locations: {
    ttl: CONFIG.mongodb.timeToLive,
    api: locations
  },
  groups: {
    ttl: CONFIG.mongodb.timeToLive,
    api: groups
  },
  __config: {
    idField: '_id'
  }
};

export default build(config, plugins);
