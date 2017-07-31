const winston = require('winston');
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
      winston.info(response);
    }
  });
}

module.exports = { sendResponse };
