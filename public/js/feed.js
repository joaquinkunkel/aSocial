var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
      console.log("success in sending new post call", newPost);
      newPostHTML = "<div class='card'><p class='date'>" + months[newPost.date.month] + " " + newPost.date.day + ", " + newPost.date.year + "</p><p class='text'>" + newPost.text + "</p></div>";
      $(".posts").prepend(newPostHTML);
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
