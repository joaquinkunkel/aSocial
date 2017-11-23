var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var postIndex;
var postId;
var date = new Date;
var currentDate = String(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());

//================ WRITING A POST ===================//

function newPostAjax(newPost){
  //console.log("we callin");
  $.ajax({
    url: '/writepost',
    type: 'POST',
    data: {
      post: newPost,
      user_id: $("#user_id").val()
    },
    success: function(data){
      console.log("success in sending new post call", data);
      postId = data._id;
      newPostHTML = "<div class='card' id=" + 0 + "><p class='post_id'>" + postId + "<div class='top'><p class='date'>" + months[data.date.month] + " " + data.date.day + ", " + data.date.year + "</p><p class='text'>" + data.text + "</p></div><div class='post-buttons'><a class='commentme'>Comment</a><a class='share'>Share</a></div><form class='commentform'><input class='id' value='" + personId + "'/><input class='id' value='" + postId + "'/><textarea rows='1' class='comment-text'/><button type='button' class='comment-button'>Post</button></form><form class='shareform'><p class='date'>"+ "Share with " + personName.split(' ')[0] + " from " + "</p><textarea class='id' value='" + personId + "'/><input type='date' name='date' class='dateinput'/><button type='button' class='sharebutton'>Share</button></form>"+ "<div class='comments'></div>";
      for(var i = postsLength; i >= 0; i--){
        //console.log(i);
        $("#" + i).attr('id', i+1);
      }
      postsLength++;
      $(".posts").prepend(newPostHTML);
      enableComments();
      enableShare();
      $("#post_text").val("");
    }
  });
};

$("#newpost").click(function(){
  $(this).css("display", "none");
  $("#writepost").css("display", "flex");
});

$("#postbutton").click(function(){
  var newPost = {
    text: $("#post_text").val(),
    date: {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    },
    comments: [],
    reactions: [],
    image: '',
    share_dates: []
  };
  console.log(newPost);
  newPostAjax(newPost);
  enableComments();
  enableShare();
});

//================ SHARING A POST ===================//

function enableShare(){
  function shareToFuture(shareDate, postId, postIndex){
    $.ajax({
      url: '/sharepost',
      type: 'POST',
      data: {
        user_id: personId,
        post_id: postId,
        post_index: postIndex,
        date: shareDate
      },
      success: function(data){
        console.log("success. post will be shared on date: ", data);
      }
    });
  };

  $(".share").click(function(){
    var shareForm = $(this).parent().parent().find(".shareform")
    if(shareForm.css('display') != 'flex')
      shareForm.css('display', 'flex');
    else
      shareForm.css('display', 'none');
  });

  $(".sharebutton").click(function(){
    $(this).parent().css('display', 'none');
    var formDate = $(this).parent().find(".dateinput").val().replace('-', '').replace('-', '');
    var currentDate = String(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
    //console.log(currentDate);
    //console.log(formDate);

    /* Sharing to same day */
    if(formDate == currentDate){
      var newPost = {
        text: $(this).parent().parent().find(".top .text").html(),
        date: {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear()
        },
        comments: [],
        reactions: [],
        image: '',
        share_dates: []
      };
      newPostAjax(newPost);
    }

    /* Sharing to the past */
    else if(formDate < currentDate){
      displayShared();
    }

    /* Sharing to the future */
    else{
      var thePostId = $(this).parent().parent().find(".post_id").html();
      var thePostIndex = $(this).parent().parent().find(".post_index").html();
      console.log("post id:" + thePostId);
      shareToFuture(formDate, thePostId, thePostIndex);
    }

  });
}

//================ CHECKING FOR NOTIFICATIONS ===================//

/* Right now we have an array called notifications,
which stores each post's notification dates array
(formatted as a string). The index of a notification
dates array corresponds to the index of a post, both
in the server and in the rendered Posts div. */

function checkNotifications(){
  var ntoday = [];
  //console.log("posts:", notifications);
  for(var i = 0; i < notifications.length; i++){
    var noti = notifications[i].split(',');

    for(var j = 0; j < noti.length; j++){
      var x = noti[j];
      if(x == currentDate)
        console.log("notif date: " + x + "\nindex: " + i);
        ntoday.push(i);
    }
  }

  $(".posts").prepend("<div class='notifications'></notifications>");

  for(var i = 0; i < ntoday.length; i++){
    var postHTML = $("#" + i).html();
    $(".notifications").append("<h5 class='notification'>Someone shared a post with you!</h5><div class='card' id='" + ntoday[i] + "'>" + postHTML + "</div>");
  }
}

//================ COMMENTING A POST ===================//

function enableComments(){
  $(".commentme").click(function(){
    if($(this).parent().parent().find('.commentform').css('display') == 'none'){
      $(this).parent().parent().find('.commentform').css('display', 'flex');
    } else {
      $(this).parent().parent().find('.commentform').css('display', 'none');
    }
  });
  $(".comment-button").click(function(){
    postIndex = $(this).parent().parent().attr('id');
    var comment_text = $(this).prev().val();
    var id = $(this).prev().prev().val();
    var profid = $(this).prev().prev().prev().val();
    console.log('post id ' + id);
    if(comment_text != ''){
      $.ajax({
        url: '/comment',
        type: 'POST',
        data: {
          text: comment_text,
          post_id: id,
          post_index: postIndex,
          profile_id: profid,
          comment_date: {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
          }
        },
        success: function(comment){
          console.log('new comment!', JSON.stringify(comment));
          $("#" + postIndex + " .comments").append("<div class='comment'><p class='date'>" + months[comment.date.month] + " " + comment.date.day + ", " + comment.date.year + "</p><p class='text'>" + comment.text + "</p>")
        },
        error: function(err){
          console.log(err);
        }
      });
    }
  });
}

//=============================================================//

Date.prototype.toDateInputValue = (function(){
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

$(document).ready(function(){
  enableComments();
  enableShare();
  checkNotifications();
  $('.dateinput').val(new Date().toDateInputValue());
});
