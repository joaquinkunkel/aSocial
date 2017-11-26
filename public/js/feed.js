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
      newPostHTML = "<div class='card' id=" + 0 + "><p class='post_id'>" + postId + "</p><div class='top'><p class='date'>" + months[data.date.month] + " " + data.date.day + ", " + data.date.year + "</p><p class='text'>" + data.text + "</p></div><div class='post-buttons'><a class='commentme'>Comment</a><a class='share'>Share</a></div><div class='cheading' style='display:none'><hr/></div><form class='commentform'>" + "<textarea rows='1' class='comment-text'/><button type='button' class='comment-button'>Post</button></form><form class='shareform'><p class='date'>"+ "Share with " + personName.split(' ')[0] + " from " + "</p><input type='date' name='date' class='dateinput'/><button type='button' class='sharebutton'>Share</button></form>"+ "<div class='comments'></div>";
      for(var i = postsLength; i >= 0; i--){
        //console.log(i);
        $("#" + i).attr('id', i+1);
      }
      postsLength++;
      $(".posts").prepend(newPostHTML);
      enableComments();
      enableShare();
      enableReactions();
      $("#post_text").val("");
    }
  });
};

var active = 0;
$("#newpost").click(function(){
  if(!active){
    active = 1;
    $(this).addClass("active-button");
    $("#writepost").css("display", "flex");
  }else{
    active = 0;
    $(this).removeClass("active-button");
    $(this).addClass("button");
    $("#writepost").css("display", "none");
  }
});

$("#postbutton").click(function(){
  if($("#post_text").val() != ''){
    var newPost = {
      text: $("#post_text").val(),
      date: {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
      },
      comments: [],
      reaction: 0,
      image: '',
      share_dates: []
    };
    console.log(newPost);
    newPostAjax(newPost);
    enableComments();
    enableShare();
    enableReactions();
  }
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

  $(".share").unbind().click(function(){
    var shareForm = $(this).parent().parent().find(".shareform")
    if(shareForm.css('display') != 'flex'){
      $(this).parent().parent().find(".commentform").css("display", "none");
      $(this).parent().find(".commentme").removeClass("active-button");
      $(this).addClass("active-button");
      shareForm.css('display', 'flex');
    }
    else{
      $(this).removeClass("active-button");
      shareForm.css('display', 'none');
    }
  });

  $(".sharebutton").unbind().click(function(){
    $(this).parent().parent().find('.share').removeClass("active-button");
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
        reaction: 0,
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
      var thePostIndex = $(this).parent().parent().attr("id");
      console.log("post id:" + thePostId);
      console.log("post index:" + thePostIndex);
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
        ntoday.push(i);
    }
  }

  if(ntoday.length > 0){
    $(".feedbody").prepend("<hr/><div class='nheader'><h4>Notifications</h4><a id='ntoggle'>hide</a></div><div class='notifications'></div>");
    for(var i = 0; i < ntoday.length; i++){
      console.log(ntoday[i]);
      var postHTML = $("#" + ntoday[i]).html();
      $(".notifications").append("<h5 class='notification-title'>Someone shared a post with you!</h5><div class='card post' id='" + ntoday[i] + "'>" + postHTML + "</div>");
    }
    $("<hr/>").insertAfter($(".notifications"));
  }

  var nvisible = 1;
  $("#ntoggle").click(function(){
    if(nvisible){
      nvisible = 0;
      $(".notifications").css("display", "none");
      $(this).html("show");
    }else{
      nvisible = 1;
      $(".notifications").css("display", "block");
      $(this).html("hide");
    }
  });

  checkComments();
  enableComments();
  enableShare();
  enableReactions();
}

//================ COMMENTING A POST ===================//

function enableComments(){
  $(".commentme").unbind().click(function(){
    $(this).parent().find(".shareform").css("display", "none");
    $(this).addClass("active-button");
    $(this).addClass("button");
    console.log('commentme clicked!');
    if($(this).parent().parent().find('.commentform').css('display') == 'none'){
      $(this).parent().parent().find(".shareform").css("display", "none");
      $(this).parent().find(".share").removeClass("active-button");
      $(this).addClass("active-button");
      $(this).parent().parent().find('.commentform').css('display', 'flex');
    } else {
      $(this).removeClass("active-button");
      $(this).addClass("button");
      $(this).parent().parent().find('.commentform').css('display', 'none');
    }
  });
  $(".comment-button").unbind().click(function(){
    postIndex = $(this).parent().parent().attr('id');
    var comment_text = $(this).prev().val();
    var id = $(this).parent().parent().find('.post_id').html();
    console.log('post id ' + id);
    console.log('person id ' + personId);
    if(comment_text != ''){
      $.ajax({
        url: '/comment',
        type: 'POST',
        data: {
          text: comment_text,
          post_id: id,
          post_index: postIndex,
          profile_id: personId,
          comment_date: {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
          }
        },
        success: function(comment){
          console.log('new comment!', JSON.stringify(comment));
          $("#" + postIndex + " .comments").append("<div class='comment'><p class='date'>" + months[comment.date.month] + " " + comment.date.day + ", " + comment.date.year + "</p><p class='text'>" + comment.text + "</p>")
          $("#" + postIndex).find(".cheading").css("display", "block");
          $("#" + postIndex).find(".commentme").removeClass("active-button");
          $("#" + postIndex).find(".commentform").css("display", "none");
          $("#" + postIndex).find("#comment-text").val("");
        },
        error: function(err){
          console.log(err);
        }
      });
    }
  });
}

//================ REACTING TO A POST ===================//

function enableReactions(){

  /* Display or hide the dropdown menu */
  $(".reactme").unbind().click(function(){
    if($(this).parent().find(".rdropdown").css("display") != "block")
      $(this).parent().find(".rdropdown").addClass("show");
    else $(this).parent().find(".rdropdown").removeClass("show");
  });

  $(".roption").click(function(){
    postId = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().find(".post_id").html();
    postIndex = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr("id");
    reactionIndex = $(this).attr("id");
    console.log(postId, postIndex);
    $.ajax({
      url: '/reaction',
      type: 'POST',
      data: {
        user_id: personId,
        post_id: postId,
        post_index: postIndex,
        reaction: reactionIndex,
      },
      success: function(data){
        console.log("success. we have reacted to the post: ", data);
        $(".rdropdown").removeClass("show");
      }
    });
  });

}


//=============================================================//

Date.prototype.toDateInputValue = (function(){
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function checkComments(){
  $('.post').each(function(){
    if($(this).find(".comments").html() == "")
      $(this).find(".cheading").css("display", "none");
  });
}

$(document).ready(function(){
  checkNotifications();
  $('.dateinput').val(new Date().toDateInputValue());
});
