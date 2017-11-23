var express = require('express');
var app = express();
var moment = require('moment');
var path = require('path');

var bodyParser = require('body-parser');
var session = require('express-session');

// Route includes
var dashboard = require('./routes/dashboard');
var hospitals = require('./routes/hospitals');
var beads = require('./routes/beads');
var login = require('./routes/login');
var logout = require('./routes/logout');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Passport Session Configuration //
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret',
    key: 'user',
    resave: 'true',
    saveUninitialized: false,
    cookie: {maxage: 60000, secure: false}
}));

var sessionCheck = function(req, res, next) {
  if (req.session.user) {
    //console.log("Login User: " + req.session.user);
    next();
  } else {
    //console.log("Login User: " + req.session.user);
  }
};

// Routes
app.use('/login', login);
app.use('/dashboard', sessionCheck, dashboard);
app.use('/hospitals', sessionCheck, hospitals);
app.use('/beads', sessionCheck, beads);
app.use('/logout', logout);

// Serve back static files
app.use(express.static('public'));
app.use(express.static('public/views'));

// App Set //
app.set('port', (process.env.PORT || 5000));

// Listen //
app.listen(app.get("port"), function(){
    console.log("Listening on port: " + app.get("port"));

});
