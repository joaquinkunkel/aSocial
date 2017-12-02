var arrow = $('.arrow');
var range = 50;

$(window).on('scroll', function () {
  var scrollTop = $(this).scrollTop(),
      height = arrow.outerHeight(),
      offset = height / 2,
      calc = 1 - (scrollTop - 3 * offset + range) / range;
  arrow.css({ 'opacity': calc });
  if (calc > '1') {
    arrow.css({ 'opacity': 1 });
  } else if ( calc < '0' ) {
    arrow.css({ 'opacity': 0 });
  }
});

var down = 0;
$(function() {
  $('.arrow').on('click', function(e) {
    $('html, body').animate({ scrollTop: $('#about').offset().top}, 500, 'linear');
  });
});
