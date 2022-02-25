const MILLISECONDS_PER_FRAME = 50
const BALL_RADIUS = visualViewport.width / 20
const GRAVITY = -10
const WALLS = {
  right: "right",
  bottom: "bottom",
  left: "left"
}
const PIXEL_SHIM = visualViewport.width / 10
const POST_BOUNCE_SPEED_DIVISOR = 3
const ENEMY_SPEED_DIVISOR = 50
const BALL_SPEED_DIVISOR = 2
const MINIMUM_SPEED = 20
const BLUE_COLOR = "Cornflowerblue"
const RED_COLOR = "IndianRed"

let canvas
let context
let ball = {
  xPos: visualViewport.width / 2,
  yPos: visualViewport.height - 50,
  xVelocity: 0,
  yVelocity: 0,
  color: "Orange"
}
let enemies = [
  {
    xPos: visualViewport.width / 2,
    yPos: visualViewport.height / 2.75,
    xVelocity: 0,
    yVelocity: 0
  },
  {
    xPos: visualViewport.width / 6,
    yPos: visualViewport.height / 1.65,
    xVelocity: 0,
    yVelocity: 0
  },
  {
    xPos: visualViewport.width - (visualViewport.width / 4.5),
    yPos: visualViewport.height / 1.65,
    xVelocity: 0,
    yVelocity: 0
  }
]
let teammates = []
let hoop = {
  xPos: visualViewport.width / 3,
  yPos: PIXEL_SHIM,
  src: "images/hoop.png",
  diameter: 100
}
let touchstart = {
  xPos: 0,
  yPos: 0
}
let score = 0
let isThrowing = false
let offensiveTeam = teammates

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
  decideEnemyPaths()
  moveBall()
  for (let i = 0; i < Object.keys(WALLS).length; i++) {
    let wall = WALLS[Object.keys(WALLS)[i]]
    if (isBallInWall(wall)) {
      handleBallInWall(wall)
    }
  }
  let players = teammates.concat(enemies)
  for (let i = 0; i < players.length; i++) {
    if (isBallInPlayer(players[i])) {
      handleBallInPlayer(players[i])
    }
  }
  if (isBallInHoop()) {
    handleBallInHoop()
  }
  drawHoop()
  drawEnemies()
  drawTeammates()
  drawBall()
  setTimeout(gameLoop, MILLISECONDS_PER_FRAME)
}

function handleTouchstart(e) {
  touchstart.xPos = e.touches[0].clientX
  touchstart.yPos = e.touches[0].clientY
  if (
    touchstart.yPos > canvas.height - canvas.height / 5
    || (
      Math.abs(touchstart.yPos - ball.yPos) < PIXEL_SHIM 
      && Math.abs(touchstart.xPos - ball.xPos) < PIXEL_SHIM
    )
  ) {
    isThrowing = true
  } else {
    teammates.push({
      xPos: touchstart.xPos,
      yPos: touchstart.yPos
    })
    if (teammates.length == 3) {
      teammates.shift()     
    }
  }
}

function handleTouchmove(e) {
  e.preventDefault()
  if (isThrowing) {
    ball.xVelocity = (e.touches[0].clientX - touchstart.xPos) / BALL_SPEED_DIVISOR
    ball.yVelocity = (e.touches[0].clientY - touchstart.yPos) / BALL_SPEED_DIVISOR
  }
}

function decideEnemyPaths() {
  if (ball.yPos < canvas.height - (canvas.height / 5)) {
    let closestToBallData = {
      enemyId: -1,
      distanceToBall: canvas.height + canvas.width
    }
    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i]
      let distanceToBall = (Math.abs(ball.xPos - enemy.xPos) ** 2 + Math.abs(ball.yPos - enemy.yPos) ** 2) ** 0.5
      if (
        closestToBallData.enemyId == -1 
        || distanceToBall < closestToBallData.distanceToBall
      ) {
        closestToBallData.enemyId = i
        closestToBallData.distanceToBall = distanceToBall
      }
    }
    let closestToBall = enemies[closestToBallData.enemyId]
    closestToBall.xVelocity = (ball.xPos - closestToBall.xPos) / ENEMY_SPEED_DIVISOR
    closestToBall.yVelocity = (ball.yPos - closestToBall.yPos) / ENEMY_SPEED_DIVISOR
    closestToBall.xPos += closestToBall.xVelocity
    closestToBall.yPos += closestToBall.yVelocity
  }
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

function isBallInPlayer(player) {
  if (
    Math.abs(ball.xPos - player.xPos) < PIXEL_SHIM &&
    Math.abs(ball.yPos - player.yPos) < PIXEL_SHIM
  ) {
    
    // https://physics.stackexchange.com/questions/56265/how-to-get-the-angle-needed-for-a-projectile-to-pass-through-a-given-point-for-t
    if (enemies.includes(player)) {
      const ENEMY_BALL_SPEED = 100
      let xChange = player.xPos - hoop.xPos
      let yChange = player.yPos - hoop.yPos
      let angleRadians = Math.atan(
        (ENEMY_BALL_SPEED ** 2 / (GRAVITY * xChange)) - 
        (
          (
            (ENEMY_BALL_SPEED ** 2 * (ENEMY_BALL_SPEED ** 2 - 2 * GRAVITY * yChange)) / 
            (GRAVITY ** 2 * xChange ** 2) 
          ) 
          - 1
        ) 
        ** 0.5
      )
      ball.xVelocity = (ball.xPos <= canvas.width / 2) ? (Math.cos(angleRadians) * 100) : (-Math.cos(angleRadians) * 100)
      ball.yVelocity = Math.sin(angleRadians) * 100
      
    } else {
      ball.xVelocity = 0
      ball.yVelocity = 0
    }
    
    return true  
  } else {
    return false
  }  
}

function handleBallInPlayer() {
  // ball.xVelocity = 0
  // ball.yVelocity = 0
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

function isBallInHoop() {
  if (
    ball.yVelocity > 0
    && ball.xPos > hoop.xPos
    && ball.xPos < hoop.xPos + hoop.diameter
    && ball.yPos > hoop.yPos
    && ball.yPos < hoop.yPos + hoop.diameter
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

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    context.beginPath()
    context.arc(enemies[i].xPos, enemies[i].yPos, BALL_RADIUS, 0, 2 * Math.PI)
    context.fillStyle = RED_COLOR
    context.fill()
  }
}

function drawTeammates() {
  for (let i = 0; i < teammates.length; i++) {    
    context.beginPath()
    context.arc(teammates[i].xPos, teammates[i].yPos, BALL_RADIUS, 0, 2 * Math.PI)
    context.fillStyle = BLUE_COLOR
    context.fill()
  }
}

function drawHoop() {
  let element = document.createElement("IMG")
  element.src = hoop.src
  context.drawImage(element, hoop.xPos, hoop.yPos, hoop.diameter, hoop.diameter)
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPos, ball.yPos, BALL_RADIUS, 0, 2 * Math.PI)
  context.fillStyle = ball.color
  context.fill()
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
  if (
    ball.yVelocity < 0 
    && ball.yVelocity > -MINIMUM_SPEED
  ) {
    ball.yVelocity = 0
  }
  if (Math.abs(ball.xVelocity) < MINIMUM_SPEED) {
    ball.xVelocity = 0
  }
  if (ball.yVelocity != 0) {
    document.getElementById("bounce").play()
  }
}
