var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var postIndex;
var postId;

function ajaxCall(newPost){
  console.log("we callin");
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
      newPostHTML = "<div class='card' id=" + 0 + "><div class='top'><p class='date'>" + months[data.date.month] + " " + data.date.day + ", " + data.date.year + "</p><p class='text'>" + data.text + "</p></div><div class='post-buttons'><a class='commentme'>Comment</a><a class='share'>Share</a></div><form class='commentform'><input type='text' class='id' value='" + personId + "'/><input type='text' class='id' value='" + postId + "'/><input type='text' class='comment-text'/><button type='button' class='comment-button'>Post</button></form><div class='comments'></div>";
      for(var i = postsLength; i >= 0; i--){
        //console.log(i);
        $("#" + i).attr('id', i+1);
      }
      $(".posts").prepend(newPostHTML);
      enableComments();
      $("#post_text").val("");
    }
  });
};

$("#newpost").click(function(){
  $(this).css("display", "none");
  $("#writepost").css("display", "flex");
});

$("#postbutton").click(function(){
  var date = new Date;
  var newPost = {
    text: $("#post_text").val(),
    date: {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    },
    comments: [],
    reactions: [],
    image: ''
  };
  console.log(newPost);
  ajaxCall(newPost);
});

function enableComments(){
  $(".commentme").click(function(){
    if($(this).parent().parent().find('.commentform').css('display') == 'none'){
      $(this).parent().parent().find('.commentform').css('display', 'flex');
    } else {
      $(this).parent().parent().find('.commentform').css('display', 'none');
    }
  });
  $(".comment-button").click(function(){
    var date = new Date;
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

enableComments();
