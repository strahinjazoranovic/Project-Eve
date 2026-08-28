// Disable context menu
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// Canvas width and height is equal to current window width and height
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Resize the canvas whenever the window size changes
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Scores
const scoreEl = document.querySelector("#scoreEl");
const lastScoreEl = document.querySelector("#lastScoreEl");
const highScoreEl = document.querySelectorAll(".highScoreEl");

// Menus
const pauseMenu = document.querySelector(".pauseMenu");
const playMenu = document.getElementById("playMenu");
const restartMenu = document.getElementById("restartMenu");
const beatMenu = document.getElementById("beatMenu");

// Game over text
const overNoteEl = document.querySelector(".overNoteEl");

// Buttons
const resumeButton = document.getElementById("resumeButton");
const playButton = document.getElementById("playButton");

// Death messages
const deathMessages = {
  enemies: [
    "The invaders got you. Better luck next time.",
    "They were stronger. You were... there.",
    "You have been invaded.",
    "You fought bravely. They fought better.",
    "Looks like they weren't bluffing.",
    "Your last stand has ended.",
    "You picked the wrong fight.",
    "They came. They saw. They vaporized you.",
    "Enemy: 1. You: 0.",
    "You have been uninvited from this galaxy.",
  ],

  meteor: [
    "That meteor hit you hard, you okay?",
    "You looked up at the wrong time.",
    "The sky had other plans for you.",
    "You have been promoted to an crater.",
    "That meteor really came out of nowhere huh.",
    "Incoming! ...Oh. Too late.",
    "Space rocks: 1. You: 0.",
    "That's gonna leave a crater.",
    "You should've looked up instead of looking down!",
    "Gravity sends its regards.",
  ],
};

// Show a random death message from the arrays above
function showDeathMessage(type) {
  const messages = deathMessages[type];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  overNoteEl.innerHTML = randomMessage;
}

// Default difficulty values for level 1 are defined here
let difficulty = {
  level: 1,
  playerSpeed: 12,
  invaderSpeed: 6,
  meteorMinSpeed: 10,
  meteorMaxSpeed: 20,
  starSpeed: 8,

  // All the values below here are in miliseconds
  invaderShootInterval: 1500,
  invaderSpawnMin: 4167,
  invaderSpawnMax: 8333,
  meteorSpawnMin: 8333,
  meteorSpawnMax: 13333,
};

function updateDifficulty() {
  // Every 10,000 score the game gets +1 level
  // Level 16 is the maximum difficulty
  difficulty.level = Math.min(16, Math.floor(score / 10000) + 1);

  // Starts at 12 and reaches 16 at level 16
  difficulty.playerSpeed = Math.min(16, 12 + (difficulty.level - 1) * (4 / 15));

  // Starts at 6 and reaches 12 at level 16
  difficulty.invaderSpeed = Math.min(12, 6 + (difficulty.level - 1) * (6 / 15));

  // Starts at 1500 miliseconds and reaches 750 miliseconds at level 16
  difficulty.invaderShootInterval = Math.max(
    750,
    1500 - (difficulty.level - 1) * 50,
  );

  // Starts at 8 and reaches 16 at level 16
  difficulty.starSpeed = Math.min(16, 8 + (difficulty.level - 1) * (8 / 15));

  // MinSpeed starts at 8333 and reaches 4167, MaxSpeed starts at 13333 and reaches 8333 at level 16
  difficulty.meteorSpawnMin = Math.max(
    4167,
    8333 - (difficulty.level - 1) * (4166 / 15),
  );

  difficulty.meteorSpawnMax = Math.max(
    8333,
    13333 - (difficulty.level - 1) * 333,
  );

  // SpawnMin starts at 6667 miliseconds and 3333 reaches miliseconds, SpawnMax starts at 10000 miliseconds and reaches 6667 miliseconds at level 16
  difficulty.invaderSpawnMin = Math.max(
    3333,
    6667 - (difficulty.level - 1) * (3334 / 15),
  );

  difficulty.invaderSpawnMax = Math.max(
    6667,
    10000 - (difficulty.level - 1) * (3334 / 15),
  );
}

// Show level in UI
function showLevel() {
  const currentLevel = difficulty.level;
  const levelText = document.querySelectorAll(".levelText");
  levelText.forEach((levelText) => {
    levelText.innerHTML = currentLevel || 1;
  });
}

// Player entity and its properties
class Player {
  // Allow the health bar to be enabled or disabled when creating the player
  constructor(showHealthBar = true) {
    this.showHealthBar = showHealthBar;
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.rotation = 0;
    this.opacity = 1;
    this.health = 4; // This is the starting health of the player
    this.maxHealth = 8; // This is the maximum health of the player

    const image = new Image();
    image.src = "./assets/player/spaceshuttle.png";

    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.clientWidth / 2 - this.width / 2,
        y: canvas.clientHeight - this.height - 20,
      };
    };
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    c.rotate(this.rotation);
    c.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    c.restore();
  }

  drawHealthBar() {
    const barWidth = 220;
    const barHeight = 40;
    const barBorderRadius = 12;

    const barX = canvas.width - barWidth - 20;
    const barY = 20;

    // Calculate health percentage
    const healthPercentage = Math.max(
      0,
      Math.min(1, this.health / this.maxHealth),
    );

    // Determine health bar color
    let healthColor = "green";

    if (healthPercentage <= 0.25) {
      healthColor = "red";
    } else if (healthPercentage <= 0.5) {
      healthColor = "yellow";
    }

    // Draw the health bar background
    c.fillStyle = "white";
    c.beginPath();
    c.roundRect(barX, barY, barWidth, barHeight, barBorderRadius);
    c.fill();

    // Draw the health bar foreground
    c.fillStyle = healthColor;
    c.beginPath();
    c.roundRect(
      barX,
      barY,
      barWidth * healthPercentage,
      barHeight,
      barBorderRadius,
    );
    c.fill();

    // Draw the health text
    c.fillStyle = "black";
    c.font = "20px Orbitron";
    c.textAlign = "center";
    c.textBaseline = "middle";

    c.fillText(
      `${this.health} / ${this.maxHealth}`,
      barX + barWidth / 2,
      barY + barHeight / 2,
    );
  }

  update() {
    if (this.showHealthBar === true) {
      this.drawHealthBar();
    }

    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x * frameScale;

      if (this.position.x < 0) this.position.x = 0;
      if (this.position.x + this.width > canvas.clientWidth)
        this.position.x = canvas.clientWidth - this.width;
    }
  }
}

// Player projectile entity
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 5;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "lightBlue"; // Color of the player shooting
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x * frameScale;
    this.position.y += this.velocity.y * frameScale;
  }
}

// Star system
class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x * frameScale;
    this.position.y += this.velocity.y * frameScale;

    // Fade method
    if (this.fades) this.opacity -= 0.01 * frameScale;
  }
}

// Invader projectile entity
class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 11;
    this.height = 11;
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x * frameScale;
    this.position.y += this.velocity.y * frameScale;
  }
}

// Invaders get spawned here with all the properties
class Invader {
  constructor({ position }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "./assets/invader/enemy1.png";
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  // Draw the invader
  draw() {
    if (this.image) {
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );
    }
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x * frameScale;
      this.position.y += velocity.y * frameScale;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 16,
        },
      }),
    );

    // Restart the shooting sound so rapid shots don't wait for the previous sound to finish
    invaderShoot.currentTime = 0;
    playSound(invaderShoot);
  }
}

// Invader grids get spawned here with all the properties
class Grid {
  constructor() {
    const columns = Math.floor(Math.random() * 5 + 4);
    const rows = 1;
    this.width = columns * 110;
    this.shootTimer = 0;

    this.position = {
      x: Math.random() * (canvas.width - this.width),
      y: 0,
    };

    this.velocity = {
      x: difficulty.invaderSpeed,
      y: 0,
    };

    this.invaders = [];
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: this.position.x + x * 100,
              y: this.position.y + y * 90,
            },
          }),
        );
      }
    }
  }
  update() {
    // Apply the difficulty speed to the grid
    this.velocity.x = Math.sign(this.velocity.x) * difficulty.invaderSpeed;

    this.position.x += this.velocity.x * frameScale;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 10;
    }

    this.shootTimer += deltaTime;
  }
}

class MeteorGrid {
  constructor() {
    this.position = {
      x: Math.random() * canvas.width, // Randomize the spawn position using math.random times canvas.width
      y: -150,
    };

    const columns = 1;
    const rows = 1;

    this.meteors = [];

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.meteors.push(
          new Meteor({
            position: {
              x: this.position.x,
              y: this.position.y,
            },
          }),
        );
      }
    }

    const targetX = player.position.x + player.width / 2;
    const targetY = player.position.y + player.height / 2;

    const dX = targetX - this.position.x;
    const dY = targetY - this.position.y;

    // Calculate a random meteor speed within the difficulty range
    const speed =
      Math.random() * (difficulty.meteorMaxSpeed - difficulty.meteorMinSpeed) +
      difficulty.meteorMinSpeed;

    const distance = Math.sqrt(dX * dX + dY * dY);

    this.velocity = {
      x: (dX / distance) * speed,
      y: (dY / distance) * speed,
    };
  }

  update() {
    this.position.x += this.velocity.x * frameScale;
    this.position.y += this.velocity.y * frameScale;

    this.meteors.forEach((meteor) => {
      meteor.position.x = this.position.x;
      meteor.position.y = this.position.y;
      meteor.update();
    });
  }
}

class Meteor {
  constructor({ position }) {
    this.position = position;
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.opacity = 1;
    this.health = 4; // Starting health for the meteor

    const image = new Image();
    image.src = "./assets/meteor/meteor1.png";

    image.onload = () => {
      const scale = 1.4;

      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;

      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    if (this.image) {
      c.save();
      c.globalAlpha = this.opacity;

      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );

      c.restore();
    }
  }

  update() {
    this.draw();
  }
}

// create an instance from the player class
const player = new Player(true);

// Player projectiles
const projectiles = [];

// meteorGrids
const meteorGrids = [];

// Invader grid
const grids = [];

// Invader projectiles
const invaderProjectiles = [];

// Particles used for stars
const particles = [];

// This for loop creates the star background
for (let i = 0; i < 125; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },

      velocity: {
        x: 0,
        y: Math.random() * difficulty.starSpeed,
      },
      radius: Math.random() * 3, // Size of the stars
      color: "white", // Color of the starts
    }),
  );
}

// This is the particle creator
function createParticles({ object, color, fades }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },

        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 4, // Size of the particles
        color: color || "white", // Defined color or default white
        fades,
      }),
    );
  }
}

// Track the current state of player movement and shooting keys
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

// Game states
let game = {
  over: false,
  active: false,
  beaten: false,
};

// Score needed to beat the game
const beatGameScore = 1600;

// Invader spawn interval using difficulty
var invaderSpawnInterval = Math.floor(
  Math.random() * (difficulty.invaderSpawnMax - difficulty.invaderSpawnMin) +
    difficulty.invaderSpawnMin,
);

// Meteor spawn interval using difficulty
let meteorSpawnInterval = Math.floor(
  Math.random() * (difficulty.meteorSpawnMax - difficulty.meteorSpawnMin) +
    difficulty.meteorSpawnMin,
);

// Timers for invader and meteor spawning
let invaderSpawnTimer = 0;
let meteorSpawnTimer = 0;

let deltaTime = 0;

// Set score to 0 when starting the gameplay loop
let score = 0;

// Values last and highScore from localStorage
let lastScore = localStorage.getItem("lastScore") || 0;
let highScore = localStorage.getItem("highScore") || 0;

// For each element show highscore
function lastScoreShow() {
  lastScoreEl.innerHTML = lastScore;
}

// For each element show highscor
function highScoreShow() {
  highScoreEl.forEach((element) => {
    element.innerHTML = highScore;
  });
}
highScoreShow();

// Here all the sounds for the player
const hitPlayer = new Audio("sounds/player/hitPlayer.ogg"); // An hit from the player
const playerNoise = new Audio("sounds/player/player.ogg"); // Player noise
const playerShoot = new Audio("sounds/player/shootPlayer.ogg"); // Player shooting
const healthup = new Audio("sounds/player/healthup.ogg"); // +1 heal point
const defeated = new Audio("sounds/player/defeated.ogg"); // Game over

// Here all the sounds for the invader
const hitInvader = new Audio("sounds/invader/hitInvader.ogg"); // An hit from an invader
const invaderNoise = new Audio("sounds/invader/invader.ogg"); // Invader noise
const invaderShoot = new Audio("sounds/invader/shootInvader.ogg"); // Invader shooting

// Here are all the sounds for the meteor
const hitMeteor = new Audio("sounds/meteor/hit.ogg"); // An hit from the invader
const meteorIncoming = new Audio("sounds/meteor/incoming.ogg"); // Meteor incoming

// All sounds that happen in the gameloop
const sounds = [
  hitPlayer,
  playerNoise,
  playerShoot,
  hitInvader,
  invaderNoise,
  invaderShoot,
  hitMeteor,
  meteorIncoming,
  healthup,
  defeated,
];

// Player volume
playerNoise.volume = 0.25;
playerShoot.volume = 0.4;
hitPlayer.volume = 0.2;
healthup.volume = 0.75;
defeated.volume = 0.6;

// Invader volume
invaderNoise.volume = 0.15;
invaderShoot.volume = 0.25;
hitInvader.volume = 0.4;

// Meteor volume
hitMeteor.volume = 0.45;
meteorIncoming.volume = 0.75;

// Ask if the game is active and only then play the audio but always play defeated
function playSound(sound) {
  if (!game.active && sound !== defeated) return;
  sound.play().catch(() => {});
}

// Loop through every sound available in the gameloop and stop it
function stopAudio() {
  sounds.forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });
}

// Update the game audio based on game state
function updateGameAudio() {
  if (!game.active || game.beaten) {
    playerNoise.pause();
    invaderNoise.pause();
  } else {
    playerNoise.play();
    invaderNoise.play();
  }
}

// End the gameplay loop but wait 2 seconds before doing so to give the user an smooth transistion
function gameOver() {
  setTimeout(() => {
    if (game.over === true) {
      restartMenu.style.display = "flex";
      stopAudio();
    }
    return;
  }, 2000);
}

// End the gameplay loop for an beaten game
function gameBeaten() {
  setTimeout(() => {
    if (game.beaten === true) {
      beatMenu.style.display = "flex";
    }
    return;
  }, 2000);
}

let lastTime = 0;
let frameScale = 1;

// Target in frames per second
const targetFps = 60;
const frameTime = 1000 / targetFps;

// This is the gameplay loop
function animate(timestamp) {
  if (!game.active) return;
  requestAnimationFrame(animate);

  if (!lastTime) lastTime = timestamp;

  deltaTime = Math.min(timestamp - lastTime, 100);
  lastTime = timestamp;

  frameScale = deltaTime / frameTime;

  // If the game is over call the function that ends the gameplay and if not return
  if (game.over) {
    gameOver();
  }

  // If the score is equal to the score needed to beat the game remove invaders and meteor and set game.beaten to true and stopAudio
  if (score >= beatGameScore) {
    grids.length = 0;
    meteorGrids.length = 0;
    game.beaten = true;
    gameBeaten();
    stopAudio();
  }

  // Call audio update
  updateGameAudio();

  // Every 10000 score increase the level by 1
  const newLevel = Math.floor(score / 10000) + 1;

  // Check if new level went up and if it did call 2 functions
  if (newLevel !== difficulty.level) {
    updateDifficulty();
    showLevel();
  }

  c.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  // Player hitbox
  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }

    if (
      invaderProjectile.position.y + invaderProjectile.height >=
        player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >=
        player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      // If the player gets hit by an invader projectile then remove the projectile and decrease the health of the player and create particles for damage
      if (invaderProjectiles[index]) {
        invaderProjectiles.splice(index, 1);
        player.health--; // 1 Damage
        createParticles({
          object: player,
          color: "lightBlue",
          fades: true,
        });

        // Restart the hit sound so rapid hits don't wait for the previous sound to finish
        hitInvader.currentTime = 0;
        playSound(hitInvader);

        // Remove the player if health is equal or less than 0
        if (player.health <= 0) {
          player.opacity = 0;
          game.over = true;

          // Set drawhealthbar to false to avoid showing possible negative values in the health bar
          player.showHealthBar = false;

          playSound(defeated);
          showDeathMessage("enemies");

          // Set an timeout else the game will freeze the moment the player is defeated
          setTimeout(() => {
            game.active = false;
          }, 2100);

          lastScore = score;
          localStorage.setItem("lastScore", lastScore);
          lastScoreShow();

          // Save the score if it is higher than the current saved highScore so it can get used as highScore
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);

            // Show for every element
            highScoreEl.forEach((element) => {
              element.innerHTML = score;
            });
          }

          // Create the final death particles on the player from the invaders
          createParticles({
            object: player,
            color: "lightBlue",
            fades: true,
          });
        }
      }
    }
  });

  // Update each meteorGrid
  meteorGrids.forEach((meteorGrid, meteorGridIndex) => {
    meteorGrid.update();

    meteorGrid.meteors.forEach((meteor) => {
      // Meteor hitbox against player
      if (
        meteor.position.x + meteor.width >= player.position.x &&
        meteor.position.x <= player.position.x + player.width &&
        meteor.position.y + meteor.height >= player.position.y &&
        meteor.position.y <= player.position.y + player.height
      ) {
        // Remove meteor when it hits the player
        meteorGrids.splice(meteorGridIndex, 1);

        // Hit the player with 3 damage
        player.health -= 3; // This damage output is quite high and could be lowered in future versions

        // Create particle effects on the player
        createParticles({
          object: player,
          color: "orange",
          fades: true,
        });

        // Restart the hit sound so rapid hits don't wait for the previous sound to finish
        hitMeteor.currentTime = 0;
        playSound(hitMeteor);

        // Remove the player if health is equal or less than 0
        if (player.health <= 0) {
          player.opacity = 0;
          game.over = true;

          // Set drawhealthbar to false to avoid showing possible negative values in the health bar
          player.showHealthBar = false;

          // Set an timeout else the game will freeze the moment the player is defeated
          setTimeout(() => {
            game.active = false;
          }, 2100);

          showDeathMessage("meteor");
          playSound(defeated);

          lastScore = score;
          localStorage.setItem("lastScore", lastScore);
          lastScoreShow();

          // Save the score if it is higher than the current saved highScore so it can get used as highScore
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);

            // Show for every element
            highScoreEl.forEach((element) => {
              element.innerHTML = score;
            });
          }

          // Create the final death particles on the player from the meteor
          createParticles({
            object: player,
            color: "orange",
            fades: true,
          });
        }
      }

      // Projectile vs meteor hitbox
      projectiles.forEach((projectile, projectileIndex) => {
        if (
          projectile.position.x + projectile.radius >= meteor.position.x &&
          projectile.position.x - projectile.radius <=
            meteor.position.x + meteor.width &&
          projectile.position.y + projectile.radius >= meteor.position.y &&
          projectile.position.y - projectile.radius <=
            meteor.position.y + meteor.height
        ) {
          // Remove projectile
          projectiles.splice(projectileIndex, 1);

          // Damage meteor
          meteor.health--; // 1 Damage

          // Hit particles
          createParticles({
            object: meteor,
            fades: true,
            color: "orange",
          });

          // Restart the meteor hit sound so rapid hits don't wait for the previous sound to finish
          hitMeteor.currentTime = 0;
          playSound(hitMeteor);

          // Only destroy meteor when health reaches 0
          if (meteor.health <= 0) {
            // Remove the meteor from the canvas
            meteorGrids.splice(meteorGridIndex, 1);

            // Award 750 points for destroying an meteor and update the score display
            score += 750;
            scoreEl.innerHTML = score;

            // Every 5000 score increase health by +1
            if (score % 5000 === 0 && player.health < player.maxHealth) {
              player.health = Math.min(player.health + 1, player.maxHealth);
              playSound(healthup);
            }
          }
        }
      });
    });
  });

  // For each projectile check if it is above the screen then remove it in index order if not then update it
  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  // Invader shooting mechanics
  grids.forEach((grid, gridIndex) => {
    grid.update();

    // Shoot a projectile at the interval defined by the difficulty
    if (
      grid.shootTimer >= difficulty.invaderShootInterval &&
      grid.invaders.length > 0
    ) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles,
      );

      grid.shootTimer = 0;
    }
    // Update the grid for each invader
    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

      // Invader hitbox
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find(
              (invader2) => invader2 === invader,
            );
            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile,
            );

            // If the invaderFound and projectileFound remove the indexed invader from the canvas and create particles for it
            if (invaderFound && projectileFound && grid.invaders.splice(i, 1)) {
              createParticles({
                object: invader,
                fades: true,
              });

              // Restart the hit sound so rapid hits don't wait for the previous sound to finish
              hitPlayer.currentTime = 0;
              playSound(hitPlayer);

              // Award 250 points for hitting an invader and update the score display
              score += 250;
              scoreEl.innerHTML = score;

              // Every 5000 score increase health by +1
              if (score % 5000 === 0 && player.health < player.maxHealth) {
                // Take the minimum so it can't exceed 8hp which is the max health
                player.health = Math.min(player.health + 1, player.maxHealth);
                playSound(healthup);
              }

              projectiles.splice(j, 1); // Remove the projectile

              // If the grid with invaders is less than 0
              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x +
                  lastInvader.width -
                  firstInvader.position.x;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1); // Remove the indexed grid if no invaders are left in it
              }
            }
          }, 0);
        }
      });
    });
  });

  // Keybinds for the player

  // If the game is beaten don't let the player move
  if (game.beaten) {
    player.velocity.x = 0;
    player.rotation = 0;
  } else if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -difficulty.playerSpeed;
    player.rotation = -0.4;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = difficulty.playerSpeed;
    player.rotation = 0.4;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  // Spawn an grid of invaders
  if (invaderSpawnTimer >= invaderSpawnInterval && game.beaten === false) {
    grids.push(new Grid());
    invaderSpawnInterval = Math.floor(
      Math.random() *
        (difficulty.invaderSpawnMax - difficulty.invaderSpawnMin) +
        difficulty.invaderSpawnMin,
    );

    invaderSpawnTimer = 0;
  }

  // If grids array is empty and the game isn't beaten push an new grid to keep atleast 1 grid on the canvas at all times
  if (grids.length === 0 && !game.beaten) {
    grids.push(new Grid());
    invaderSpawnTimer = 0;
  }

  // Spawn meteor
  if (meteorSpawnTimer >= meteorSpawnInterval && !game.beaten) {
    meteorGrids.push(new MeteorGrid());

    // Play meteor incoming sound
    playSound(meteorIncoming);

    meteorSpawnInterval = Math.floor(
      Math.random() * (difficulty.meteorSpawnMax - difficulty.meteorSpawnMin) +
        difficulty.meteorSpawnMin,
    );

    meteorSpawnTimer = 0;
  }

  invaderSpawnTimer += deltaTime;
  meteorSpawnTimer += deltaTime;
}

// If you click play the game will start
playButton.addEventListener("click", () => {
  playMenu.style.display = "none";
  game.active = true;
  lastTime = 0;
  requestAnimationFrame(animate); // Start the gameplay loop
});

// If you click resume on the pauseMenu it will resume the game
resumeButton.addEventListener("click", () => {
  pauseMenu.style.display = "none";
  game.active = true;
  lastTime = 0;
  requestAnimationFrame(animate); // Start the gameplay loop
});

// Bind lastShotTime to 0
let lastShotTime = 0;
const shootCooldown = 40; // Cooldown period in milliseconds for shooting

// These are the keybinds for the game
addEventListener("keydown", ({ key }) => {
  // Define escape above as this needs to run even if the game is active
  if (key === "Escape") {
    // Switch between true and false status for the game
    game.active = !game.active;

    // Stop all audio
    stopAudio();

    // If the pauseMenu is already in flex hide the menu
    if (pauseMenu.style.display === "flex") {
      pauseMenu.style.display = "none";

      // Call the animate function to unpause the game
      requestAnimationFrame(animate);
      // If the pauseMenu is not shown show it but only if playMenu and restart menu aren't shown on screen
    } else if (
      // Use getComputedStyle() to display their actual display state without this statement it would return null for their display style and thus fail
      getComputedStyle(playMenu).display === "none" &&
      getComputedStyle(restartMenu).display === "none"
    ) {
      // Set pauseMenu to flex if the statements above are true
      pauseMenu.style.display = "flex";
    }
  }

  // If the game is over, beaten, not active and no player.image/position.position
  if (
    game.over ||
    game.beaten ||
    !game.active ||
    (!player.image && !player.position)
  ) {
    // Then return nothing
    return;
  }

  // Keybinds
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case " ": // This is for the spacebar to shoot
      // Current time
      const currentTime = Date.now();

      // Playershoot mechanics that takes into account the shootCoolDown seen above the eventListener
      if (currentTime - lastShotTime >= shootCooldown) {
        projectiles.push(
          new Projectile({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y - 8, // Slighty offset from the player model
            },
            velocity: {
              x: 0,
              y: -16, // Speed at which the projetile travels at
            },
          }),
        );
        lastShotTime = currentTime; // Update the last shot time

        // Restart the shooting sound so rapid shots don't wait for the previous sound to finish
        playerShoot.currentTime = 0;
        playSound(playerShoot);
      }
      break;
  }
});

// When the player releases an key set it to false
addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
