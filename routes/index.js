const express = require('express');
const router = express.Router();
const db = require('../databases/db')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});



module.exports = router;
