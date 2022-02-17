const BALL_RADIUS = visualViewport.width / 20
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
let canvas
let context
let ball = {
  xPos: visualViewport.width / 2,
  yPos: visualViewport.height - 50,
  xSpeed: 0,
  ySpeed: 0,
  color: "orange"
}
let hoop = {
  xPos: visualViewport.width / 3,
  yPos: visualViewport.height / 3,
  src: "images/hoop.png",
  diameter: 100
}
let touchstart = {
  xPos: 0,
  yPos: 0
}
let score = 0

function initializeGame() {  
  canvas = document.getElementById("canvas")
  canvas.width = visualViewport.width
  canvas.height = visualViewport.height
  context = canvas.getContext('2d')
  document.addEventListener("touchstart", handleTouchstart)
  document.addEventListener("touchmove", handleTouchmove, { passive: false })
  gameLoop()
}

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawHoop()
  drawBall()
  moveBall()
  let intersectedWalls = getIntersectedWalls()
  for (i = 0; i < intersectedWalls.length; i++) {
    bounceBall(intersectedWalls[i])
  } 
  isFieldgoal()
  setTimeout(gameLoop, MILLISECONDS_PER_FRAME)
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPos, ball.yPos, BALL_RADIUS, 0, 2 * Math.PI)
  context.fillStyle = ball.color
  context.fill()
}

function drawHoop() {
  let element = document.createElement("IMG")
  element.src = hoop.src
  context.drawImage(element, hoop.xPos, hoop.yPos, hoop.diameter, hoop.diameter)
}

function handleTouchstart(e) {
  touchstart.xPos = e.touches[0].clientX
  touchstart.yPos = e.touches[0].clientY
}

function handleTouchmove(e) {
  e.preventDefault()
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
  if (ball.ySpeed != 0) {
    document.getElementById("bounce").play()
  }
}

function isFieldgoal() {
  if (
    ball.ySpeed > 0 &&
    ball.xPos > hoop.xPos && 
    ball.xPos < hoop.xPos + hoop.diameter &&
    ball.yPos > hoop.yPos &&
    ball.yPos < hoop.yPos + hoop.diameter
  ) {
    score += 1
    document.getElementById("score").innerHTML = String(score)
    document.getElementById("swish").play()
  }  
}



