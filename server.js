var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = new express();
var pug = require('pug');
var port = 8009;
var bp = require('body-parser');


//Will change if the user is logged in.
var loggedIn = false;

app.use(express.static('public'));
app.use(bp.urlencoded({
  extended: true
}));
app.use(bp.json());
app.set('view engine', 'pug');
app.set('views', 'public/views');

app.listen(port, function(){
  console.log('Server started on port', port);
});

//Default (home screen)
app.get('/', function(req, res){
  if(loggedIn)
    res.render('index');
  else
    res.render('login');
});

//When a user wants to sign up
app.get('/signup', function(req, res){
  res.render('signup');
});

//When we go directly to the feed, when the user is already logged in.
app.get('/feed', function(req, res){
  res.render('feed', {}); //Pass the object of the user.
});

//When we receive a call to sign up
app.post('/newprofile', function(req, res){
  var body = req.body;
  //console.log(body);
  createProfile(body.user_name, body.user_email, body.user_password, body.user_friends);
  //Use the email as a key for findProfile
});

//When someone tries to log in
app.post('/home', function(req, res){
  var body = req.body;
  var found = 0;

  Person.find({'email': body.user_email, 'password': body.user_password}, function(err, profile){
    //console.log("finding!\nbody.email = " + body.user_email + "\nbody.password = " + body.user_password);
    if(profile){
      console.log('logging in as ' + profile);
      res.render('feed', profile);
    }
    else{
      res.render('incorrect_login');
      console.log('incorrect login');
    }
  });

});

app.post('/writepost', function(req, res){
  var date = new Date;
  var body = req.body;
  var newpost = new Post({
    text: body.post_text,
    date: {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    },
    comments: [],
    reactions: [],
    image: ''
  });
  
});

//we connect to the database. "test" here refers to the specific database that we want to connect to
mongoose.connect('mongodb://127.0.0.1/test', {
  useMongoClient: true,
});

var my_database = mongoose.connection;

//we can attach "listeners" to our database connection.
//which means that we attach a callback function to an event
//and that function is called whenever the event happens

//in case there's an 'error' event, we log it to the console
my_database.on('error', console.error.bind(console, 'connection error:'));

//if you always get an error, make sure you mongodb is running, and not just installed!

//in case of an 'open' event, we say that we've successfully opened our connection.
//we can also do other things like check for existing data, etc.

var Person;

my_database.on('open', function(){
  console.log("Connections to the database successful!");

  //Schema for a profile.
  var personSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    friends: Array,
    posts: Array
  });

  //Schema for a post.
  var postSchema = mongoose.Schema({
    text: String,
    date: Object,
    comments: Array,
    reactions: Array,
    image: String
  })

  Person = mongoose.model('Person', personSchema);
  Post = mongoose.model('Post', postSchema);

  //For testing purposes. Logs all profiles.
  Person.find(function(err, all_profiles){
    console.log(all_profiles);
  });

});

//To create a new profile
function createProfile(pName, pEmail, pPassword, pFriends){
  var date = new Date;
  var profile = new Person({
    name: pName,
    email: pEmail,
    password: pPassword,
    friends: pFriends,
    posts: [{text:"Welcome to aSocial! Start by writing a post or uploading a photo.", date: {day: date.getDate(), month: date.getMonth(), year: date.getFullYear()}, comments: [], reactions: [], image:''}]
    //posts: ['hello pedro']
  });

  profile.save(function(err, profile){
    if(err){
      return console.error(err);
    }else{
      console.log('Successfully saved new profile: ' + profile.email);
    }
  });
};
