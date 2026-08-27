<img width="1024" alt="Project Eve" src="/assets/game.png">

A simple 2D Spaceshooter game developed with JavaScript, HTML, and CSS.

## Description

Project Eve is a classic 2D arcade-style spaceship shooter game. Players control a spaceship, moving it left and right to dodge incoming asteroids and shoot down alien invaders. The game features increasing difficulty, a scoring system, and high score persistence using local storage. It's designed for desktop or laptop play.

## Features

- **Engaging Gameplay:** Classic space shooter mechanics with intuitive controls.
- **Dynamic Difficulty:** The game gets progressively harder as your score increases, introducing faster enemies and more challenging patterns.
- **Scoring System:** Earn points by shooting down invaders and surviving longer.
- **Responsive Design:** While primarily designed for larger screens, it includes a message for smaller devices.
- **Immersive Audio:** Sound effects for player actions, enemy interactions, and game events enhance the experience.
- **Visual Effects:** Particle effects for explosions and movement add to the visual appeal.

## Tech Stack 

- **Language:** JavaScript
- **Markup:** HTML
- **Styling:** CSS

## Installation

This project is a client-side web application and does not require a complex installation process. Simply clone the repository and open the `index.html` file in your web browser.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/strahinjazoranovic/Project-Eve.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd Project-Eve
   ```
3. **Open `index.html`:**
   Open the `index.html` file in your preferred web browser.

*No external dependencies or build tools are required to run the game.* 

## Usage

Project Eve is a single-player game where you control a spaceship to combat waves of enemies and asteroids.

### Controls

- **A:** Move spaceship left
- **D:** Move spaceship right
- **Spacebar:** Shoot
- **Esc:** Pause/Resume the game

### Game Flow

- **Start Menu:** Upon opening `index.html`, you'll see the game title, an image, and a "PLAY GAME" button. The high score is displayed here.
- **Game Screen:** After clicking "PLAY GAME", you are taken to `game.html`. The game canvas will load with your spaceship, score, high score, and level display.
- **Gameplay:** Use the controls to move and shoot. Invaders will appear in grids and attempt to shoot you. Asteroids will also fall from the sky.
- **Difficulty:** The game's difficulty increases with your score. Higher levels mean faster enemies and more projectiles.
- **Health:** Your spaceship has a health bar. Getting hit by enemy projectiles or asteroids reduces your health.
- **Game Over:** If your health reaches zero, the game ends. Your score is displayed, and you can choose to restart or return to the home page. Your high score is updated if your current score is higher.
- **Game Beaten:** If you reach a score of 160,000, you beat the game. A congratulatory message is displayed.
- **Pause Menu:** Pressing 'Esc' will pause the game, allowing you to resume, restart, or return to the home page.

## How to Use

1. **Access the Game:** Navigate to the root directory of the cloned repository in your file explorer and double-click on `index.html`. This will open the game's starting screen in your default web browser.
2. **Start Playing:** Click the "PLAY GAME" button on the start screen. This will load the main game interface.
3. **Control Your Ship:** Use the 'A' and 'D' keys to move your spaceship left and right, respectively. Use the spacebar to fire your weapon.
4. **Survive and Score:** Aim to destroy incoming alien invaders and avoid colliding with them or their projectiles. Dodge falling asteroids as well.
5. **Monitor Your Progress:** Keep an eye on your current score, the high score, and the current level displayed at the top of the game screen.
6. **Pause and Manage:** Press the 'Esc' key at any time to pause the game. From the pause menu, you can resume the game, restart the current session, or go back to the main menu.
7. **Achieve Victory:** Strive to reach the target score (160,000) to beat the game. 

## Project Structure

```
Project-Eve/
├── assets/
│   ├── game.png
│   └── player/
│       └── spaceshuttle.png
├── css/
│   └── game.css
├── js/
│   └── game.js
├── sounds/
│   ├── invader/
│   │   ├── hitInvader.ogg
│   │   ├── invader.ogg
│   │   └── shootInvader.ogg
│   ├── meteor/
│   │   ├── hit.ogg
│   │   └── incoming.ogg
│   └── player/
│       ├── defeated.ogg
│       ├── healthup.ogg
│       ├── hitPlayer.ogg
│       ├── player.ogg
│       └── shootPlayer.ogg
├── index.html
├── game.html
├── README.md
├── assets/license.txt
└── sounds/License.txt
```

## Developer

Developed by [strahinjazoranovic](https://github.com/strahinjazoranovic).
