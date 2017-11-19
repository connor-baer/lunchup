import express from 'express';
import { merge } from 'lodash';
import CONFIG from '../../config';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const { slack } = CONFIG;
  res.render('index', merge(slack, { title: 'Lunchup' }));
});

export { router as index };
