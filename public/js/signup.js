$("#addfriend").click(function(){
  $("#friendsform").append("<input type=text class='friend'/></br>");
});

$("#submitform").click(function(){
  friendArray = [];

  $(".friend").each(function(){
    if($(this).val() != '')
      friendArray.push($(this).val());
  });

  ajaxCall($("#name").val(), $("#email").val(), $("#password").val(), friendArray);

});
