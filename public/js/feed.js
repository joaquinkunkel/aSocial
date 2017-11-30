var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var postIndex;
var postId;
var date = new Date;
var currentDate = String(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
var rIcons = ['favorite', 'people_outline', 'public', 'school', 'whatshot', 'new_releases', 'book', 'lock_outline', 'alarm_off', 'nature'];
var rColors = ['#ff1975', '#ffaa00', '#0083ff', '#a100ff', '#ffbb00', '#ff6100', '#00d882', '#d83200', '#2b00d8', '#00d85d'];
var blankPostHTML = '<p class="post_id">5a1a606920c15214c13ed96d</p><table class="top"><tbody><tr><td><div class="reactme" style="background:#ffaa00;"></div><div class="rdropdown"><p>This makes me feel...</p><table class="roptions"><tbody><tr><td class="column"><div class="roption" id="r0"><i class="material-icons">favorite</i><p>kind</p></div><div class="roption" id="r1"><i class="material-icons">people_outline</i><p>extraverted</p></div><div class="roption" id="r2"><i class="material-icons">public</i><p>open</p></div><div class="roption" id="r3"><i class="material-icons">school</i><p>diligent</p></div><div class="roption" id="r4">    <i class="material-icons">whatshot</i><p>neurotic</p></div></td><td class="column"><div class="roption" id="r5"><i class="material-icons">new_releases</i><p>evil</p></div><div class="roption" id="r6"> <i class="material-icons">book</i><p>introverted                      </p></div><div class="roption" id="r7"><i class="material-icons">lock_outline</i><p>intolerant</p></div><div class="roption" id="r8"><i class="material-icons">alarm_off</i><p>lazy</p></div><div class="roption" id="r9"><i class="material-icons">nature</i><p>stable</p></div></td></tr></tbody></table></div></td><td class="top"><p class="date">November 25, 2017</p><p class="text">Hey, is this working?</p></td></tr></tbody></table><div class="post-buttons"><a class="commentme">Comment</a><a class="share">Share</a></div><div class="cheading" style="display: none"><hr></div><form class="commentform"><!--input(type="text" class="id" value=_id)--><!--input(type="text" class="id" value=post._id)--><textarea class="comment-text" rows="1"></textarea><button class="comment-button" type="button">Post</button></form><form class="shareform"><div class="part1"><p class="faded text-left">Share with</p><select class="recipient"><option class="self" value="self">Joaquin</option><option value="Lizard people">Lizard people</option></select></div><div class="part2"><p class="from faded text-left">from</p><input class="dateinput" type="date" name="date"></div><button class="sharebutton" type="button">Share  </button></form><div class="comments"></div>';

//================SHOWING A MESSAGE=================//

function lowerMessage(message){
  $('body').append(message);
  $('.message').animate({
    bottom: 0
  }, 300);
  setTimeout(function(){
    $('.message').animate({
      bottom: '-3rem'
    }, 300, function(){
      $('.message').remove();
    });
  }, 10000);
}

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
      newPostHTML = "<div class='card post hidden' id=" + 0 + ">" + blankPostHTML + "</div>";
      for(var i = postsLength; i >= 0; i--){
        //console.log(i);
        $("#" + i).attr('id', i+1);
      }
      postsLength++;
      console.log(newPostHTML);
      $(".posts").prepend(newPostHTML);

      $("#0").find(".post_id").html(postId);
      $("#0").find(".reactme").html("<h5 class='blankreaction'>...</h5>");
      $("#0").find(".reactme").css("background", "rgba(0, 0, 0, 0.1)");
      $("#0").find(".top .date").html(months[data.date.month] + " " + data.date.day + ", " + data.date.year)
      $("#0").find(".top .text").html(data.text);
      $("#0").find(".comments").html("");

      $("#0").removeClass('hidden');
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
  $('.welcome').remove();
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
      share_dates: [],
      reaction: -1
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
        //console.log("success. post will be shared on date: ", data);
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
      $(this).parent().parent().find(".cheading").css("display", "block");
    }
    else{
      $(this).removeClass("active-button");
      shareForm.css('display', 'none');
      if($(this).parent().parent().find('.comments').html() == '')
        $(this).parent().parent().find(".cheading").css("display", "none");
    }
  });

  $(".recipient").change(function(){
    //console.log('recipient changed');
    if($(this).val() == 'self'){
      console.log('is self');
      $(this).parent().parent().find('.part2').removeClass('hidden');
    } else {
      console.log('isnt self');
      $(this).parent().parent().find('.part2').addClass('hidden');
    }
  });

  $(".sharebutton").unbind().click(function(){

    /* Function to display the "SHARED!" message. */
    function displayShared(instance, dateString, friendName){
      if(instance == 0){
        var sharedMessage = "<div class='message'><i class='material-icons'>check_circle</i> Your post has been shared with your past self.</div>";
      }
      else if(instance == 1){
        var sharedMessage = "<div class='message'><i class='material-icons'>check_circle</i> Your post has been shared with your future self, who will get notified on " + months[dateString.substring(4, 6)-1] + " " + dateString.substring(6, 8) + ", " + dateString.substring(0, 4) + ".</div>";
      }
      else{
        var sharedMessage = "<div class='message'><i class='material-icons'>check_circle</i> Your post has been shared with your friend " + friendName + ".</div>";
      }

      var formHTML = $(this).parent().html();
      lowerMessage(sharedMessage);


      $(this).parent().css('display', 'none');
      if($(this).parent().parent().find('.comments').html() == '')
        $(this).parent().parent().find(".cheading").css("display", "none");
    }

    $(this).parent().parent().find('.share').removeClass("active-button");
    var formDate = $(this).parent().find(".dateinput").val().replace('-', '').replace('-', '');
    var currentDate = String(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
    //console.log(currentDate);
    //console.log(formDate);

    var recipientValue = $(this).parent().find('.recipient').val();

    /* Sharing to a friend */
    if(recipientValue != 'self'){
      console.log("shared with friend");
      displayShared(2,null,recipientValue);
    }
    /* Sharing to the past self */
    else if(formDate < currentDate){
      displayShared(0, formDate);
    }

    /* Sharing to the present or future */
    else{
      var thePostId = $(this).parent().parent().find(".post_id").html();
      var thePostIndex = $(this).parent().parent().attr("id");
      console.log("post id:" + thePostId);
      console.log("post index:" + thePostIndex);
      shareToFuture(formDate, thePostId, thePostIndex);
      if(formDate == currentDate)
        checkNotifications(thePostIndex);
      displayShared(1, formDate);
    }

  });
}

//================ CHECKING FOR NOTIFICATIONS ===================//

/* Right now we have an array called notifications,
which stores each post's notification dates array
(formatted as a string). The index of a notification
dates array corresponds to the index of a post, both
in the server and in the rendered Posts div. */

function displayNotifications(nArray){
  $(".notifdiv").remove();
  if(nArray.length > 0){
    $(".feedbody").prepend("<div class='notifdiv'><hr/><div class='nheader'><h4>Notifications</h4><a id='ntoggle'>hide</a></div><div class='notifications'></div></div>");
    for(var i = 0; i < nArray.length; i++){
      console.log(nArray[i]);
      var postHTML = $("#" + nArray[i]).html();
      $(".notifications").append("<h5 class='notification-title'>Someone shared a post with you!</h5><div class='card post' id='" + nArray[i] + "'>" + postHTML + "</div>");
    }
    $("<hr/>").insertAfter($(".notifications"));
  }
}

function checkNotifications(newNoti){
  var ntoday = [];
  if(newNoti != undefined)
    ntoday.push(newNoti);
  //console.log("posts:", notifications);
  for(var i = 0; i < notifications.length; i++){
    var noti = notifications[i].split(',');

    for(var j = 0; j < noti.length; j++){
      var x = noti[j];
      if(x == currentDate)
        ntoday.push(i);
    }
  }

  displayNotifications(ntoday);

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
      $(this).parent().parent().find(".cheading").css("display", "block");
    } else {
      $(this).removeClass("active-button");
      $(this).addClass("button");
      $(this).parent().parent().find('.commentform').css('display', 'none');
      if($(this).parent().parent().find('.comments').html() == '')
        $(this).parent().parent().find(".cheading").css("display", "none");
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
    reactionIndex = $(this).attr("id").split('r')[1];
    var theIcon = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().find('.reactme');
    console.log(postId, postIndex, reactionIndex);
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
        theIcon.css('background', rColors[data]);
        theIcon.html('');
        theIcon.append('<i class="material-icons big white">'+rIcons[data]+'</i>');
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
