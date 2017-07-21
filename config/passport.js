// load all the modules we need
let localStrategy = require('passport-local').Strategy;
let facebookStrategy = require('passport-facebook').Strategy;
let twitterStrategy = require('passport-twitter').Strategy;
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load the user model
let User = require('../app/models/user');

// load the auth variables
let configAuth = require('./auth');

module.exports = function(passport){

	// serialize user
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	// deserialize user
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	// Local Signup, by default, if there was no name, it would just be called 'local'
	passport.use('local-signup', new localStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
		}, 
		function(req, email, password, done){
			//process.nextTick(function(){
				if(!req.user){ // if user is not already logged in
					User.findOne({'local.email':email}, function(err, user){
						if(err) return done(err);
						if(user){
							return done(null, false, req.flash('signupMessage', 'This email is already exist'));
						} else {
							var newUser = new User();
							newUser.local.email = email;
							newUser.local.password = newUser.generateHash(password);

							newUser.save(function(err){
								if(err) throw err;
								return done(null, newUser); 
							});
						}
					});
				} else { // if user is logged in just connect their account
					User.findOne({'local.email':email}, function(err, user){
						if(err) return done(err);
						if(user){
							return done(null, false, req.flash('signupMessage', 'This email is already exist'));
						} else {
							var currentUser = req.user;
							currentUser.local.email = email;
							currentUser.local.password = currentUser.generateHash(password);

							currentUser.save(function(err){
								if(err) throw err;
								return done(null, currentUser); 
							});
						}
					});
				}
			//});
		}
	));

	// Local Login
	passport.use('local-login', new localStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
		}, 
		function(req, email, password, done){
			User.findOne({ 'local.email' : email }, function(err, user){
				if(err)
					return done(err);
				if(!user)
					return done(null, false, req.flash('loginMessage', 'No user found.'));
		
				if(!user.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'password is not valid'));
				
				return done(null, user);

			});
		}
	));

	// facebook login
	passport.use(new facebookStrategy({
		clientID : configAuth.facebookAuth.clientID,
		clientSecret : configAuth.facebookAuth.clientSecret,
		callbackURL : configAuth.facebookAuth.callbackURL,
		passReqToCallback : true
		},
		function(req, accessToken, refreshToken, profile, done){
			if(!req.user){ // if user is not already logged in
				User.findOne({ 'facebook.id' : profile.id }, function(err, user){
					if(err) return done(err);
					if(user){
						if(!user.facebook.token){
							var newUser = new User();
							newUser.facebook.token = accessToken;
							newUser.facebook.name = profile.displayName;
							newUser.facebook.email = profile.displayName;
							
							newUser.save(function(err){
								if(err)
									throw err;
								return done(null, newUser);
							});
						}
						return done(null, user);
					}else {
						var newUser = new User();
						newUser.facebook.id = profile.id;
						newUser.facebook.token = accessToken;
						newUser.facebook.name = profile.displayName;
						newUser.facebook.email = profile.displayName;
						
						newUser.save(function(err){
							if(err)
								throw err;
							return done(null, newUser);
						});
					}
				});	
			} else { // if user is logged in just connect their account
				var connectUser = req.user;
				connectUser.facebook.id = profile.id;
				connectUser.facebook.token = accessToken;
				connectUser.facebook.name = profile.displayName;
				connectUser.facebook.email = profile.emails[0].value;
				
				connectUser.save(function(err){
					if(err)
						throw err;
					return done(null, connectUser);
				});
			}
		}
	));

	// twitter login
	passport.use(new twitterStrategy({
		consumerKey : configAuth.twitterAuth.consumerKey,
		consumerSecret : configAuth.twitterAuth.consumerSecret,
		callbackURL : configAuth.twitterAuth.callbackURL,
		passReqToCallback : true
		}, 
		function(req, token, tokenSecret, profile, done) {
			if(!req.user){ // if user is not already logged in
				User.findOne({ 'twitter.id' : profile.id }, function(err, user){
					if(err) 
						return done(err);
					if(user){
						if(!user.twitter.token){
							var newUser = new User();
							newUser.twitter.token = token;
							newUser.twitter.displayName = profile.username;
							newUser.twitter.username = profile.displayName;

							newUser.save(function(err){
								if(err)
									return done(err);
								return done(null, newUser);
							});
						}
						return done(null, user);
					} else {
						var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						newUser.twitter.displayName = profile.username;
						newUser.twitter.username = profile.displayName;

						newUser.save(function(err){
							if(err)
								return done(err);
							return done(null, newUser);
						});
					}
				});
			} else { // if user is logged in just connect their account
				var connectUser = req.user;
				connectUser.twitter.id = profile.id;
				connectUser.twitter.token = token;
				connectUser.twitter.displayName = profile.username;
				connectUser.twitter.username = profile.displayName;

				connectUser.save(function(err){
					if(err)
						return done(err);
					return done(null, connectUser);
				});
			}
		}
	));

	// google login
	passport.use(new googleStrategy({
		clientID       : configAuth.googleAuth.clientID,
		clientSecret   : configAuth.googleAuth.clientSecret,
		callbackURL    : configAuth.googleAuth.callbackURL,
		passReqToCallback : true
		},
		function(req, accessToken, refreshToken, profile, done){
			if(!req.user){ // if user is not already logged in
				User.findOne({ 'google.id' : profile.id }, function(err, user){
					if(err)
						return done(err);
					if(user){
						if(!user.google.token){
							newUser = new User();
							newUser.google.token = accessToken;
							newUser.google.email = profile.emails[0].value;
							newUser.google.name = profile.displayName;
							newUser.save(function(err){
								if(err)
									return done(err);

								return done(null, newUser);
							});	
						}
						return done(null, user);
					} else {
						newUser = new User();
						newUser.google.id = profile.id;
						newUser.google.token = accessToken;
						newUser.google.email = profile.emails[0].value;
						newUser.google.name = profile.displayName;
						newUser.save(function(err){
							if(err)
								return done(err);

							return done(null, newUser);
						});	
					}
				});
			} else { // if user is logged in just connect their account
				connectUser = req.user;
				connectUser.google.id = profile.id;
				connectUser.google.token = accessToken;
				connectUser.google.email = profile.emails[0].value;
				connectUser.google.name = profile.displayName;

				connectUser.save(function(err){
					if(err)
						return done(err);

					return done(null, connectUser);
				});					
			}
		}
	));

}