import express from 'express';
import { merge } from 'lodash';
import CONFIG from '../../config';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', merge(CONFIG, { title: 'Lunchup' }));
});

export { router as index };
