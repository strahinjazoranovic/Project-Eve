const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')
const speedSlider = document.getElementById('speedSlider')
const playMenu = document.getElementById('playMenu')
const playButton = document.getElementById('playButton')
const muziek = new Audio('sounds/beat.mp3') // Dit is het liedje dat je hoort wanneer je het spel speelt
const hitmarker = new Audio('sounds/hitmarker.mp3') //dit is voor de hitmarker sound die je hoort als je enemies dood maakt


canvas.width = 1024
canvas.height = 576

// Hier wordt de speler die jij bestuurt gespawnt 
class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation
        this.opacity = 1

        const image = new Image()
        image.src = './img/spaceshuttle.png'
        image.onload = () => {
            const scale = 0.10
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
            player.position.x + player.width / 2,
            player.position.y + player.height / 2

        )
        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2

        )

        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
            c.restore()
        }
    }

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x


            if (this.position.x < 0) this.position.x = 0
            if (this.position.x + this.width > canvas.width)
                this.position.x = canvas.width - this.width
        }
    }
}

// Hier worden de Projectiles gespawnt die jij over het scherm heen schiet
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


// Dit is de Particles die jij ziet wanneer jij dood gaat
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

// Dit zijn de Projectiles die de enemies schieten
class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 10
        this.height = 20

    }

    draw() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Dit zijn de enemies
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

//Dit zijn de enemies die worden gespawned in grids
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 3,
            y: 0
        }

        this.invaders = []

        const columns = Math.floor(Math.random() * 4 + 2)
        const rows = Math.floor(Math.random() * 2 + 2)
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
let highScore = localStorage.getItem("highScore") || 0;


// Hier worden de starts aangemaakt die je over het scherm ziet vliegen
for (let i = 0; i < 125; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        },

        velocity: {
            x: 0,
            y: 2.5
        },
        radius: Math.random() * 2.5,
        color: 'white'
    }))
}

// Dit zijn de particles die jij ziet wanneer de enemies geschoten worden
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

function animate() {
    if (!game.active) return
    requestAnimationFrame(animate)
    muziek.play();
    // Als de game over is dan krijg je de restart menu te zien
    if (game.over === true) {
        document.getElementById('restartMenu').style.display = 'flex';
        muziek.pause();
        lost.play();
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

            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.over = true
            }, 0)

            setTimeout(() => {
                game.active = false
            }, 1000)
            createParticles({
                object: player,
                color: 'white',
                fades: true
            })
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

    grids.forEach((grid, gridIndex) => {
        grid.update()
        //spawning enemy grids
        if (frames % 250 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity })

            // projectiles raken enemy
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
                        const invaderFound = grid.invaders.find((invader2
                        ) => invader2 === invader
                        )

                        const projectileFound = projectiles.find(
                            projectile2 => projectile2 === projectile)

                        // remove invader and projectile
                        if (invaderFound && projectileFound) {
                            hitmarker.play();
                            score += 100
                            scoreEl.innerHTML = score
                            createParticles({
                                object: invader,
                                fades: true
                            })
                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x + lastInvader.width - firstInvader.position.x
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }

                        }
                    })
                }
            })

        })
    })

    if (keys.a.pressed && player.position.x >= 0) { // zodat spaceshuttle niet weggaat uit scherm als je a inhoudt
        player.velocity.x = -6
        player.rotation = -0.20
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {  // zodat spaceshuttle niet weggaat uit scherm als je d inhoudt
        player.velocity.x = 6
        player.rotation = 0.20
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }

    // spawning new enemies with grids
    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 300 + 150)
        frames = 0
    }

    
    frames++
}

// Als je op play klikt dan start te game
playButton.addEventListener('click', () => {
    playMenu.style.display = 'none'  // Hide the play menu
    game.active = true  // Set game to active
    animate()  // Start the game loop
})

// Hier zijn de controls gecodeerd
addEventListener('keydown', ({ key }) => {
    if (game.over) return
    switch (key) {
        case 'a':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case ' ':
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


