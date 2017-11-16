function ajaxCall(email, password){
  //console.log("sending ajax call");
  $.ajax({
    url: '/loginattempt',
    type: 'POST',
    data: {
      user_email: email,
      user_password: password,
    },
    success: function(){
      console.log("success sending login call");
      window.location.href = '/feed';
    },
    error: function(){
      console.log("error sending login call");
    }
  });
};

$("#submitform").click(function(){
  ajaxCall($("#email").val(), $("#password").val());
});
