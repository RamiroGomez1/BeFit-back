var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/admin/login') // el redirect hace que cuando yo reciba localhost:3000 (que es '/'), me redirecciones a localhost:3000/admin/login
});

module.exports = router;
