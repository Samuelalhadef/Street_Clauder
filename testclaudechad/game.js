// Création des objets du jeu
const player1 = new Sprite(150, groundLevel - 100, 50, 100, '#4169e1');
const player2 = new Sprite(550, groundLevel - 100, 50, 100, '#ff6347', true);
const background = new Background();

// Variables pour le stockage des combinaisons de touches pour les attaques spéciales
const specialMoves = {
    player1: {
        projectile: false,
        upSpecial: false,
        downSpecial: false,
        forwardSpecial: false,
        backwardSpecial: false,
        lastDirection: null,
        comboTimer: 0
    },
    player2: {
        projectile: false,
        upSpecial: false,
        downSpecial: false,
        forwardSpecial: false,
        backwardSpecial: false,
        lastDirection: null,
        comboTimer: 0
    }
};

// Initialisation du jeu
function init() {
    // Réinitialiser les positions
    player1.x = 150;
    player1.y = groundLevel - player1.height;
    player1.health = 100;
    player1.specialEnergy = 30;
    player1.facingLeft = false;
    
    player2.x = 550;
    player2.y = groundLevel - player2.height;
    player2.health = 100;
    player2.specialEnergy = 30;
    player2.facingLeft = true;
    
    // Réinitialiser les barres de vie
    updateHealthBar(player1HealthBar, 100);
    updateHealthBar(player2HealthBar, 100);
    
    // Réinitialiser les barres d'énergie spéciale
    player1SpecialBar.style.width = '30%';
    player2SpecialBar.style.width = '30%';
    
    // Réinitialiser le timer
    gameTime = 99;
    timerElement.textContent = gameTime;
    
    // État du jeu
    gameOver = false;
    
    // Vider les projectiles et effets
    effectsManager.projectiles = [];
    effectsManager.particles = [];
    
    // Démarrer le timer
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameStarted && !gameOver) {
            gameTime--;
            timerElement.textContent = gameTime < 10 ? '0' + gameTime : gameTime;
            
            if (gameTime <= 0) {
                clearInterval(timerInterval);
                gameTime = 0;
                gameOver = true;
                
                // Déterminer le gagnant par la santé
                if (player1.health > player2.health) {
                    winnerText.textContent = 'JOUEUR 1 GAGNE!';
                } else if (player2.health > player1.health) {
                    winnerText.textContent = 'JOUEUR 2 GAGNE!';
                } else {
                    winnerText.textContent = 'MATCH NUL!';
                }
                
                setTimeout(endGame, 1000);
            }
        }
    }, 1000);
}

// Détection des collisions
function detectCollisions() {
    // Collision entre joueurs
    const p1Right = player1.x + player1.width;
    const p2Right = player2.x + player2.width;
    
    if (p1Right > player2.x && player1.x < p2Right &&
        player1.y + player1.height > player2.y && 
        player1.y < player2.y + player2.height) {
        
        // Empêcher le chevauchement
        if (player1.x < player2.x) {
            player1.x = player2.x - player1.width - 1;
        } else {
            player1.x = p2Right + 1;
        }
    }
    
    // Collision des attaques normales
    if (player1.hitboxes.attack.active) {
        const attack = player1.hitboxes.attack;
        const target = player2.hitboxes.body;
        
        if (attack.x < target.x + target.width && 
            attack.x + attack.width > target.x &&
            attack.y < target.y + target.height &&
            attack.y + attack.height > target.y) {
            
            // Déterminer le type d'attaque et les dégâts
            let damage;
            if (attack.type === 'special') {
                // Attaque spéciale directionnelle
                switch(player1.specialType) {
                    case 'up': damage = 15; break;
                    case 'down': damage = 30; break;
                    case 'forward': damage = 20; break;
                    case 'backward': damage = 15; break;
                    default: damage = 15;
                }
            } else {
                // Attaque normale
                damage = player1.attackType === 'punch' ? 5 : 8;
            }
            
            player2.hit(damage, player1);
            player1.hitboxes.attack.active = false;
        }
    }
    
    if (player2.hitboxes.attack.active) {
        const attack = player2.hitboxes.attack;
        const target = player1.hitboxes.body;
        
        if (attack.x < target.x + target.width && 
            attack.x + attack.width > target.x &&
            attack.y < target.y + target.height &&
            attack.y + attack.height > target.y) {
            
            // Déterminer le type d'attaque et les dégâts
            let damage;
            if (attack.type === 'special') {
                // Attaque spéciale directionnelle
                switch(player2.specialType) {
                    case 'up': damage = 15; break;
                    case 'down': damage = 30; break;
                    case 'forward': damage = 20; break;
                    case 'backward': damage = 15; break;
                    default: damage = 15;
                }
            } else {
                // Attaque normale
                damage = player2.attackType === 'punch' ? 5 : 8;
            }
            
            player1.hit(damage, player2);
            player2.hitboxes.attack.active = false;
        }
    }
}

// Mise à jour de l'orientation des joueurs
function updateFacingDirection() {
    if (player1.x < player2.x) {
        player1.facingLeft = false;
        player2.facingLeft = true;
    } else {
        player1.facingLeft = true;
        player2.facingLeft = false;
    }
}

// Fin de partie
function endGame() {
    gameOverScreen.style.display = 'flex';
    
    if (player1.health <= 0) {
        winnerText.textContent = 'JOUEUR 2 GAGNE!';
    } else if (player2.health <= 0) {
        winnerText.textContent = 'JOUEUR 1 GAGNE!';
    }
}

// Fonction pour demander le focus sur le canvas
function setGameFocus() {
    canvas.focus();
    document.body.focus();
}

// Boucle principale du jeu
function gameLoop() {
    // Appliquer l'effet de secousse si actif
    ctx.save();
    if (screenShakeTime > 0) {
        const shakeX = (Math.random() - 0.5) * 2 * screenShakeIntensity;
        const shakeY = (Math.random() - 0.5) * 2 * screenShakeIntensity;
        ctx.translate(shakeX, shakeY);
        
        screenShakeTime -= 16; // ~60 FPS
        if (screenShakeTime <= 0) {
            screenShakeIntensity = 0;
        }
    }
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mettre à jour et dessiner le fond
    background.update();
    background.draw();
    
    if (gameStarted && !gameOver) {
        // Mettre à jour les joueurs
        player1.update(groundLevel);
        player2.update(groundLevel);
        
        // Détecter les collisions
        detectCollisions();
        
        // Mettre à jour l'orientation des joueurs
        updateFacingDirection();
        
        // Traiter les entrées clavier continues
        processKeys();
        
        // Traiter les combinaisons d'attaques spéciales
        processSpecialMoves();
        
        // Mettre à jour les effets
        effectsManager.update();
    }
    
    // Dessiner les joueurs
    player1.draw();
    player2.draw();
    
    // Dessiner les effets par-dessus
    effectsManager.draw(ctx);
    
    ctx.restore(); // Restaurer après la secousse
    
    // Boucle d'animation
    requestAnimationFrame(gameLoop);
}

// Traitement des touches pour le mouvement
function processKeys() {
    // Joueur 1
    if (keys['a'] || keys['A']) {
        player1.velocityX = -3;
    } else if (keys['d'] || keys['D']) {
        player1.velocityX = 3;
    } else {
        player1.velocityX = 0;
    }
    
    // Joueur 2
    if (keys['ArrowLeft']) {
        player2.velocityX = -3;
    } else if (keys['ArrowRight']) {
        player2.velocityX = 3;
    } else {
        player2.velocityX = 0;
    }
}

// Traitement des combinaisons d'attaques spéciales
function processSpecialMoves() {
    // Joueur 1 - Projectile
    if (keys['r'] || keys['R']) {
        player1.fireProjectile();
    }
    
    // Joueur 1 - Attaques directionnelles
    if (keys['f'] || keys['F']) {
        // Vérifier la direction pour l'attaque spéciale
        if (keys['w'] || keys['W']) {
            player1.useDirectionalAttack('up');
        } else if (keys['s'] || keys['S']) {
            player1.useDirectionalAttack('down');
        } else if (keys['d'] || keys['D']) {
            player1.useDirectionalAttack('forward');
        } else if (keys['a'] || keys['A']) {
            player1.useDirectionalAttack('backward');
        }
    }
    
    // Joueur 2 - Projectile
    if (keys['l'] || keys['L']) {
        player2.fireProjectile();
    }
    
    // Joueur 2 - Attaques directionnelles
    if (keys['p'] || keys['P']) {
        // Vérifier la direction pour l'attaque spéciale
        if (keys['ArrowUp']) {
            player2.useDirectionalAttack('up');
        } else if (keys['ArrowDown']) {
            player2.useDirectionalAttack('down');
        } else if (keys['ArrowRight']) {
            player2.useDirectionalAttack('forward');
        } else if (keys['ArrowLeft']) {
            player2.useDirectionalAttack('backward');
        }
    }
}

// Initialisation et démarrage du jeu
startButton.addEventListener('click', () => {
    titleScreen.style.display = 'none';
    gameStarted = true;
    init();
    setGameFocus();
});

// Redémarrer le jeu
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    koText.style.display = 'none';
    koText.style.animation = 'none';
    init();
    gameStarted = true;
    setGameFocus();
});

// Ajouter une pression de touche à l'intérieur du canvas
canvas.addEventListener('click', setGameFocus);
document.body.addEventListener('click', setGameFocus);

// Lancer le jeu
init();
gameLoop();