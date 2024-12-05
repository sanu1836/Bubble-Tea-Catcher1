const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas size
canvas.width = 400;
canvas.height = 600;

// Game Variables
let character = { x: 175, y: 500, width: 50, height: 50 };
let cups = [];
let score = 0;
let gameInterval;
let timerInterval;
let timeLeft = 30; // Game duration in seconds
let isGameRunning = false;

// Track Plays
const maxPlays = 3;
let playCount = localStorage.getItem('playCount') || 0;

// Load Images
const characterImg = new Image();
characterImg.src = './images/character.png'; // Replace with your character PNG

const cupImg = new Image();
cupImg.src = './images/cup.png'; // Replace with your cup PNG

const backgroundImg = new Image();
backgroundImg.src = './images/background.png'; // Replace with your background PNG

const sparkleImg = new Image();
sparkleImg.src = './images/sparkle.png'; // Replace with your sparkle PNG

// Move Character
let keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// Create Cups
function createCup() {
    const x = Math.random() * (canvas.width - 30); // Random horizontal position
    cups.push({ x, y: 0, width: 30, height: 50, speed: 3 });
}

// Update Game
function updateGame() {
    // Clear canvas and draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Move character
    if (keys['ArrowLeft'] && character.x > 0) character.x -= 5;
    if (keys['ArrowRight'] && character.x < canvas.width - character.width) character.x += 5;

    // Draw character
    ctx.drawImage(characterImg, character.x, character.y, character.width, character.height);

    // Update and draw cups
    for (let i = 0; i < cups.length; i++) {
        cups[i].y += cups[i].speed; // Falling speed
        ctx.drawImage(cupImg, cups[i].x, cups[i].y, cups[i].width, cups[i].height);

        // Check collision
        if (
            cups[i].x < character.x + character.width &&
            cups[i].x + cups[i].width > character.x &&
            cups[i].y < character.y + character.height &&
            cups[i].y + cups[i].height > character.y
        ) {
            // Show sparkle effect
            ctx.drawImage(sparkleImg, cups[i].x, cups[i].y, 40, 40);

            // Remove cup and increase score
            cups.splice(i, 1);
            score++;
            document.getElementById('score').textContent = score;
        } else if (cups[i].y > canvas.height) {
            cups.splice(i, 1); // Remove missed cups
        }
    }
}

// Timer Function
function startTimer() {
    document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(score >= 50);
        }
    }, 1000);
}

// Generate Unique Reward Code
function generateRewardCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'WIN';
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// End Game
function endGame(win) {
    clearInterval(gameInterval);
    isGameRunning = false;

    // Show results
    const result = document.getElementById('result');
    if (win) {
        const rewardCode = generateRewardCode();
        result.textContent = `🎉 Congratulations! You win! Code: ${rewardCode}`;
    } else {
        result.textContent = `⏰ Time’s up! Try again.`;
    }
}

// Check Play Limit
function checkPlayLimit() {
    if (playCount >= maxPlays) {
        document.getElementById('startButton').disabled = true;
        document.getElementById('result').textContent =
            'You have reached the maximum number of plays. Thank you for participating!';
        return false;
    }
    return true;
}

// Start Game
function startGame() {
    if (isGameRunning || !checkPlayLimit()) return;

    // Increment play count and save to local storage
    playCount++;
    localStorage.setItem('playCount', playCount);

    // Reset Variables
    isGameRunning = true;
    score = 0;
    timeLeft = 30;
    cups = [];
    document.getElementById('score').textContent = score;
    document.getElementById('result').textContent = '';

    // Start Game Loop and Timer
    gameInterval = setInterval(() => {
        updateGame();
        if (Math.random() < 0.05) createCup();
    }, 30);

    startTimer();
}

// Event Listeners
document.getElementById('startButton').addEventListener('click', startGame);
