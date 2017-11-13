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

app.get('/', function(req, res){
  if(loggedIn)
    res.render('index');
  else
    res.render('login');
});

app.get('/signup', function(req, res){
  res.render('signup');
});

app.get('/feed', function(req, res){
  res.render('feed', {name: 'Pierre', posts: ['hey', 'there']});
});

app.post('/newprofile', function(req, res){
  var body = req.body;
  createProfile(body.name, body.email, body.password, body.friends); //FRIENDS
  //function to return object with all of the user's data
  //Use the email as a key for findProfile
  res.render('feed', {n: 'Pierre', posts: ['hey', 'there']});
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

  //Schema. Will we use this for profiles? Posts?
  var personSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    friends: Array,
    posts: Array
  });

  Person = mongoose.model('Person', personSchema);

  //For testing purposes only. Logs all profiles.
  Person.find(function(err, all_profiles){
    console.log(all_profiles);
  });

});

//To create a new profile
function createProfile(pName, pEmail, pPassword, pFriends){
  var profile = new Person({
    name: pName,
    email: pEmail,
    password: pPassword,
    friends: pFriends,
    posts: ['welcome']
  });

  profile.save(function(err, profile){
    if(err){
      return console.error(err);
    }else{
      console.log('Successfully saved new profile: ' + profile.name);
    }
  });
};
