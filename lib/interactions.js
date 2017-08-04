const logger = require('./logger');
const request = require('request');

function sendResponse(responseURL, JSONmessage) {
  const postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      logger.info(response);
    }
  });
}

module.exports = { sendResponse };
