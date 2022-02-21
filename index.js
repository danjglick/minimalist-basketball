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
const PLATFORM_LENGTH = PIXEL_SHIM * 2
const MINIMUM_SPEED = 20

let canvas
let context
let ball = {
  xPos: visualViewport.width / 2,
  yPos: visualViewport.height - 50,
  xVelocity: 0,
  yVelocity: 0,
  color: "orange"
}
let platforms = []
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
  initializeHoop()
  initializePlatforms()
  gameLoop()
}

function initializeHoop() {
  hoop.xPos = canvas.width * Math.random()
  hoop.yPos = canvas.height * Math.random()
}

function initializePlatforms() {
  for (i = 0; i < 5; i++) {
    let spotA = {
      xPos: canvas.width * Math.random(),
      yPos: canvas.height * Math.random()
    }
    let spotB = {
      xPos: canvas.width * Math.random(),
      yPos: canvas.height * Math.random()
    }
    let ratioXVelocityToYVelocity = (spotB.xPos - spotA.xPos) / (spotB.yPos - spotA.yPos)
    let xVelocityToSpotB = ratioXVelocityToYVelocity 
    let yVelocityToSpotB = (spotB.yPos - spotA.yPos) / Math.abs(spotB.yPos - spotA.yPos)
    let platform = {
      xPos: spotA.xPos,
      yPos: spotA.yPos,
      xVelocity: xVelocityToSpotB,
      yVelocity: yVelocityToSpotB,
      xVelocityToSpotB: xVelocityToSpotB,
      yVelocityToSpotB: yVelocityToSpotB,
      xVelocityToSpotA: -xVelocityToSpotB,
      yVelocityToSpotA: -yVelocityToSpotB,
      spotA: spotA,
      spotB: spotB
    }
    platforms.push(platform)
  }
}

function movePlatforms() {
  for (i = 0; i < platforms.length; i++) {
    let platform = platforms[i]
    platform.xPos = platform.xPos + platform.xVelocity,
    platform.yPos = platform.yPos + platform.yVelocity
    if (
      Math.abs(platform.xPos - platform.spotB.xPos) < PIXEL_SHIM && 
      Math.abs(platform.yPos - platform.spotB.yPos) < PIXEL_SHIM
    ) {
      platform.xVelocity = platform.xVelocityToSpotA
      platform.yVelocity = platform.yVelocityToSpotA
    } else if (
      Math.abs(platform.xPos - platform.spotA.xPos) < PIXEL_SHIM && 
      Math.abs(platform.yPos - platform.spotA.yPos) < PIXEL_SHIM
    ) {
      platform.xVelocity = platform.xVelocityToSpotB
      platform.yVelocity = platform.yVelocityToSpotB
    }
  }
}

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawHoop()
  drawPlatforms()
  drawBall()
  moveBall()
  movePlatforms()
  for (i = 0; i < Object.keys(WALLS).length; i++) {
    let wall = WALLS[Object.keys(WALLS)[i]]
    if (isBallInWall(wall)) {
      handleBallInWall(wall)
    }
  }
  for (i = 0; i < platforms.length; i++) {
    if (isBallInPlatform(platforms[i])) {
      handleBallInPlatform(platforms[i])
    }
  }
  if (isBallInHoop()) {
    handleBallInHoop()
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
    context.lineTo(platform.xPos + PLATFORM_LENGTH, platform.yPos)
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
  ball.xVelocity = e.touches[0].clientX - touchstart.xPos
  ball.yVelocity = e.touches[0].clientY - touchstart.yPos
}

function moveBall() {
  ball.xPos += ball.xVelocity
  ball.yPos += ball.yVelocity
  if (ball.yVelocity != 0) {
    ball.yVelocity -= GRAVITY
  }
}

function isBallInWall(wall) {
  switch(wall) {
    case WALLS.right:
      if (ball.xPos > canvas.width - PIXEL_SHIM) {
        return true
      }
      break
    case WALLS.bottom:
      if (ball.yPos > canvas.height - PIXEL_SHIM) {
        return true
      }
      break
    case WALLS.left:
      if (ball.xPos < PIXEL_SHIM) {
        return true
      }
      break
  }
  return false
}

function handleBallInWall(wall) {
  switch (wall) {
    case WALLS.right:
      bounceBallLeft()
      break
    case WALLS.bottom:
      bounceBallUp()
      break
    case WALLS.left:
      bounceBallRight()
      break
  }
}

function isBallInPlatform(platform) {
  if (
    Math.abs(ball.yPos - platform.yPos) < PIXEL_SHIM &&
    ball.xPos > platform.xPos && ball.xPos < platform.xPos + PLATFORM_LENGTH
  ) {
    return true
  }
  return false
}

function handleBallInPlatform() {
  if (ball.yVelocity > 0) {
    bounceBallUp()
  } else {
    bounceBallDown()
  }
}

function isBallInHoop() {
  if (
    ball.yVelocity > 0 &&
    ball.xPos > hoop.xPos &&
    ball.xPos < hoop.xPos + hoop.diameter &&
    ball.yPos > hoop.yPos &&
    ball.yPos < hoop.yPos + hoop.diameter
  ) {
    return true
  }
  return false
}

function handleBallInHoop() {
  score += 1
  document.getElementById("score").innerHTML = String(score)
  document.getElementById("swish").play()
}

function bounceBallUp() {
  ball.yVelocity = -Math.abs(ball.yVelocity) + (ball.yVelocity / POST_BOUNCE_SPEED_DIVISOR)
  executeBounceEffects()
}

function bounceBallRight() {
  ball.xVelocity = Math.abs(ball.xVelocity) - (ball.xVelocity / POST_BOUNCE_SPEED_DIVISOR)
  executeBounceEffects()
}

function bounceBallLeft() {
  ball.xVelocity = -Math.abs(ball.xVelocity) + (ball.xVelocity / POST_BOUNCE_SPEED_DIVISOR)
  executeBounceEffects()
}

function bounceBallDown() {
  ball.yVelocity = Math.abs(ball.yVelocity) + (ball.yVelocity / POST_BOUNCE_SPEED_DIVISOR)
  executeBounceEffects()
}

function executeBounceEffects() {
  if (ball.yVelocity < 0 && ball.yVelocity > - MINIMUM_SPEED) {
    ball.yVelocity = 0
  }
  if (Math.abs(ball.xVelocity) < MINIMUM_SPEED) {
    ball.xVelocity = 0
  }
  if (ball.yVelocity != 0) {
    document.getElementById("bounce").play()
  }
}
