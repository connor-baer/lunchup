const logger = require('./logger');
const { includes } = require('lodash');

function contains(messageText = '', wordsToMatch = []) {
  return wordsToMatch.some(word => includes(messageText, word));
}

module.exports = { contains };
