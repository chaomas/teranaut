'use strict';

var fs = require('fs');
var passport = require('passport');
var crypto = require("crypto");

var logger, models, baucis, config;

var api = {
    _config: undefined,

    config: function(pluginConfig) {
        this._config = pluginConfig;
        models = require('./server/models')(pluginConfig);
        logger = pluginConfig.logger;
        baucis = pluginConfig.baucis;
        config = pluginConfig.server_config;
    },

    static: function() {
        return __dirname + '/static';
    },

    init: function() {

        // Configure Baucis to know about the application models
        require('./server/api/baucis')(this._config);

        var user = models.User;

        passport.use(user.createStrategy());
        passport.serializeUser(user.serializeUser());
        passport.deserializeUser(user.deserializeUser());
    },

    pre: function() {
        this._config.app.use(passport.initialize());
        this._config.app.use(passport.session());
    },

    routes: function(deferred) {
        // Login function to generate an API token
        this._config.app.use('/api/v1/token', login);

        // All API endpoints require authentication
        this._config.app.use('/api/v1', ensureAuthenticated);

        // THIS needs to be deferred until after all plugins have had a chance to load
        var config = this._config;
        deferred.push(function() {
            config.app.use('/api/v1', baucis());
        })

        this._config.app.post('/login', passport.authenticate('local'), function(req, res) {
            //res.redirect('/');
            res.send(200, 'login successful');
        });

        this._config.app.get('/logout', function(req, res) {
            req.logout();
            //res.redirect('/');
            res.send(200, 'logout successful');
        });
    },

    post: function() {

    }
}

var ensureAuthenticated = function(req, res, next) {
    // See if the session is authenticated
    if (req.isAuthenticated()) {
        return next();
    }
    // API auth based on tokens
    else if (req.query.token) {
        models.User.findOne({api_token: req.query.token}, function(err, account) {
            if (err) {
                throw err;
            }

            if (account) {
                req.user = account;
                // If there's redis session storage available we add the login to the session.

                if (config.api.redis_ip) {
                    req.logIn(account, function(err) {
                        if (err) {
                            return next(err);
                        }

                        return next();
                    });
                }
                else {
                    return next();
                }
            }
            else {
                return res.json(401, { error: 'Access Denied' });
            }
        })
    }
    else {
        // For session based auth

        //res.redirect('/login')
        return res.json(401, { error: 'Access Denied' });
    }
}

var login = function(req, res, next) {

    passport.authenticate('local', { session: false }, function(err, user, info) {

        if (err) {
            return next(err);
        }

        if (! user) {
            return res.json(401, { error: info.message });
        }

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            var shasum = crypto.createHash('sha1');
            var date = Date.now();
            crypto.randomBytes(128, function(err, buf) {
                if (err) {
                    logger.error("Error generating randomBytes on User save.");
                    return next(err);
                }

                shasum.update(buf + Date.now() + user.hash + user.username);
                var token = shasum.digest('hex');
                user.api_token = token;
                user.save();
                res.json({
                    token: token,
                    date: date,
                    id: user._id
                });
            });
        });
    })(req, res, next);
}

module.exports = api;
