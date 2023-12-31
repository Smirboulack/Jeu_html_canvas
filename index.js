const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function createChronometer() {
    let startTime = 0;
    let running = false;

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }

    function start() {
        if (!running) {
            startTime = Date.now();
            running = true;
            tick();
        }
    }

    function stop() {
        if (running) {
            running = false;
        }
    }

    function reset() {
        startTime = 0;
        running = false;
    }

    function DrawTimer() {
        c.font = '30px Arial'
        c.fillStyle = 'white'
        const currentTime = Date.now() - startTime;
        const formattedTime = formatTime(currentTime);
        c.fillText(`Time: ${formattedTime}`, 10, 90)
    }

    function tick() {
        if (running) {
            const currentTime = Date.now() - startTime;
            const formattedTime = formatTime(currentTime);
            //console.log(formattedTime);
            requestAnimationFrame(tick);
        }
    }

    // Retourne un objet avec les méthodes disponibles
    return {
        start,
        stop,
        reset,
        DrawTimer
    };
}


var Timer = createChronometer();
Timer.start();


class Player {
    constructor({ position, velocity, score, pseudo, alias }) {
        this.position = position // {x, y}
        this.velocity = velocity
        this.rotation = 0
        this.score = score
        this.pseudo = pseudo
        this.alias = alias
    }


    drawScore() {
        c.font = '30px Arial'
        c.fillStyle = 'white'
        c.fillText(`Score: ${this.score}`, 10, 30)
    }

    drawPseudoAlias() {
        c.font = '30px Arial'
        c.fillStyle = 'white'
        c.fillText(`${this.pseudo}`, 10, 60)
        let pseudoWidth = c.measureText(this.pseudo).width
        c.fillText(`(aka)`, pseudoWidth + 15, 60)
        c.fillText(`${this.alias}`, pseudoWidth + 90, 60)
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)

        c.beginPath()
        c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()

        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, 100, q100)
        c.beginPath()
        c.moveTo(this.position.x + 30, this.position.y)
        c.lineTo(this.position.x - 10, this.position.y - 10)
        c.lineTo(this.position.x - 10, this.position.y + 10)
        c.closePath()

        c.strokeStyle = 'white'
        c.stroke()
        c.restore()
    }

    update() {
        this.draw()
        this.drawScore()
        this.drawPseudoAlias()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)

        return [
            {
                x: this.position.x + cos * 30 - sin * 0,
                y: this.position.y + sin * 30 + cos * 0,
            },
            {
                x: this.position.x + cos * -10 - sin * 10,
                y: this.position.y + sin * -10 + cos * 10,
            },
            {
                x: this.position.x + cos * -10 - sin * -10,
                y: this.position.y + sin * -10 + cos * -10,
            },
        ]
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.radius = 5
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Asteroid {
    constructor({ position, velocity, radius }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
    }

    
    draw() {
        c.beginPath();
        c.moveTo(this.position.x + this.radius * Math.cos(0), this.position.y + this.radius * Math.sin(0));

        const asteroidPoints = [
            { x: 1, y: 0.2 },
            { x: 0.6, y: 1 },
            { x: 0, y: 0.8 },
            { x: -0.6, y: 1 },
            { x: -1, y: 0.6 },
            { x: -0.8, y: 0.3 },
            { x: -1, y: -0.2 },
            { x: -0.6, y: -1 },
            { x: 0, y: -0.8 }
        ];

        for (let i = 0; i < asteroidPoints.length; i++) {
            const point = asteroidPoints[i];
            const x = this.position.x + this.radius * point.x;
            const y = this.position.y + this.radius * point.y;
            c.lineTo(x, y);
        }

        c.closePath();
        c.strokeStyle = 'white';
        c.stroke();
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}


do {
    var pseudoprompt = prompt("Entrez votre pseudo : ");
    if (pseudoprompt.length > 10) {
        alert("Votre pseudo ne doit pas depasser 10 caracteres !")
    }
} while (pseudoprompt == null || pseudoprompt == "" || pseudoprompt.length > 10);

const player = new Player({

    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
    score: 0,
    pseudo: pseudoprompt,
    alias: "\"Noob\"",
})




const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

const SPEED = 3
const ROTATIONAL_SPEED = 0.05
const FRICTION = 0.97
const PROJECTILE_SPEED = 10
const PROJECTILE_DELAY = 500
let DIFFICULTY = 1
let lastProjectileTime = 0

const projectiles = []
const asteroids = []





const intervalId = window.setInterval(() => {
    const index = Math.floor(Math.random() * 4)
    let x, y
    let vx, vy
    let radius = 50 * Math.random() + 10

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    switch (index) {
        case 0: // left side of the screen
            x = 0 - radius
            y = Math.random() * canvas.height
            vx = (centerX - x) / 1000 * DIFFICULTY  // Divise par une valeur fixe pour ajuster la vitesse
            vy = (centerY - y) / 1000 * DIFFICULTY
            break
        case 1: // bottom side of the screen
            x = Math.random() * canvas.width
            y = canvas.height + radius
            vx = (centerX - x) / 1000 * DIFFICULTY
            vy = (centerY - y) / 1000 * DIFFICULTY
            break
        case 2: // right side of the screen
            x = canvas.width + radius
            y = Math.random() * canvas.height
            vx = (centerX - x) / 1000 * DIFFICULTY
            vy = (centerY - y) / 1000 * DIFFICULTY
            break
        case 3: // top side of the screen
            x = Math.random() * canvas.width
            y = 0 - radius
            vx = (centerX - x) / 1000 * DIFFICULTY
            vy = (centerY - y) / 1000 * DIFFICULTY
            break
    }

    asteroids.push(
        new Asteroid({
            position: {
                x: x,
                y: y,
            },
            velocity: {
                x: vx,
                y: vy,
            },
            radius,
        })
    )

    //console.log(asteroids)
}, 1000)

function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x
    const yDifference = circle2.position.y - circle1.position.y

    const distance = Math.sqrt(
        xDifference * xDifference + yDifference * yDifference
    )

    if (distance <= circle1.radius + circle2.radius) {
        return true
    }

    return false
}

function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
        let start = triangle[i]
        let end = triangle[(i + 1) % 3]

        let dx = end.x - start.x
        let dy = end.y - start.y
        let length = Math.sqrt(dx * dx + dy * dy)

        let dot =
            ((circle.position.x - start.x) * dx +
                (circle.position.y - start.y) * dy) /
            Math.pow(length, 2)

        let closestX = start.x + dot * dx
        let closestY = start.y + dot * dy

        if (!isPointOnLineSegment(closestX, closestY, start, end)) {
            closestX = closestX < start.x ? start.x : end.x
            closestY = closestY < start.y ? start.y : end.y
        }

        dx = closestX - circle.position.x
        dy = closestY - circle.position.y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= circle.radius) {
            return true
        }
    }

    // No collision
    return false
}


function isPointOnLineSegment(x, y, start, end) {
    return (
        x >= Math.min(start.x, end.x) &&
        x <= Math.max(start.x, end.x) &&
        y >= Math.min(start.y, end.y) &&
        y <= Math.max(start.y, end.y)
    )
}

function ManageAlias(score) {
    if (score > 10) {
        player.alias = "\"Le joueur\""
        if (DIFFICULTY < 2) {
            DIFFICULTY = 2
        }
    }
    if (score > 20) {
        player.alias = "\"Le shooter\""
        if (DIFFICULTY < 4) {
            DIFFICULTY = 4
        }
    }
    if (score > 30) {
        player.alias = "\"Skywalker\""
        if (DIFFICULTY < 5) {
            DIFFICULTY = 5
        }
    }
    if (score > 40) {
        player.alias = "\"L'incontestable\""
        if (DIFFICULTY < 6) {
            DIFFICULTY = 6
        }
    }
    if (score > 50) {
        player.alias = "\"Maître\""
        if (DIFFICULTY < 7) {
            DIFFICULTY = 7

        }
    }
    if (score > 60) {
        player.alias = "\">Insert Crazy Alias here<\""
        if (DIFFICULTY < 8) {
            DIFFICULTY = 8
        }
    }

    console.log(DIFFICULTY)
}

function DrawDifficulty() {
    c.font = '30px Arial'
    c.fillStyle = 'white'
    c.fillText(`Difficulty: ${DIFFICULTY}`, 10, 120)
}

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.update()
    Timer.DrawTimer()
    DrawDifficulty()

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i]
        projectile.update()

        // garbage collection for projectiles
        if (
            projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y - projectile.radius > canvas.height ||
            projectile.position.y + projectile.radius < 0
        ) {
            projectiles.splice(i, 1)
        }
    }

    // asteroid management
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        asteroid.update()

        if (circleTriangleCollision(asteroid, player.getVertices())) {
            console.log('GAME OVER')
            window.cancelAnimationFrame(animationId)
            clearInterval(intervalId)
            //Display Game Over Screen in BIG RED LETTERS
            c.font = '100px Arial'
            c.fillStyle = 'red'
            c.fillText(`GAME OVER`, canvas.width / 2 - 250, canvas.height / 2)
            c.font = '101px Arial'
            c.fillStyle = 'white'
            c.fillText(`GAME OVER`, canvas.width / 2 - 250, canvas.height / 2)
            

        }

        // garbage collection for projectiles
        if (
            asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
        ) {
            asteroids.splice(i, 1)
        }

        // projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j]

            if (circleCollision(asteroid, projectile)) {
                asteroids.splice(i, 1)
                projectiles.splice(j, 1)
                player.score += 1
                ManageAlias(player.score)
            }
        }
    }

    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED
        player.velocity.y = Math.sin(player.rotation) * SPEED
    } else if (!keys.w.pressed) {
        player.velocity.x *= FRICTION
        player.velocity.y *= FRICTION
    }

    if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED
    else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED
}


animate()

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = true
            break
        case 'KeyA':
            keys.a.pressed = true
            break
        case 'KeyD':
            keys.d.pressed = true
            break
        case 'Space':
            //Tirer un projectile puis attendre PROHECTILE_DELAY avant de pouvoir tirer à nouveau
            if (Date.now() - lastProjectileTime > PROJECTILE_DELAY) {
                projectiles.push(
                    new Projectile({
                        position: {
                            x: player.position.x,
                            y: player.position.y,
                        },
                        velocity: {
                            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
                        },
                    })
                )
                lastProjectileTime = Date.now()
            }

            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false
            break
        case 'KeyA':
            keys.a.pressed = false
            break
        case 'KeyD':
            keys.d.pressed = false
            break
    }
})