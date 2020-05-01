var express = require('express');
var UserRouter = express.Router();
var Users = require('../models/user');
const bodyParser = require('body-parser');

UserRouter.use(bodyParser.json());
/* GET users listing. */
UserRouter.route('/')
  .get(function (req, res, next) {
    res.send('respond with a resource');
  });

UserRouter.post('/signup', (req, res, next) => {
  Users.findOne({ username: req.body.username })
    .then(user => {
      if (user != null) {
        var err = new Error('User ' + req.body.username + ' already exists!');
        err.status = 403;
        next(err);
      }
      else {
        return Users.create({
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then(user => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json({ status: 'Registration Successful! ', user: user })
    }, err => next(err))
    .catch(err => next(err))
});

UserRouter.post('/login', (req, res, next) => {
  if (!req.session.user) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
    }
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];

    Users.findOne({ username: username })
      .then(user => {
        if (user === null) {
          var err = new Error('User ' + username + ' doesn\'t exists');
          err.status = 403;
          return next(err);
        }
        else if (user.password !== password) {
          var err = new Error('Incorrect password');
          err.status = 403;
          return next(err);
        }
        else if (user.username === username && user.password === password) {
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated!')
        }
      })
      .catch(err => next(err))
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
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
