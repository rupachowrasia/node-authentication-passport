module.exports = function(app, passport){

	// home/index page.
	app.get('/', function(req, res){
		res.render('index');
	});

	// show login form.
	app.get('/login', function(req, res){
		res.render('login', { message : req.flash('loginMessage') });
	});

	// process login form.
	app.post('/login', passport.authenticate('local-login',{
		successRedirect : '/profile',
		failureRedirect : '/login',
		failureFlash : true	
	}));

	// show signup form.
	app.get('/signup', function(req, res){
		res.render('signup', { message : req.flash('signupMessage') });
	});

	// process signup form.
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	// show connect signup form.
	app.get('/connect/local', function(req, res){
		res.render('connect-local', { message : req.flash('signupMessage') });
	});

	// process connect signup form.
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/connect/local',
		failureFlash : true
	}));

	// profile page.
	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile', { user : req.user }); // get the user out of session and pass to template
	});

	// logout.
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});	

	// Route for facebook authentication and login, redirect the user to Facebook for authentication.
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// Facebook will redirect the user to this URL after approval. 
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// facebook authorization
	app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

	app.get('/connect/facebook/callback', passport.authorize('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// Route for twitter authentication and login, redirect the user to Twitter for authentication.
	app.get('/auth/twitter', passport.authenticate('twitter'));

	// Twitter will redirect the user to this URL after approval.
	app.get('/auth/twitter/callback', passport.authenticate('twitter',{
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// twitter authorization
	app.get('/connect/twitter', passport.authorize('twitter'));

	app.get('/connect/twitter/callback', passport.authorize('twitter',{
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// Route for google authentication and login, redirect the user to Google for authentication.
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
	
	// Google will redirect the user to this URL after approval.
	app.get('/auth/google/callback', passport.authenticate('google',{
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// google authorization
	app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
	
	app.get('/connect/google/callback', passport.authorize('google',{
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// unlink local account
	app.get('/unlink/local', isLoggedIn, function(req, res){
		var user = req.user;
		user.local.email = undefined;
		user.local.password = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});

	app.get('/unlink/facebook', isLoggedIn, function(req, res){
		var user = req.user;
		user.facebook.token = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});

	app.get('/unlink/twitter', isLoggedIn, function(req, res){
		var user = req.user;
		user.twitter.token = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});

	app.get('/unlink/google', isLoggedIn, function(req, res){
		var user = req.user;
		user.google.token = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});
	
};

// route middleware to make sure user is logged in.
function isLoggedIn(req, res, next){

	// if user is authenticated in the session, call next.
	if(req.isAuthenticated()) 
		return next();

	// if they aren't redirect them to the home page.
	res.redirect('/');
}