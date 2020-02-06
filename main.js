const pageLimit = 240
const pageLimitVortex = 540
  
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
      div.style.height = 45 + 'px'
      div.style.opacity = '0.'+ NumberRandom 
      div.style.width = 45 + 'px'
      div.style.fontSize = NumberRandom + 'px'
      div.style.color = ColorRandom
      div.style.float = 'left'
      div.style.webkitTransform = 'rotate('+NumberRandomforRotate+'deg)' 
      div.style.mozTransform    = 'rotate('+NumberRandomforRotate+'deg)' 
      div.style.msTransform     = 'rotate('+NumberRandomforRotate+'deg)' 
      div.style.oTransform      = 'rotate('+NumberRandomforRotate+'deg)' 
      div.style.transform       = 'rotate('+NumberRandomforRotate+'deg)'
      //document.getElementsByTagName('body').style.backgroundColor = ColorRandom
      letters.appendChild(div)

  }
}

window.onload = () => {
  const vortex = document.getElementById('vortex')
  montaLetras();
  
//   for(let i = 1; i <= pageLimit; i++) {
//     document.getElementsByTagName('board').innerHTML += '<li class="class-'+i+'"></li>'
//   }
  
   for(let i = 0 ; i < pageLimitVortex ;i++){
      let NumberRandomVortex = Math.floor((Math.random() * 250) + 1)
      let brick = document.createElement('div')
      brick.style.left = i + 'px'
      brick.style.top = i + 'px'
      brick.style.fontSize = i + 'px'
      brick.textContent = 'I'
      brick.style.webkitTransform = 'rotate('+ i + NumberRandomVortex +'deg)'
      brick.classList.add('item')
      vortex.appendChild(brick)
  }
  
}



