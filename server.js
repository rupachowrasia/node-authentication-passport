let express = require('express');
let app = express();
let port = process.env.PORT || 3000;
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let methodOverride = require('method-override');
let flash = require('connect-flash');
let session = require('express-session');
let logging = require('morgan');
let passport = require('passport');

let mongoose = require('mongoose');
let configDB = require('./config/database');

// connecting to database.
mongoose.connect(configDB.url, { useMongoClient : true });

// pass passport for configuration
require('./config/passport')(passport);

// express middleware.
app.use(bodyParser.urlencoded({extended : true})); // get information from html form.
app.use(cookieParser()); // read cookies (needed for auth).
app.use(logging('dev')); // log every request to the console.

// setup template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// passport settings
app.use(session({ secret : 'secretkeygoeshere', resave : true, saveUninitialized : true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());  // allows for passing session flashdata messages(use connect-flash for flash messages stored in session).

// routes setup, load our routes and pass in our app and fully configured passport.
require('./app/routes')(app, passport);

app.listen(port, () => {
	console.log("Connected to server and running at " + port);
});

