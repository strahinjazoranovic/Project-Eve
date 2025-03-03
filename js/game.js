// This is a stable version fo the game
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')
const playMenu = document.getElementById('playMenu')
const playButton = document.getElementById('playButton')
const hit = new Audio('sounds/hitmarker.mp3') //This is the audio you hear when you hit an invader
const healthup = new Audio('sounds/healthup.mp3') //dit is voor de healthup sound die je hoort als je healthup pakt


// The canvas gets resized when the window gets resized
function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

// The canvas gets resized when the window gets resized
window.addEventListener('resize', resizeCanvas)
resizeCanvas()


// Player gets spawned here with all the properties
class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation
        this.opacity = 1;
        this.health = 4; // This is the health of the player
        this.maxHealth = 8; // This is the maximum health of the player

        const image = new Image()
        image.src = './img/spaceshuttle.png'
        image.onload = () => {
            const scale = 0.09
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.clientWidth / 2 - this.width / 2,
                y: canvas.clientHeight - this.height - 20
            }
        }
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        )
        c.rotate(this.rotation)
        c.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        )
        c.restore()
    }

    drawHealthBar() {
        const barWidth = 220
        const barHeight = 40
        const barX = canvas.width - barWidth - 20
        const barY = 20

        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth

        // Determine health bar color
        let healthColor = 'green'
        if (healthPercentage <= 0.25) {
            healthColor = 'red'
        } else if (healthPercentage <= 0.5) {
            healthColor = 'yellow'
        }

        // Draw the health bar background
        c.fillStyle = 'gray'
        c.fillRect(barX, barY, barWidth, barHeight)

        // Draw the health bar foreground
        c.fillStyle = healthColor
        c.fillRect(barX, barY, barWidth * healthPercentage, barHeight)

        // Draw the health text
        c.fillStyle = 'black'
        c.font = '19px Orbitron'
        c.textAlign = 'center'
        c.fillText(`${this.health} / ${this.maxHealth}`, barX + barWidth / 2, barY + barHeight / 1.5)
    }

    update() {
        this.drawHealthBar()
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x

            if (this.position.x < 0) this.position.x = 0
            if (this.position.x + this.width > canvas.clientWidth)
                this.position.x = canvas.clientWidth - this.width
        }
    }
}

// Bullets gets spawned here with all the properties
class Projectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity

        this.radius = 5
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()

    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}


// Stars for the background get spawned here with all the properties
class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()

    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.fades) this.opacity -= 0.01
    }
}

// Invader bullets get spawned here with all the properties
class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 10
        this.height = 20

    }

    draw() {
        c.fillStyle = 'purple'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Invaders get spawned here with all the properties
class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/eindbaas.png'
        image.onload = () => {
            const scale = 0.22
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    // Draw the invader
    draw() {


        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
        }
    }

    update({ velocity }) {
        if (this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(
            new InvaderProjectile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity: {
                    x: 0,
                    y: 3.5
                }
            })
        )
    }
}

// Invader grids get spawned here with all the properties
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 2.8,
            y: 0
        }

        this.invaders = []

        const columns = Math.floor(Math.random() * 6 + 2)
        const rows = Math.floor(Math.random() * 1 + 2)
        this.width = columns * 110
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * 115,
                        y: y * 105
                    }
                }))
            }
        }
    }
    update() {
        this.position.x += this.velocity.x;

        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 20;
        }
    }
}

// All the variables get spawned here
const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
    over: false,
    active: true
}

let score = 0


// This is for the stars you can see fly across the canvas
for (let i = 0; i < 125; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        },

        velocity: {
            x: 0,
            y: 2.6
        },
        radius: Math.random() * 4.5,
        color: 'white'
    }))
}

// These are the particles that get spawned when you hit an invader or get hit by an invader
function createParticles({ object, color, fades }) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },

            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 6,
            color: color || 'purple',
            fades
        }))
    }
}

// This is the game loop
function animate() {
    if (!game.active) return
    requestAnimationFrame(animate)
    // If the game is over(when you die) then the restart menu will pop up and the music will stop
    if (game.over === true) {
        document.getElementById('restartMenu').style.display = 'flex';
        // muziek.pause(); // This is for the music in game which isn't used at the moment
    }
    c.clearRect(0, 0, canvas.width, canvas.height)
    player.update()
    particles.forEach((particle, i) => {

        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0);
        } else {
            particle.update()
        }
    })


    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (
            invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        } else {
            invaderProjectile.update()
        }

        if (invaderProjectile.position.y + invaderProjectile.height >=
            player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width
            >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {

            // If the player gets hit by an invader projectile then remove the projectile and decrease the health of the player and create particles for damage
            if (invaderProjectiles[index]) {
                invaderProjectiles.splice(index, 1);
                player.health--;
                createParticles({
                    object: player,
                    color: 'red',
                    fades: true
                });

                // Remove the player if health is 0
                if (player.health <= 0) {
                    player.opacity = 0;
                    game.over = true;
                    createParticles({
                        object: player,
                        color: 'orange',
                        fades: true
                    });
                }
            }
        }
    })



    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update()
        }
    })

    // Invader shootmechanics
    grids.forEach((grid, gridIndex) => {
        grid.update()
        if (frames % 300 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity })

            // Invader hitbox
            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <=
                    invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >=
                    invader.position.x &&
                    projectile.position.x - projectile.radius <=
                    invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find((invader2) => invader2 === invader);
                        const projectileFound = projectiles.find(
                            projectile2 => projectile2 === projectile
                        );

                        if (invaderFound && projectileFound) {
                            grid.invaders.splice(i, 1); // Remove the invaders when hit
                            hit.play(); //This is the sound you hear when you hit an invader

                            createParticles({ //Make the particles when a invader is hit
                                object: invader,
                                fades: true
                            });

                            if (grid.invaders.splice(i, 1)) { // If an invader is removed add score and health if score is 5000 or 10000
                                score += 100;
                                scoreEl.innerHTML = score;

                                // Check if score is a multiple of 5000
                                if (score % 5000 === 0) {
                                    healthup.play();
                                    player.health++;
                                    if (player.health > player.maxHealth) {
                                        player.health = player.maxHealth; // Ensure health does not exceed max health
                                    }
                                }

                                // Check if score is a multiple of 10000
                                if (score % 10000 === 0) {
                                    healthup.play();
                                    player.health++;
                                    if (player.health > player.maxHealth) {
                                        player.health = player.maxHealth; // Ensure health does not exceed max health
                                    }
                                }
                            }

                            projectiles.splice(j, 1); // Remove the projectile

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];

                                grid.width = lastInvader.position.x + lastInvader.width - firstInvader.position.x;
                                grid.position.x = firstInvader.position.x;
                            } else {
                                grids.splice(gridIndex, 1); // Remove grid if no invaders are left
                            }
                        }
                    }, 0);
                }
            })
        })
    })

    if (keys.a.pressed && player.position.x >= 0) { // This is for the spaceshuttle to move around when you hit A or D on your keyboard
        player.velocity.x = -6 // This is the speed of the spaceshuttle
        player.rotation = -0.20 // This is the rotation of the spaceshuttle
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) { // This is so that the spaceshuttle does not go off the screen
        player.velocity.x = 6
        player.rotation = 0.20
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }

    // spawning new enemies with grids
    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 200) // Change the spawn rate of the enemies
        frames = 0
    }

    frames++
}

// Add variables for cooldown
let lastShotTime = 0;
const shootCooldown = 80; // Cooldown period in milliseconds for shooting

// If you click play the game will start
playButton.addEventListener('click', () => {
    playMenu.style.display = 'none'  // Hide the play menu
    game.active = true  // Set game to active
    animate()  // Start the game loop
})

// These are the controls for the game
addEventListener('keydown', ({ key }) => {
    if (game.over) return
    switch (key) {
        case 'a':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case ' ': // This is for the spacebar to shoot
            const currentTime = Date.now();
            if (currentTime - lastShotTime >= shootCooldown) {
                projectiles.push(new Projectile({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    velocity: {
                        x: 0,
                        y: -8
                    }
                }))
                lastShotTime = currentTime; // Update the last shot time
            }
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})