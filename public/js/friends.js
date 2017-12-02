function newFriendAjax(newFriend){
  $.ajax({
    url: '/newfriend',
    type: 'POST',
    data: {
      id: personId,
      friend: newFriend,
    },
    success: function(data){
      console.log("success in receiving new friend response", data);
      var newFriendHTML = "<div class='card' id=0><div class='top'><p class='friendname'>" + data + "</p></div><form class='friend-buttons'><input type='text' class='id' value='" + personId + "'/><button type='button' class='red'>Remove</button></form></div>";
      for(var i = friendsLength; i >= 0; i--){
        $("#" + i).attr('id', i+1);
      }
      $(".friends").prepend(newFriendHTML);
      enableFriend();
      $("#friend_name").val("");
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
};

$("#postbutton").click(function(){
  if($("#friend_name").val() != '')
    newFriendAjax($("#friend_name").val());
});

$("#newfriend").click(function(){
  $("#addfriendcard").css('display', 'block');
  $(this).css('display', 'none');
});

enableFriend();
