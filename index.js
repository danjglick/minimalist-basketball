const MILLISECONDS_PER_FRAME = 50
const BALL_RADIUS = visualViewport.width / 20
const GRAVITY = -10
const WALLS = {
  right: "right",
  bottom: "bottom",
  left: "left"
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
let platforms = []
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
  initializePlatforms()
  gameLoop()
}

function initializePlatforms() {
  for (i = 0; i < 6; i++) {
    let platform = {
      xPos: canvas.width * Math.random(),
      yPos: canvas.height * Math.random()
    }
    platforms.push(platform)
  }
}

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawHoop()
  drawPlatforms()
  drawBall()
  moveBall()
  let intersectedWalls = getIntersectedWalls()
  for (i = 0; i < intersectedWalls.length; i++) {
    bounceBall(intersectedWalls[i])
  }
  if (isFieldgoal()) {
    handleFieldgoal()
  }
  setTimeout(gameLoop, MILLISECONDS_PER_FRAME)
}

function drawHoop() {
  let element = document.createElement("IMG")
  element.src = hoop.src
  context.drawImage(element, hoop.xPos, hoop.yPos, hoop.diameter, hoop.diameter)
}

function drawPlatforms() {
  for (i = 0; i < platforms.length; i++) {
    let platform = platforms[i]
    context.beginPath()
    context.moveTo(platform.xPos, platform.yPos)
    context.lineTo(platform.xPos + PIXEL_SHIM * 2, platform.yPos)
    context.stroke()
  }
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPos, ball.yPos, BALL_RADIUS, 0, 2 * Math.PI)
  context.fillStyle = ball.color
  context.fill()
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
    walls.push(WALLS.right)
  }
  if (ball.yPos > canvas.height - PIXEL_SHIM) {
    walls.push(WALLS.bottom)
  }
  if (ball.xPos < PIXEL_SHIM) {
    walls.push(WALLS.left)
  }
  return walls
}

function bounceBall(wall) {
  switch (wall) {
    case WALLS.right:
      ball.xSpeed = -Math.abs(ball.xSpeed) + (ball.xSpeed / POST_BOUNCE_SPEED_DIVISOR)
      break
    case WALLS.bottom:
      ball.ySpeed = -Math.abs(ball.ySpeed) + (ball.ySpeed / POST_BOUNCE_SPEED_DIVISOR)
      break
    case WALLS.left:
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
    return true
  }
  return false
}

function handleFieldgoal() {
  score += 1
  document.getElementById("score").innerHTML = String(score)
  document.getElementById("swish").play()
}
