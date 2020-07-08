var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('./models/user');

var JWTSrategy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('./config');

var facebookTokenStrategy = require('passport-facebook-token');

exports.local = passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 })
};

var opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JWTSrategy(opts,
    (jwt_payload, done) => {
        console.log('JWT Payload : ', jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err)
                return done(err, false);
            else if (user)
                return done(null, user);
            else
                return done(null, false);
        });
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin)
        return next();
    else {
        var err = new Error('You are not an admin');
        err.status = 403;
        return next(err);
    }
};


// exports.facebookPassport = passport.use(new FacebookTokenStrategy({
//     clientID: config.facebook.clientId,
//     clientSecret: config.facebook.clientSecret
// }, (accessToken, refreshToken, profile, done) => {
//     User.findOne({ facebookId: profile.id }, (err, user) => {
//         if (err) {
//             return done(err, false);
//         }
//         if (!err && user !== null) {
//             return done(null, user);
//         }
//         else {
//             user = new User({ username: profile.displayName });
//             user.facebookId = profile.id;
//             user.firstname = profile.name.givenName;
//             user.lastname = profile.name.familyName;
//             user.save((err, user) => {
//                 if (err)
//                     return done(err, false);
//                 else
//                     return done(null, user);
//             })
//         }
//     });
// }
// ));
