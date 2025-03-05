// Variables globales partagées
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.querySelector('.title-screen');
const startButton = document.querySelector('.start-button');
const gameOverScreen = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart-button');
const winnerText = document.querySelector('.winner-text');
const koText = document.querySelector('.ko-text');
const player1HealthBar = document.getElementById('player1Health');
const player2HealthBar = document.getElementById('player2Health');
const player1SpecialBar = document.getElementById('player1Special');
const player2SpecialBar = document.getElementById('player2Special');
const timerElement = document.querySelector('.timer');

// Variables d'état du jeu
let gameStarted = false;
let gameOver = false;
let gameTime = 99;
let timerInterval;
const keys = {};
let groundLevel = canvas.height - 50;

// Variables pour l'effet de secousse d'écran
let screenShakeTime = 0;
let screenShakeIntensity = 0;

// Fonction pour convertir hex en RGB
function hexToRgb(hex) {
    // Enlever le # si présent
    hex = hex.replace('#', '');
    
    // Convertir en valeurs RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

// Fonction d'effet de secousse d'écran
function screenShake(intensity, duration) {
    screenShakeIntensity = intensity;
    screenShakeTime = duration;
}

// Mise à jour des barres de vie
function updateHealthBar(bar, health) {
    bar.style.width = `${health}%`;
    
    // Effet de flash pour la barre de vie
    bar.animate([
        { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
        { backgroundColor: 'linear-gradient(to right, #ff0000, #ff9900)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
}

// Affichage du texte K.O.
function showKO() {
    koText.style.display = 'block';
    koText.style.animation = 'koAnimation 2s forwards';
    
    // Effet de secousse important
    screenShake(15, 500);
    
    // Créer des particules explosives
    for (let i = 0; i < 30; i++) {
        effectsManager.particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            radius: Math.random() * 5 + 3,
            color: i % 2 === 0 ? '#ff0000' : '#ffcc00',
            alpha: 1,
            life: 60
        });
    }
    
    // Son K.O.
    const koSound = new Audio();
    koSound.src = 'data:audio/wav;base64,UklGRnIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVAAAAAA' +
        'AP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//';
    koSound.volume = 0.6;
    koSound.play().catch(e => console.log("Audio error:", e));
}

// Affichage du compteur de combo
function showComboText(count, x, y) {
    const comboDiv = document.createElement('div');
    comboDiv.textContent = `${count} COMBO!`;
    comboDiv.style.position = 'absolute';
    comboDiv.style.left = `${x + 30}px`;
    comboDiv.style.top = `${y - 20}px`;
    comboDiv.style.color = '#ffcc00';
    comboDiv.style.fontSize = '24px';
    comboDiv.style.fontWeight = 'bold';
    comboDiv.style.textShadow = '2px 2px 2px #000, 0 0 10px #ff6600';
    comboDiv.style.zIndex = '15';
    comboDiv.style.pointerEvents = 'none';
    document.querySelector('.game-container').appendChild(comboDiv);
    
    // Animation
    comboDiv.animate([
        { transform: 'translateY(0) scale(1)', opacity: 1, textShadow: '2px 2px 2px #000, 0 0 10px #ff6600' },
        { transform: 'translateY(-20px) scale(1.3)', opacity: 1, textShadow: '2px 2px 2px #000, 0 0 20px #ff6600' },
        { transform: 'translateY(-50px) scale(1)', opacity: 0, textShadow: '2px 2px 2px #000, 0 0 5px #ff6600' }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).onfinish = () => comboDiv.remove();
}

// Montrer un indicateur d'attaque spéciale
function showSpecialMoveIndicator(playerIsP2, type, x, y) {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'special-indicator';
    
    let moveText = "";
    let color = playerIsP2 ? "#ff00cc" : "#00aaff";
    
    switch(type) {
        case 'projectile':
            moveText = "HADOKEN!";
            break;
        case 'up':
            moveText = "SHORYUKEN!";
            break;
        case 'down':
            moveText = "SLAM!";
            break;
        case 'forward':
            moveText = "RUSH!";
            break;
        case 'backward':
            moveText = "COUNTER!";
            break;
    }
    
    indicatorDiv.textContent = moveText;
    indicatorDiv.style.color = color;
    indicatorDiv.style.position = 'absolute';
    indicatorDiv.style.left = `${x}px`;
    indicatorDiv.style.top = `${y}px`;
    indicatorDiv.style.fontSize = '20px';
    indicatorDiv.style.fontWeight = 'bold';
    indicatorDiv.style.textShadow = `0 0 10px ${color}`;
    indicatorDiv.style.opacity = '0';
    
    document.querySelector('.game-container').appendChild(indicatorDiv);
    
    // Animation
    indicatorDiv.animate([
        { transform: 'translateY(0)', opacity: 0 },
        { transform: 'translateY(-20px)', opacity: 1 },
        { transform: 'translateY(-40px)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).onfinish = () => indicatorDiv.remove();
}