const winston = require('winston');
const express = require('express');
const { merge } = require('lodash');
const { config } = require('../config.json');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  winston.info('Requested /');

  res.render('index', merge(config, { title: 'Lunchup' }));
});

module.exports = router;
