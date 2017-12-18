var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = new express();
var pug = require('pug');
var port = process.env.PORT || 8019;
var bp = require('body-parser');
var fs = require('fs');
var sgMail = require('@sendgrid/mail');
var multer = require('multer');
var morgan = require('morgan');

///IMAGE UPLOAD
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, './public/uploads');
  },
  filename: function(req, file, callback){
    var oName = file.originalname.split('.');
    callback(null, oName[0] + '-' + Date.now() + '.' + oName[1]);
  }
});

var upload = multer({storage: storage}).single('ppinput');

app.post('/profpic', upload, function(req, res) {
  if (req.file) {
    console.dir(req.file);
    Person.findById(req.body.user_id, function(err, person){
      person.image = req.file.filename;
      person.save(function(err, doc){
        if(err) console.log("ERROR: " + err);
        else{
          console.log("TRYING TO SEND FILENAME: " + req.file.filename);
          res.end(req.file.filename);
        }
      });
    });
  }
  else
    res.end('Missing file');
});

/*
///EMAIL STUFF

///// LOAD IN THE API KEY FOR EMAIL
API_KEY = fs.readFileSync('./API_KEY.txt','utf-8');

function sendMail(recipient, name){

  sgMail.setApiKey(API_KEY);

  var msg = {
    to: recipient,
    from: 'aSocial <jek537@nyu.edu>',
    subject: 'Welcome to aSocial',
    html: '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: -apple-system, BlinkMacSystemFont, \'Helvetica\', sans-serif;"><a style="color: black!important; text-decoration: none!important" href="https://asocialnetwork.herokuapp.com"><h1 style="text-align:center">aSocial</h1></a><p>Hello, ' + name.split(' ')[0] + '!<br/><br/>Welcome to aSocial! This is a space for you to craft an online identity without having to worry about an audience other than yourself. It is also a space for you to visit when you need a break from online social interaction.</p><p>If you wish to learn more about aSocial, please visit the <a href="http://joaquinkunkel.com:8019/about">about page</a>, or <a href="mailto:joaquin.kunkel@nyu.edu">contact the developer</a>.</p><p>Enjoy your alone time!<br/><div style="display:flex; align-items:center; justify-content:center; width: 100%;"><a style="text-decoration: none" href="http://joaquinkunkel.com:8019"><h3 style="background:linear-gradient(60deg, rgba(117,0,227,1) 0%, rgba(23,85,255,1) 100%); color:white; border-radius:3px; padding: 0.6rem; font-weight: normal;">Go to aSocial</h3></a></div></body></html>'
  };

  sgMail.send(msg, function(error, result){
    if (error) {
      console.log(error.response.body.errors);
    }
    else {
      console.log('celebrate');
    }
  });
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
*/
app.use(express.static('public'));
app.use(bp.urlencoded({
  extended: true
}));
app.use(bp.json());
app.use(morgan('dev'));

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.listen(port, function(){
  console.log('Server started on port', port);
});

//Default (home screen)
app.get('/', function(req, res){
  /*
  if(profileId != 0)
    Person.findById(profileId, function(err, doc){
      res.render('feed', doc);
    });
  else
    res.render('login');
    */
  res.render('login');
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/about', function(req, res){
  res.render('about');
});

//When someone wants to go back home: By default, re-render the feed.
app.post('/', function(req, res){
  Person.findById(req.body.id, function(err, doc){
    res.render('feed', doc);
  });
});

//When someone wants to see their friend list.
app.post('/friends', function(req, res){
  Person.findById(req.body.id, function(err, doc){
    res.render('friends', doc);
  });
});

//When someone adds a new friend.
app.post('/newfriend', function(req, res){
  Person.findById(req.body.id, function(err, person){
    person.friends.unshift(req.body.friend);
    person.save(function(err, doc){
      if(!err)
        console.log("SUCCESS IN SAVING NEW PERSON WITH FRIEND");
      res.send(req.body.friend);
    });
  });
});

app.post('/removefriend', function(req, res){
  var friendIndex = req.body.friend_index;
  console.log('called! remove friend', req.body.id, "   ", friendIndex);
  Person.findById(req.body.id, function(err, person){
      person.friends.splice(friendIndex, 1);
      console.log("updated friend array", person.friends);
      person.save(function(err, doc){
        res.send(friendIndex);
      });
  });
});

//When a user wants to sign up
app.get('/signup', function(req, res){
  res.render('signup');
});

//When we receive a call to sign up
app.post('/newprofile', function(req, res){
  //To create a new profile
  function createProfile(pName, pEmail, pPassword, pFriends){
    var date = new Date;

    var profile = new Person({
      name: pName,
      email: pEmail,
      password: pPassword,
      friends: pFriends,
      posts: [],
      reactions: [0,0,0,0,0,0,0,0,0,0]
    });

    profile.save(function(err, profile){
      if(err){
        return console.error(err);
      }else{
        //sendMail(profile.email, profile.name);
        console.log('Successfully saved new profile: ' + profile.email);
        res.render('feed', profile);
      }
    });
  };

  var body = req.body;
  //console.log(body);
  var friendString = body.user_friends.replace(/, /g , ",");
  friendsArray = friendString.split(",");
  createProfile(body.user_name, body.user_email, body.user_password, friendsArray);
});

//Check if an email already exists
app.post('/new-email', function(req, res){
  var body = req.body;
  Person.find({'email': body.email}, function(err, profiles){
    if(profiles[0]){
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

//When someone tries to log in
app.post('/login', function(req, res){
  var body = req.body;
  var found = 0;

  Person.find({'email': body.user_email, 'password': body.user_password}, function(err, profiles){
    //console.log("finding!\nbody.email = " + body.user_email + "\nbody.password = " + body.user_password);
    if(profiles[0]){
      res.render('feed', profiles[0]);
    }
    else{
      res.render('incorrect_login');
      console.log('incorrect login');
    }
  });

});

app.post('/writepost', function(req, res){
  var body = req.body;
  var newPost = new Post(body.post);
  newPost.save(function(err, post){
    if(err){
      return console.error(err);
    }else{
      console.log('Successfully saved new post: ' + post.text);
    }
  });
  var newPosts;
  var profileId = body.user_id;
  //console.log("HERE IS BODY" + JSON.stringify(body));
  //console.log("wrote new post: " + JSON.stringify(newPost));
  //console.log("finding", profileId);
  Person.findById(profileId, function(err, doc){
    newPosts = doc.posts;
    newPosts.unshift(newPost);
    doc.posts = newPosts;
    doc.save(function(err, newDoc){
      console.log('\nThe id is: ' + newDoc.posts[0]._id);
      res.send(newDoc.posts[0]);
    });
  });
});

app.post('/comment', function(req, res){
  var body = req.body;

  //Create the new comment and save it to database.
  var newComment = new Comment({
    text: body.text,
    date: body.comment_date
  });
  newComment.save(function(err, post){
    if(err){
      return console.error(err);
    }else{
      console.log('Successfully saved new comment: ' + newComment.text);
    }
  });
  var newComments;

  //Find what post and profile we'll add it to.
  var postId = body.post_id;
  var profileId = body.profile_id;
  var postIndex = body.post_index;

  console.log('postid ', postId);

  Post.findById(postId, function(err, doc){
    console.log('found: ', JSON.stringify(doc));
    newComments = doc.comments;
    newComments.push(newComment);
    doc.comments = newComments;

    //Save the new modified post document.
    doc.save(function(err, newDoc){
      if(!err){
        Person.findById(profileId, function(err, profile){
          profile.posts.set(postIndex, newDoc);
          profile.save(function(err, newProfile){
            //console.log('these are the new posts: ' + JSON.stringify(newProfile.posts));
            res.send(newComment);
          });
        });
      } else console.log(err);
    });
  });
});

app.post('/reaction', function(req, res){
  var body = req.body;
  var postId = body.post_id;
  var postIndex = body.post_index;
  var reaction = body.reaction;
  var personId = body.user_id;
  console.log("REACTION REQUEST. BODY: ", body);
  Post.findById(postId, function(err, post){
    var oldReaction = post.reaction;
    console.log('old reaction: ' + oldReaction);
    post.reaction = reaction;
    post.save(function(err, doc){
      Person.findById(personId, function(err, person){
        person.reactions.set(reaction, person.reactions[reaction] + 1);
        if(oldReaction >= 0) person.reactions.set(oldReaction, person.reactions[oldReaction] - 1);
        person.posts.set(postIndex, post);
        person.save(function(err, newProfile){
          res.send(reaction);
          console.log("new reactions: " + person.reactions);
        })
      });
    });
  });
});

app.post('/sharepost', function(req, res){
  console.log("SHARE POST REQUEST: ", JSON.stringify(req.body));
  var body = req.body;
  var userId = body.user_id;
  var postId = body.post_id;
  var postIndex = body.post_index;
  var shareDate = body.date;

  Post.findById(postId, function(err, post){
    console.log('finding post');
    post.share_dates.push(shareDate); //The date will be of the form yyyymmdd.
    post.save(function(err, doc){
      Person.findById(userId, function(err, person){
          person.posts.set(postIndex, doc);
          person.save(function(err, doc2){
            if(err)
              console.log(err);
            else res.send(shareDate);
          });
      });
    });
  });
});

app.post('/forget', function(req, res){
  var body = req.body;
  Post.findById(body.post_id, function(err, post){
    var memory = post.memory;
    post.memory = memory/2;
    post.save(function(err, doc){
      if(err) console.log(err);
      else{
        Person.findById(body.user_id, function(err, person){
          person.posts.set(body.post_index, doc);
          person.save(function(err, newDoc){
            if(err) console.log(err);
            else res.send({
              memory: doc.memory
            });
          });
        });
      }
    });
  });
});

//we connect to the database. "test" here refers to the specific database that we want to connect to
mongoose.connect('mongodb://asocial-dev:M7x0GCHz5koldv7m@asocial-shard-00-00-syxhk.mongodb.net:27017,asocial-shard-00-01-syxhk.mongodb.net:27017,asocial-shard-00-02-syxhk.mongodb.net:27017/test?ssl=true&replicaSet=aSocial-shard-0&authSource=admin', {
  useMongoClient: true,
});

var my_database = mongoose.connection;

//we can attach "listeners" to our database connection.
//which means that we attach a callback function to an event
//and that function is called whenever the event happens

//in case there's an 'error' event, we log it to the console
my_database.on('error', console.error.bind(console, 'connection error:'));

//in case of an 'open' event, we say that we've successfully opened our connection.
//we can also do other things like check for existing data, etc.

var Person;
var Post;
var Comment;

my_database.on('open', function(){
  console.log("Connections to the database successful!");

  //Schema for a profile.
  var personSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    friends: Array,
    posts: Array,
    reactions: Array,
    image: String,
  });

  //Schema for a post.
  var postSchema = mongoose.Schema({
    text: String,
    date: Object,
    comments: Array,
    reaction: Number,
    image: String,
    share_dates: Array,
    memory: Number,
  });

  //Schema for a comment.
  var commentSchema = mongoose.Schema({
    text: String,
    date: Object,
  });

  Person = mongoose.model('Person', personSchema);
  Post = mongoose.model('Post', postSchema);
  Comment = mongoose.model('Comment', commentSchema);

  //Friend = mongoose.model('Friend', friendSchema);

  /* //For testing purposes. Logs all profiles.
  Post.find(function(err, all_profiles){
    console.log(all_profiles);
  });
  */

});
