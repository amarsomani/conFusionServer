var express = require('express');
var UserRouter = express.Router();
var Users = require('../models/user');
const bodyParser = require('body-parser');
var passport = require('passport');

UserRouter.use(bodyParser.json());
/* GET users listing. */
UserRouter.route('/')
  .get(function (req, res, next) {
    res.send('respond with a resource');
  });

UserRouter.post('/signup', (req, res, next) => {
  Users.register(new Users({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        passport.authenticate('local', req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        })
      }
    })
});

UserRouter.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });
});

UserRouter.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!!');
    err.status = 403;
    next(err)
  }
});


module.exports = UserRouter;
