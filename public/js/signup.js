function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function emailExists(email) {

  var answer = true;
  $.ajax({
    url: '/new-email',
    type: 'POST',
    data: {
      email: email,
    },
    success: function(data){
      if(data==true){
        $("#warning2").remove();
        $("#email").addClass("red-text");
        $("input[type=submit]").prop("disabled", true);
        $("input[type=submit]").addClass("disabled-button");
        $("<p id='warning2' class='small-label'><br/>This email is already used by an account. Please try another one.</p>").insertBefore("#email");
      } else {
        $("#warning2").remove();
        $("#email").removeClass("red-text");
        $("input[type=submit]").prop("disabled", false);
        $("input[type=submit]").removeClass("disabled-button");
      }
    }
  });
}

$(document).ready(function(){
  $("input[type=submit]").prop("disabled", true);
  $("#email").keyup(function(){
    $("#warning2").remove();
    $("#warning1").remove();
    var formEmail = $(this).val().toLowerCase();
    if(!isEmail(formEmail)){
      $("#email").addClass("red-text");
      $("input[type=submit]").prop("disabled", true);
      $("input[type=submit]").addClass("disabled-button");
      $("<p id='warning1' class='small-label'><br/>Please use a valid e-mail address.</p>").insertBefore("#email");
    }
    else {
      emailExists(formEmail);
    }
  });
});
