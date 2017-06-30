var request = require('request');

module.exports = (url, FORMmessage, callback) => {
  const postOptions = {
    url: url,
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    form: FORMmessage
  };

  request(postOptions, callback);
};
