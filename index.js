let canvas
let context
let ball = {
  xPos: visualViewport.width / 2,
  yPos: visualViewport.height - 50,
  xSpeed: 0,
  ySpeed: 0
}
let touchstart = {
  xPos: 0,
  yPos: 0
}
const BALL_RADIUS = visualViewport.width / 25
const MILLISECONDS_PER_FRAME = 100
const GRAVITY = -10

function initializeGame() {  
  canvas = document.getElementById("canvas")
  canvas.width = visualViewport.width
  canvas.height = visualViewport.height
  context = canvas.getContext('2d')
  document.addEventListener("touchstart", handleTouchstart)
  document.addEventListener("touchmove", handleTouchmove)
  gameLoop()
}

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawBall()
  moveBall()
  setTimeout(gameLoop, MILLISECONDS_PER_FRAME)
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPos, ball.yPos, BALL_RADIUS, 0, 2 * Math.PI)
  context.fillStyle = "orange"
  context.fill()
}

function handleTouchstart(e) {
  touchstart.xPos = e.touches[0].clientX
  touchstart.yPos = e.touches[0].clientY
}

function handleTouchmove(e) {
  ball.xSpeed = e.touches[0].clientX - touchstart.xPos
  ball.ySpeed = e.touches[0].clientY - touchstart.yPos
}

function moveBall() {
  ball.xPos += ball.xSpeed
  ball.yPos += ball.ySpeed
  if (ball.ySpeed != 0) {
    ball.ySpeed -= GRAVITY
  }
}



