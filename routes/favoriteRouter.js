const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then(favorites => {
                res.status = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorites);
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('dishes')
            .then(favorite => {
                if (!favorite) {
                    Favorites.create({
                        user: req.user._id,
                        dishes: req.body
                    }).then(favoriteDish => {
                        res.status = 200;
                        res.setHeader('Content-type', 'application/json');
                        res.json(favoriteDish);
                    }, err => next(err))
                }
                else {
                    if (favorite.dishes) {
                        err = new Error('Dishes alreadu exists');
                        err.status = 403;
                        return next(err);
                    }
                    else {
                        favorite.dishes.push(req.body);
                        favorite.save()
                            .then(favoriteDish => {
                                res.status = 200;
                                res.setHeader('Content-type', 'application/json');
                                res.json(favoriteDish);
                            }, err => next(err))
                    }
                }
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({ user: req.user._id })
            .then(resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(resp);
            }, err => next(err))
            .catch(err => next(err))
    })


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then(favorite => {
                if (!favorite) {
                    Favorites.create({
                        user: req.user._id,
                        dishes: []
                    })
                        .then(favorite => {
                            favorite.dishes.push(req.params.dishId);
                            favorite.save()
                                .then(favorite => {
                                    res.status = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                }, err => next(err))
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then(favorite => {
                            res.status = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, err => next(err))
                }
            }, err => next(err))
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite != null) {
                    // favorite.dishes.id(req.params.dishId).remove();
                    favorite.dishes = favorite.dishes.filter(dish => dish != req.params.dishId);

                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
                else {
                    err = new Error('FavoriteDishes for user ' + req.user._id + ' not found!!');
                    err.status = 404;
                    return next(err);
                }

            })
    })


module.exports = favoriteRouter;