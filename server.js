var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = new express();
var pug = require('pug');
var port = 8009;
var bp = require('body-parser');
var profileId = 0;

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
  if(profileId != 0)
    Person.findById(profileId, function(err, doc){
      res.render('feed', doc);
    });
  else
    res.render('login');
});

//When a user wants to sign up
app.get('/signup', function(req, res){
  res.render('signup');
});

//When we go directly to the feed, when the user is already logged in.
app.get('/feed', function(req, res){
  var profile = Person.findById(profileId, function(err, doc){
    console.log("displaying feed: ", doc);
    res.render('feed', doc);
  });
});

//When we receive a call to sign up
app.post('/newprofile', function(req, res){
  //To create a new profile
  function createProfile(pName, pEmail, pPassword, pFriends){
    var date = new Date;
    firstPost = new Post({
        text:"Welcome to aSocial! Start by writing a post or uploading a photo.",
        date: {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear()
        },
        comments: [],
        reactions: [],
        image:''
      });

    var profile = new Person({
      name: pName,
      email: pEmail,
      password: pPassword,
      friends: pFriends,
      posts: [firstPost]
      //posts: ['hello pedro']
    });

    profile.save(function(err, profile){
      if(err){
        return console.error(err);
      }else{
        console.log('Successfully saved new profile: ' + profile.email);
        profileId = profile._id;
        res.send(profile);
      }
    });
  };

  var body = req.body;
  //console.log(body);
  createProfile(body.user_name, body.user_email, body.user_password, body.user_friends);
});

//When someone tries to log in
app.post('/login', function(req, res){
  var body = req.body;
  var found = 0;

  Person.find({'email': body.user_email, 'password': body.user_password}, function(err, profiles){
    //console.log("finding!\nbody.email = " + body.user_email + "\nbody.password = " + body.user_password);
    if(profiles[0]){
      console.log('logging in as ' + profiles[0]);
      res.render('feed', profiles[0]);
      profileId = profiles[0]._id;

    }
    else{
      res.render('incorrect_login');
      console.log('incorrect login');
    }
  });

});

app.post('/writepost', function(req, res){
  var body = req.body;
  var newPost = new Post(body);
  var newPosts;
  console.log("wrote new post: " + JSON.stringify(newPost));
  console.log("finding", profileId);
  Person.findById(profileId, function(err, doc){
    newPosts = doc.posts;
    newPosts.unshift(newPost);
    doc.posts = newPosts;
    doc.save(function(err, updatedPost){
      res.send(updatedPost);
    });
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
var Post;

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
