var addFriendHTML;

function newFriendAjax(newFriend){
  $.ajax({
    url: '/newfriend',
    type: 'POST',
    data: {
      id: personId,
      friend: newFriend,
    },
    success: function(data){
      var newFriendHTML = "<div class='card friend' id=0><div class='top'><p class='friendname'>" + data + "</p></div><form class='friend-buttons'><input type='text' class='id' value='" + personId + "'/><i class='button material-icons removefriend red'>delete</i></form></div>";
      for(var i = friendsLength; i >= 0; i--){
        $("#" + i).attr('id', i+1);
      }
      $("#friendslist").prepend(newFriendHTML);
      enableFriend();
      postButton();
      $("#friend_name").val("");
      $("#addfriendcard").css('display', 'none');
      $("#newfriendb").css('display', 'block');
      $("#addfriendcard").html(addFriendHTML);
    },
    failure: function(err){
      console.log(err);
    }
  });
};

function enableFriend(){
  $(".removefriend").click(function(){
    var friendIndex = $(this).parent().parent().attr('id');
    $.ajax({
      url: '/removefriend',
      type: 'POST',
      data: {
        id: personId,
        friend_index: friendIndex,
      },
      success: function(data){
        console.log("success in receiving remove friend response", data);
        $("#" + friendIndex).remove(); //The data returned by the server is the friend index.
      }
    });
  });

  $("#newfriendb").click(function(){
    $("#addfriendcard").css('display', 'block');
    $(this).css('display', 'none');
  });

};

function addFriend() {
  if($("#friend_name").val() != ''){
    newFriendAjax($("#friend_name").val());
    addFriendHTML = $("#addfriendcard").html();
    $("#addfriendcard").html("<p class='big'>...</p>");
  }
}

function postButton(){
$(".sharebutton").click(function(){
  addFriend();
});
}

postButton();
enableFriend();
