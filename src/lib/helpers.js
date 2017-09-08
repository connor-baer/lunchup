const { includes } = require('lodash');

function contains(messageText = '', wordsToMatch = []) {
  const text = messageText.toLowerCase();
  return wordsToMatch.some(wordToMatch => {
    const word = wordToMatch.toLowerCase();
    return includes(text, word);
  });
}

module.exports = { contains };
