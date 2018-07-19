
// Import basic modules
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');
//import multer
var multer = require('multer');
var upload = multer({ dest: './public/uploads/', limits: {fileSize: 1500000, files: 1} });

require('./server/models/users')
require('./server/models/Conversation')
require('./server/models/ConvUser')
require('./server/models/chatMsg')

//Import detail controller
var detail = require('./server/controllers/detail')
//Import listing controller
var listing = require('./server/controllers/listing');
// Import home controller
var index = require('./server/controllers/index');
// Import login controller
var auth = require('./server/controllers/auth');
// Import categories controller
var category = require('./server/controllers/category');
// Import chatmessage controller
var chat = require('./server/controllers/chatmessage');
// import profile controller
var profile = require('./server/controllers/profile')

// Modules to store session
var myDatabase = require('./server/controllers/database');
var expressSession = require('express-session');
var SessionStore = require('express-session-sequelize')(expressSession.Store);
var sequelizeSessionStore = new SessionStore({
    db: myDatabase.sequelize,
});

// Import Passport and Warning flash modules
var passport = require('passport');
var flash = require('connect-flash');

// App setup
var app = express();
var serverPort = 3000;
var httpServer = require('http').Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// Passport configuration
require('./server/config/passport')(passport);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

// Setup public directory
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
// secret for session
app.use(expressSession({
    secret: 'sometextgohere',
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages
app.use(flash());

// Application Routes
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });

// Index route
app.get('/', index.show)
app.get('/login', auth.login)

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

//Profile
app.get('/profile',auth.isLoggedIn, auth.profile);
//UPDATE PROFILE
app.get('/editprofile', profile.edit);
app.post('/editprofile', profile.update);

// Logout Page
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Serve static files TEMPORARILY
app.get('/categories', category.show)

// app.get('/chatmessage', chat.show)

// Setup chat
var io = require('socket.io')(httpServer);
var chatConnections = 0;
var ChatMsg = require('./server/models/chatMsg');

var socket_clients = {}

io.on('connection', function(socket) {
    // socket_clients[1] = socket.id;
    chatConnections++;
    console.log("Num of chat users connected: " + chatConnections);

    // socket.on('username', function(data) {
    //     socket_clients[data.user.user_id] = socket.id;
    //     console.log(socket_clients, "JEFF")
    // })

    socket.on('subscribe', function(room) {
        console.log('joining con_id:', room);
        socket.join(room);
        
    });

    socket.on('disconnect', function() {
        chatConnections--;
        console.log("Num of chat users connected: " + chatConnections);

    });
});
//app.use("/detail", detail.show);
app.get("/detail/:id", detail.show);
app.post("/detail/:id", detail.chat);
app.get("/listing", listing.list);
app.get("/listing/edit/:id", listing.editListing);
app.post("/listing/new", upload.single('image'), listing.insert);
app.post("/listing/edit/:id", listing.update);
app.delete("/listing/:id", listing.delete);

app.get('/messages/', chat.receive);
app.get('/messages/:con_id/:cu_id', chat.chatreceive);
app.post('/messages/:con_id/:cu_id', function (req, res) {
    var formattedTime = moment().format('h:mm a');
    var chatData = {
        cu_id: req.params.cu_id,
        message: req.body.message,
        timestamp: formattedTime
    }
    // Save into database
    ChatMsg.create(chatData).then((newMessage) => {
        if (!newMessage) {
            res.sendStatus(500);
        }
        // io.emit('message', chatData)
        io.in(req.params.con_id).emit('message', chatData);
        res.sendStatus(200)
    })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// app.get('/listing', listing.hasAuthorization, listing.show);
// app.post('/listing-gallery', listing.hasAuthorization, listing.create);
// app.delete('/listing/:listing_id', listing.hasAuthorization, listing.delete);

module.exports = app;

app.set('port', serverPort);

app.set('view engine', 'ejs');

var server = httpServer.listen(app.get('port'), function (){
    console.log('http server running on port ' + server.address().port);
});
