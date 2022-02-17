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
const MILLISECONDS_PER_FRAME = 50
const GRAVITY = -10
const WALLS = {
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom",
  LEFT: "left"
}
const PIXEL_SHIM = visualViewport.width / 10
const POST_BOUNCE_SPEED_DIVISOR = 2

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
  let intersectedWalls = getIntersectedWalls()
  for (i = 0; i < intersectedWalls.length; i++) {
    bounceBall(intersectedWalls[i])
  }
  setTimeout(gameLoop, MILLISECONDS_PER_FRAME)
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPos, ball.yPos, BALL_RADIUS, 0, 2 * Math.PI)
  context.fillStyle = "orange"
  context.fill()
}

function drawHoop() {
  
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

function getIntersectedWalls() {
  walls = []
  if (ball.yPos < PIXEL_SHIM) {
    walls.push(WALLS.TOP)
  }
  if (ball.xPos > canvas.width - PIXEL_SHIM) {
    walls.push(WALLS.RIGHT)
  }
  if (ball.yPos > canvas.height - PIXEL_SHIM) {
    walls.push(WALLS.BOTTOM)
  }
  if (ball.xPos < PIXEL_SHIM) {
    walls.push(WALLS.LEFT)
  }
  return walls  
}

function bounceBall(wall) {
  switch (wall) {
    case WALLS.TOP:
      ball.ySpeed = Math.abs(ball.ySpeed) - (ball.ySpeed / POST_BOUNCE_SPEED_DIVISOR)
      break
    case WALLS.RIGHT:
      ball.xSpeed = -Math.abs(ball.xSpeed) + (ball.xSpeed / POST_BOUNCE_SPEED_DIVISOR)
      break
    case WALLS.BOTTOM:
      ball.ySpeed = -Math.abs(ball.ySpeed) + (ball.ySpeed / POST_BOUNCE_SPEED_DIVISOR)
      break
    case WALLS.LEFT:
      ball.xSpeed = Math.abs(ball.xSpeed) - (ball.xSpeed / POST_BOUNCE_SPEED_DIVISOR)
      break
  }
  if (ball.ySpeed < 0 && ball.ySpeed > -20 && ball.yPos > canvas.height - PIXEL_SHIM) {
    ball.ySpeed = 0
  }
  if (Math.abs(ball.xSpeed) < 20) {
    ball.xSpeed = 0
  }
}



