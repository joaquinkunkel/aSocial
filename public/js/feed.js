var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var postIndex;
var postId;
var date = new Date;
var currentDate = String(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
var rIcons = ['favorite', 'people_outline', 'public', 'school', 'whatshot', 'new_releases', 'book', 'lock_outline', 'alarm_off', 'nature'];
var rColors = ['#ff1975', '#ffaa00', '#0083ff', '#a100ff', '#ffbb00', '#ff6100', '#00d882', '#d83200', '#2b00d8', '#00d85d'];
var blankPostHTML = '<p class="post_id">5a23a21e6943fd4f6f10c1ec</p><table class="top"><tbody><tr><td><div class="reactview" style="background:undefined; opacity:1;"><h5 class="blankreaction">...</h5></div></td><td class="top"><p class="date">December 3, 2017</p><p class="text" style="opacity:1;">Yet another one</p></td></tr></tbody></table><div class="post-buttons"><i class="button material-icons reactme">mood</i><i class="button material-icons commentme">mode_comment</i><i class="button material-icons share">send</i><i class="button material-icons forget red" id="forget">delete</i></div><div class="rdropdown"><p>This makes me feel...</p><table class="roptions"><tbody><tr><td class="column"><div class="roption" id="r0"><i class="material-icons">favorite</i><p>kind</p></div><div class="roption" id="r1"><i class="material-icons">people_outline</i><p>extraverted</p></div><div class="roption" id="r2"><i class="material-icons">public</i><p>open</p></div><div class="roption" id="r3"><i class="material-icons">school</i><p>diligent</p></div><div class="roption" id="r4">    <i class="material-icons">whatshot</i><p>neurotic</p></div></td><td class="column"><div class="roption" id="r5"><i class="material-icons">new_releases</i><p>evil</p></div><div class="roption" id="r6"> <i class="material-icons">book</i><p>introverted</p></div><div class="roption" id="r7"><i class="material-icons">lock_outline</i><p>intolerant</p></div><div class="roption" id="r8"><i class="material-icons">alarm_off</i><p>lazy</p></div><div class="roption" id="r9"><i class="material-icons">nature</i><p>stable</p></div></td></tr></tbody></table></div><div class="cheading"><hr></div><form class="commentform" onsubmit="submitComment()"><!--input(type="text" class="id" value=_id)--><!--input(type="text" class="id" value=post._id)--><input type="text" class="comment-text"></input><button class="comment-button" type="submit"><i class="material-icons">check</i></button></form><form class="shareform"><div class="part1"><p class="faded">Share with</p><select class="recipient"><option class="self" value="self">Joaquin</option><option value="and I">and I</option><option value="Myself">Myself</option><option value="Sara">Sara</option><option value="Reine">Reine</option><option value="Karime">Karime</option><option value="Elisa">Elisa</option><option value="Erik">Erik</option><option value="Daniel">Daniel</option><option value="Arantza">Arantza</option><option value="Lizard Person">Lizard Person</option><option value="Snake">Snake</option><option value="Tayla">Tayla</option></select></div><div class="part2"><p class="from faded">from</p><input class="dateinput" type="date" name="date"></div><button class="sharebutton" type="button"><i class="material-icons">check</i></button></form><div class="comments"></div>'
var writePostHTML;
var active;

function postHover(){
  $('.post').hover(function(){
    $(this).addClass('hover');
  }, function(){
    $(this).removeClass('hover');
  });
}

//================SHOWING A MESSAGE=================//

function lowerMessage(message){
  $('body').append(message);
  $('.message').animate({
    bottom: 0
  }, 200);
  setTimeout(function(){
    $('.message').animate({
      bottom: '-3rem'
    }, 200, function(){
      $('.message').remove();
    });
  }, 6000);
}

//================ FORGETTING A POST =================//

function enableForget(){
  $(".forget").unbind().click(function(){
    postId = $(this).closest('.post').find('.post_id').html();
    var postIndex = $(this).closest('.post').attr('id');
    console.log(postId, postIndex);
    $.ajax({
      url: '/forget',
      type: 'POST',
      data: {
        post_id: postId,
        post_index: postIndex,
        user_id: personId,
      },
      success: function(data){
        $('#' + postIndex + ' .text').css('opacity', data.memory);
        $('#' + postIndex + ' .reactview').css('opacity', data.memory);
        lowerMessage("<div class='message'><i class='material-icons'>check_circle</i> This post is less visible to you, but we cannot guarantee it will disappear. </div>")
      }
    });
  });
}

//================ CHANGING THE PROFILE PICTURE ===================//

$("#profpic").click(function(){
  $("#ppinput").trigger("click");
});

$("#ppinput").on('change', function(e){
  e.preventDefault();
  $("#ppform").ajaxSubmit({
    data: {user_id: personId},
    error: function(err) {
      status('Error: ' + err.status);
    },
    success: function(data) {
      console.log(data);
      $("#profpic").css('background', 'url("./uploads/' + data + '")');
      $("#ppform").addClass('hidden');
      lowerMessage("<div class='message'><i class='material-icons'>check_circle</i> Your profile picture has been changed.</div>");
    }
  });
  return false;
});


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
        $("#" + i).attr('id', i+1);
      }
      postsLength++;
      $(".posts").prepend(newPostHTML);

      $("#0").find(".post_id").html(postId);
      $("#0").find(".reactview").html("<p class='big blankreaction'>...</p>");
      $("#0").find(".reactview").css("background", "rgba(0, 0, 0, 0.14)");
      $("#0").find(".top .date").html(months[data.date.month] + " " + data.date.day + ", " + data.date.year)
      $("#0").find(".top .text").html(data.text);
      $("#0").find(".comments").html("");
      $("#writepost").css("display", "none");
      $("#writepost").html(writePostHTML);
      $("#0").find(".recipient").html("<option class='self' value = 'self'>" + personName.split(' ')[0] + "</option>");
      for(var i = 0; i < user_friends.length; i++){
        $("#0").find(".recipient").append("<option value=" + user_friends[i] + ">" + user_friends[i] + "</option>");
      }

      $("#0").removeClass('hidden');
      enableComments();
      enableForget();
      enableShare();
      enableReactions();
      $("#post_text").val("");
      checkComments();
      postHover();
      enableNewPost();
      active = 0;
    }
  });
};

function enableNewPost(){
  active = 0;
  $("#newpost").click(function(){
    if(!active){
      active = 1;
      $(this).addClass("active-button");
      $("#writepost").css("display", "flex");
      $("#gotodate").removeClass("active-button");
      $("#dateform").css("display", "none");
    }else{
      active = 0;
      $(this).removeClass("active-button");
      $(this).addClass("button");
      $("#writepost").css("display", "none");
    }
  });

  $("#postbutton").click(function(){

    $("#newpost").removeClass("active-button");
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
        reaction: -1,
        memory: 1
      };
      console.log(newPost);
      newPostAjax(newPost);
      writePostHTML = $("#writepost").html();
      $("#writepost").html("<h1>...</h1>")
      enableComments();
      enableShare();
      enableForget();
      enableReactions();
      enableNewPost();
    }
  });
}

//================ DISPLAY PERSONALITY TRAITS IN HEADER =================//

function nextPage(){
  $("#pg1").animate({"opacity": "0"}, 250, function(){
    $("#pg1").addClass("hidden");
    $("#pg2").css("opacity", "0");
    $("#pg2").removeClass("hidden");
    setTimeout(function(){$("#pg2").animate(
      {"opacity": "1"}, 250
    );}, 20);
  });
}

function prevPage(){
  $("#pg2").animate({"opacity": "0"}, 250, function(){
    $("#pg2").addClass("hidden");
    $("#pg1").css("opacity", "0");
    $("#pg1").removeClass("hidden");
    setTimeout(function(){$("#pg1").animate(
      {"opacity": "1"}, 250
    );}, 20);
  });
}

$("#next-page").click(function(){
  nextPage();
});

$("#prev-page").click(function(){
  prevPage();
});

//================ DISPLAY POSTS FROM A SPECIFIC DATE ===================//

function appendMonths(){
  $(".yearbutton").click(function(){
    $("#monthoptions").html("");
    var myYear = $(this).attr('id');
    var month = '';
    $(".post").each(function(){
      var thisPost = $(this);
      var postYear = $(this).find(".top .date").html().split(',')[1];
      if(postYear == myYear){
        var newMonth = $(this).find(".top .date").html().split(' ')[0];
        if(newMonth != month){
          month = newMonth;
          $("#monthoptions").append("<h4 class='monthbutton' id='" + newMonth + "," + thisPost.attr("id") + "'>" + newMonth + "</h4>");
        }
      } else if(postYear < myYear)
        return;
    });

    $("#yearpick").animate({"margin-right": "150px", "opacity": "0"}, 250, function(){
      $("#yearpick").addClass("hidden");
      $("#monthpick").removeClass("hidden");
      $("#monthpick").css("margin-right", "-150px");
      setTimeout(function(){$("#monthpick").animate(
        {"opacity": "1", "margin-right": "0"}, 250
      );}, 20);
    });


    $("#monthpick").css("opacity", "0");
    $(".monthbutton").click(function(){
      $("#dateform").css("display", "none");
      var scrollPost = $(this).attr("id").split(',')[1];
      $('html, body').animate({
        scrollTop: $("#" + scrollPost).offset().top - 85
      }, 1500);
      console.log("#" + scrollPost);
    });

  });
}

$("#gotodate").click(function(){
  $("#dateform").html(ogDateForm);
  active = 0;
  if($("#dateform").css("display") == "none"){
    $("#dateform").css("display", "flex");
    $(this).addClass("active-button");
    $("#newpost").removeClass("active-button");
    $("#writepost").css("display", "none");

    //Choose a year...
    var year = 0;
    $(".post").each(function(){
      var newYear = ($(this).find(".top .date").html().split(',')[1]);
      if(newYear != year){
        $("#yearoptions").append("<h4 class='yearbutton' id='" + newYear + "'>" + newYear + "</h4>");
        year = newYear;
      }
    });

    appendMonths();

  }
  else{
    $("#dateform").css("display", "none");
    $(this).removeClass("active-button");
  }
});

var date2go = [0, 0];

$(".month").click(function(){

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
    var postDiv = $(this).closest(".post");
    postDiv.find(".reactme").removeClass("active-button");
    postDiv.find(".rdropdown").removeClass("show");
    var shareForm = $(this).parent().parent().find(".shareform")
    if(shareForm.css('display') != 'flex'){
      postDiv.find(".commentform").css("display", "none");
      postDiv.find(".commentme").removeClass("active-button");
      $(this).addClass("active-button");
      shareForm.css('display', 'flex');
      postDiv.find(".cheading").css("display", "block");
    }
    else{
      $(this).removeClass("active-button");
      shareForm.css('display', 'none');
      if(postDiv.find('.comments').html() == '')
        postDiv.find(".cheading").css("display", "none");
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
    $(".feedbody").prepend("<div class='notifdiv'><div class='nheader'><h4>Notifications</h4><a id='ntoggle'>hide</a></div><div class='notifications'></div></div>");
    for(var i = 0; i < nArray.length; i++){
      console.log(nArray[i]);
      var postHTML = $("#" + nArray[i]).html();
      $(".notifications").append("<h5 class='notification-title'>Someone shared a post with you!</h5><div class='card post' id='" + nArray[i] + "'>" + postHTML + "</div>");
    }
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
  enableForget();
  enableReactions();
}

//================ COMMENTING A POST ===================//

function enableComments(){
  $(".commentme").unbind().click(function(){
    var postDiv = $(this).closest(".post");
    $(this).parent().find(".shareform").css("display", "none");
    $(this).parent().find(".reactme").removeClass("active-button");
    postDiv.find(".reactme").removeClass("active-button");
    postDiv.find(".rdropdown").removeClass("show");
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

  $(".commentform").submit(function(event) {
    event.preventDefault();
    postIndex = $(this).closest(".post").attr('id');
    var comment_text = $(this).find(".comment-text").val();
    var id = $(this).closest(".post").find('.post_id').html();
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
          $("#" + postIndex + " .comments").append("<div class='comment'><p class='date'>" + personName.split(" ")[0] + " - " + months[comment.date.month] + " " + comment.date.day + ", " + comment.date.year + "</p><p class='text'>" + comment.text + "</p>")
          $("#" + postIndex).find(".cheading").css("display", "block");
          $("#" + postIndex).find(".commentme").removeClass("active-button");
          $("#" + postIndex).find(".commentform").css("display", "none");
          $("#" + postIndex).find(".comment-text").val("");
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
    var postDiv = $(this).closest(".post");
    postDiv.find(".shareform").css("display", "none");
    postDiv.find(".share").removeClass("active-button");
    postDiv.find(".commentform").css("display", "none");
    postDiv.find(".commentme").removeClass("active-button");
    if(postDiv.find(".rdropdown").css("display") != "block"){
      postDiv.find(".rdropdown").addClass("show");
      $(this).addClass("active-button");
    if(postDiv.find('.comments').html() == '')
      postDiv.find(".cheading").css("display", "none");
    }
    else{
      postDiv.find(".rdropdown").removeClass("show");
      $(this).removeClass("active-button");
    }
  });

  $(".close").unbind().click(function(){
    var postDiv = $(this).closest(".post");
    $(this).closest(".rdropdown").removeClass("show");
    postDiv.find(".reactme").removeClass("active-button");
  });

  $(".reactview").unbind().click(function(){
    var postDiv = $(this).closest(".post");
    if(postDiv.find(".rdropdown").css("display") != "block"){
      postDiv.find(".rdropdown").addClass("show");
      postDiv.find(".reactme").addClass("active-button");
    }
    else{
      postDiv.find(".rdropdown").removeClass("show");
      postDiv.find(".reactme").removeClass("active-button");
    }
  });

  /* User selects a reaction */
  $(".roption").click(function(){
    var postDiv = $(this).closest(".post");
    postId = postDiv.find(".post_id").html();
    postIndex = postDiv.attr("id");
    reactionIndex = $(this).attr("id").split('r')[1];
    var theIcon = postDiv.find('.reactview');
    $(".rdropdown").removeClass("show");
    postDiv.find(".reactme").removeClass('active-button');

    theIcon.css('background', rColors[reactionIndex]);
    theIcon.html('');
    theIcon.append('<i class="material-icons big white">'+rIcons[reactionIndex]+'</i>');

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
  ogDateForm = $("#dateform").html();
  enableNewPost();
  checkNotifications();
  $('.dateinput').val(new Date().toDateInputValue());
  postHover();
  if(image) $("#profpic").css('background', 'url("./uploads/' + image + '")');
});
