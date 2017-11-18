import express from 'express';
import { merge } from 'lodash';
import { config } from '../../config.json';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', merge(config, { title: 'Lunchup' }));
});

export { router as index };
