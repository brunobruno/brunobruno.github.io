// just a experiment, the important here is that i accomplished what was on my head

var pageLimit=240;
var pageLimitVortex=340;


function montaLetras() {
  $('#letters').empty();
   for( i=0; i < 1000; i++) {

      var NumberRandom = Math.floor((Math.random() * 250) + 1); 
      var NumberRandomforRotate = Math.floor((Math.random() * 360) + 1); 
      var value = Math.random() * 0xFF | 0;
      var grayscale = (value << 16) | (value << 8) | value;
      var ColorRandom  = '#' + grayscale.toString(16);
      var div = document.createElement('div');
      var body = document.getElementsByTagName('body');
      var chars = "abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ1234567890";
      var randomChars = chars.substr( Math.floor(Math.random() * 30), 1);

      div.innerHTML = randomChars;
      div.style.height = 45 + 'px';
      div.style.opacity = '0.'+ NumberRandom; 
      div.style.width = 45 + 'px';
      div.style.fontSize = NumberRandom + 'px';
      div.style.color = ColorRandom;
      div.style.float = 'left';
      div.style.webkitTransform = 'rotate('+NumberRandomforRotate+'deg)'; 
      div.style.mozTransform    = 'rotate('+NumberRandomforRotate+'deg)'; 
      div.style.msTransform     = 'rotate('+NumberRandomforRotate+'deg)'; 
      div.style.oTransform      = 'rotate('+NumberRandomforRotate+'deg)'; 
      div.style.transform       = 'rotate('+NumberRandomforRotate+'deg)';
      document.body.style.backgroundColor = ColorRandom;
     
      $('#letters').append(div);

  }
}


// var numTimeouts = 10000,
//     i = 0;

// for (; i < numTimeouts; i++) {
//     window.setTimeout(function () {
//         montaLetras();
//     }, 9000);
// }



$(document).ready(function() {
    montaLetras();
    for(var i = 1; i <= pageLimit; i++) { 
      $('#board').append('<li class="class-'+i+'"></li>');
    }
  for(var i = 1; i <= pageLimitVortex; i++) {
    var NumberRandomVortex = Math.floor((Math.random() * 250) + 1); 
//  $('body').append('<div class="item" style="left:'+i+'px; top:'+i+'px; transform: rotate('+i+'deg);width:1'+i+'px;"></div>');
    $('body').append('<div class="item" style="left:0.'+i+'px; top:'+i+'px; transform: rotate3d(1,1,1,'+i+'deg);width:1'+i+'px;"></div>');
  }

});
