var pageLimit=140;
  setTimeout(function(){
    console.log('sim');
  }, 200);


$(document).ready(function() {
  for( i=0; i < 1000; i++) {

  var NumberRandom = Math.floor((Math.random() * 250) + 1); 
  var NumberRandomforRotate = Math.floor((Math.random() * 360) + 1); 
  var value = Math.random() * 0xFF | 0;
  var grayscale = (value << 16) | (value << 8) | value;
  var ColorRandom  = '#' + grayscale.toString(16);
  var div = document.createElement('div');
  var chars = "abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
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
  $('#letters').append(div);
}
 
    for(var i = 1; i <= pageLimit; i++) {
    $('#board').append('<li class="class-'+i+'"></li>')
  }
});
