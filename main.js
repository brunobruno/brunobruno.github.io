const pageLimit = 240
const pageLimitVortex = 540

window.onload = () => {
  const vortex = document.getElementById('vortex')
  montaLetras();
  
//   for(let i = 1; i <= pageLimit; i++) {
//     document.getElementsByTagName('board').innerHTML += '<li class="class-'+i+'"></li>'
//   }
  
   for(let i = 0 ; i < pageLimitVortex ;i++){
      let NumberRandomVortex = Math.floor((Math.random() * 250) + 1)
      let brick = document.createElement('div')
      brick.style.left = '0.'+ i +'px'
      brick.style.top = i + 'px'
      brick.style.fontSize = i + 'px'
      brick.style.width = '1' + i +'px'
      brick.style.transform = 'rotate3d(1,1,1,'+ i +'deg)'
      brick.classList.add('item')
      vortex.appendChild(brick)
  }
  
}

function montaLetras() {
  
  const letters = document.getElementById('letters')
  letters.innerHTML = ''

   for(i = 0; i < 1000; i++) {

      let NumberRandom = Math.floor((Math.random() * 250) + 1)
      let NumberRandomforRotate = Math.floor((Math.random() * 360) + 1) 
      let value = Math.random() * 0xFF | 0
      let grayscale = (value << 16) | (value << 8) | value
      let ColorRandom  = '#' + grayscale.toString(16)
      let div = document.createElement('div')
      let chars = "abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ1234567890"
      let randomChars = chars.substr( Math.floor(Math.random() * 30), 1)

      div.innerHTML = randomChars
      div.style.opacity = '0.'+ NumberRandom 
      div.style.fontSize = NumberRandom + 'px'
      div.style.color = ColorRandom
      //div.style.webkitTransform = 'rotate('+NumberRandomforRotate+'deg)' 
      //div.style.mozTransform    = 'rotate('+NumberRandomforRotate+'deg)' 
      //div.style.msTransform     = 'rotate('+NumberRandomforRotate+'deg)' 
      //div.style.oTransform      = 'rotate('+NumberRandomforRotate+'deg)'
      div.style.filter = 'blur('+NumberRandomforRotate+'px)'
      div.style.transform = 'rotate('+NumberRandomforRotate+'deg)'
      div.classList.add('letter')
      //document.getElementsByTagName('body').style.backgroundColor = ColorRandom
      letters.appendChild(div)

  }
}



