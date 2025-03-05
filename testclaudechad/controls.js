// Gestion des entrées clavier
document.addEventListener('keydown', function(e) {
    // Stocker la touche enfoncée (accepter majuscules et minuscules)
    keys[e.key] = true;
    
    if (!gameStarted || gameOver) return;
    
    // Joueur 1
    if ((e.key === 'w' || e.key === 'W') && !player1.isJumping && !player1.isCrouching) {
        player1.isJumping = true;
        player1.velocityY = -12;
    }
    if ((e.key === 's' || e.key === 'S') && !player1.isJumping) {
        player1.isCrouching = true;
    }
    if (e.key === 'q' || e.key === 'Q') {
        player1.attack('punch');
    }
    if (e.key === 'e' || e.key === 'E') {
        player1.attack('kick');
    }
    
    // Joueur 2
    if (e.key === 'ArrowUp' && !player2.isJumping && !player2.isCrouching) {
        player2.isJumping = true;
        player2.velocityY = -12;
    }
    if (e.key === 'ArrowDown' && !player2.isJumping) {
        player2.isCrouching = true;
    }
    if (e.key === 'm' || e.key === 'M') {
        player2.attack('punch');
    }
    if (e.key === 'k' || e.key === 'K') {
        player2.attack('kick');
    }
});

document.addEventListener('keyup', function(e) {
    // Libérer la touche relâchée
    keys[e.key] = false;
    
    if (!gameStarted || gameOver) return;
    
    // Joueur 1
    if (e.key === 's' || e.key === 'S') {
        player1.isCrouching = false;
    }
    
    // Joueur 2
    if (e.key === 'ArrowDown') {
        player2.isCrouching = false;
    }
});

// Configuration des contrôles tactiles
function setupTouchControls() {
    // Joueur 1
    document.getElementById('p1-left').addEventListener('touchstart', () => { keys['a'] = true; });
    document.getElementById('p1-left').addEventListener('touchend', () => { keys['a'] = false; });
    
    document.getElementById('p1-right').addEventListener('touchstart', () => { keys['d'] = true; });
    document.getElementById('p1-right').addEventListener('touchend', () => { keys['d'] = false; });
    
    document.getElementById('p1-jump').addEventListener('touchstart', () => { 
        if (!player1.isJumping && !player1.isCrouching) {
            player1.isJumping = true;
            player1.velocityY = -12;
        }
    });
    
    document.getElementById('p1-punch').addEventListener('touchstart', () => { player1.attack('punch'); });
    document.getElementById('p1-kick').addEventListener('touchstart', () => { player1.attack('kick'); });
    document.getElementById('p1-special').addEventListener('touchstart', () => { player1.fireProjectile(); });
    
    // Joueur 2
    document.getElementById('p2-left').addEventListener('touchstart', () => { keys['ArrowLeft'] = true; });
    document.getElementById('p2-left').addEventListener('touchend', () => { keys['ArrowLeft'] = false; });
    
    document.getElementById('p2-right').addEventListener('touchstart', () => { keys['ArrowRight'] = true; });
    document.getElementById('p2-right').addEventListener('touchend', () => { keys['ArrowRight'] = false; });
    
    document.getElementById('p2-jump').addEventListener('touchstart', () => { 
        if (!player2.isJumping && !player2.isCrouching) {
            player2.isJumping = true;
            player2.velocityY = -12;
        }
    });
    
    document.getElementById('p2-punch').addEventListener('touchstart', () => { player2.attack('punch'); });
    document.getElementById('p2-kick').addEventListener('touchstart', () => { player2.attack('kick'); });
    document.getElementById('p2-special').addEventListener('touchstart', () => { player2.fireProjectile(); });
    
    // Prévenir le défilement sur mobile lors des touches
    document.querySelectorAll('.touch-btn').forEach(btn => {
        btn.addEventListener('touchstart', e => e.preventDefault());
        btn.addEventListener('touchmove', e => e.preventDefault());
        btn.addEventListener('touchend', e => e.preventDefault());
    });
}

// Initialiser les contrôles tactiles
setupTouchControls();