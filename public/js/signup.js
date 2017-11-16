$("#addfriend").click(function(){
  $("#friendsform").append("<input type=text class='friend'/></br>");
});

function ajaxCall(name, email, password, friendArray){
  //console.log("sending ajax call");
  $.ajax({
    url: '/newprofile',
    type: 'POST',
    data: {
      user_name: name,
      user_email: email,
      user_password: password,
      user_friends: friendArray
    },
    success: function(data){
      console.log("success in sending signup call");
    }
  });
  window.location.href = '/feed';
};

$("#submitform").click(function(){
  friendArray = [];

  $(".friend").each(function(){
    if($(this).val() != '')
      friendArray.push($(this).val());
  });

  ajaxCall($("#name").val(), $("#email").val(), $("#password").val(), friendArray);

});
