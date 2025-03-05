// Gestionnaire d'effets
const effectsManager = {
    particles: [],
    projectiles: [],
    createHitEffect: function(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                radius: Math.random() * 5 + 2,
                color: color,
                alpha: 1,
                life: 30
            });
        }
    },
    createProjectileHitEffect: function(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                radius: Math.random() * 6 + 2,
                color: color,
                alpha: 1,
                life: 40
            });
        }
        
        // Son d'explosion
        const explosionSound = new Audio();
        explosionSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAACb/5sAZACbAM0AZADNAJsA';
        explosionSound.volume = 0.4;
        explosionSound.play().catch(e => console.log("Audio error:", e));
    },
    createDirectionalAttackEffect: function(x, y, width, height, direction, type) {
        let color;
        let particleCount;
        let particleSpeed;
        let particleSize;
        
        switch(type) {
            case 'up':
                color = '#00ffff';
                particleCount = 15;
                particleSpeed = 8;
                particleSize = 4;
                break;
            case 'down':
                color = '#ff00ff';
                particleCount = 20;
                particleSpeed = 6;
                particleSize = 5;
                break;
            case 'forward':
                color = '#ffff00';
                particleCount = 25;
                particleSpeed = 10;
                particleSize = 3;
                break;
            case 'backward':
                color = '#00ff00';
                particleCount = 18;
                particleSpeed = 7;
                particleSize = 4;
                break;
        }
        
        for (let i = 0; i < particleCount; i++) {
            let vx, vy;
            
            switch(type) {
                case 'up':
                    vx = (Math.random() - 0.5) * 10;
                    vy = -Math.random() * particleSpeed - 2;
                    break;
                case 'down':
                    vx = (Math.random() - 0.5) * 10;
                    vy = Math.random() * particleSpeed + 2;
                    break;
                case 'forward':
                    vx = direction * (Math.random() * particleSpeed + 5);
                    vy = (Math.random() - 0.5) * 6;
                    break;
                case 'backward':
                    vx = -direction * (Math.random() * particleSpeed + 3);
                    vy = (Math.random() - 0.5) * 6;
                    break;
            }
            
            this.particles.push({
                x: x + (Math.random() * width),
                y: y + (Math.random() * height),
                vx: vx,
                vy: vy,
                radius: Math.random() * particleSize + 2,
                color: color,
                alpha: 1,
                life: 30 + Math.random() * 20
            });
        }
        
        // Son d'attaque spéciale
        const attackSound = new Audio();
        attackSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAABVAFwAWwBXAF0AZQBnAGQAYABb';
        attackSound.volume = 0.5;
        attackSound.play().catch(e => console.log("Audio error:", e));
    },
    createKickEffect: function(x, y, direction) {
        const colors = ['#ff0000', '#ff6600', '#ffcc00'];
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: direction * (Math.random() * 5 + 5),
                vy: (Math.random() - 0.5) * 8,
                radius: Math.random() * 4 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                life: 25
            });
        }
    },
    update: function() {
        // Mettre à jour les particules
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            p.life--;
            
            // Gravité pour certaines particules
            if (p.vy !== undefined) {
                p.vy += 0.2;
            }
            
            if (p.life <= 0 || p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Mettre à jour les projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update();
            
            // Vérifier les collisions avec les joueurs
            if (proj.active) {
                // Le projectile ne peut pas toucher son propriétaire
                const target = proj.owner.isPlayer2 ? player1 : player2;
                
                if (proj.checkCollision(target)) {
                    proj.active = false;
                    target.hit(proj.damage, proj.owner);
                    this.createProjectileHitEffect(
                        proj.x + proj.width / 2,
                        proj.y + proj.height / 2,
                        proj.color
                    );
                    
                    // Effet de caméra
                    screenShake(10, 300);
                }
            }
            
            // Supprimer les projectiles inactifs
            if (!proj.active) {
                this.projectiles.splice(i, 1);
            }
        }
    },
    draw: function(ctx) {
        ctx.save();
        
        // Dessiner les projectiles
        for (const proj of this.projectiles) {
            proj.draw();
        }
        
        // Dessiner les particules
        for (const p of this.particles) {
            const rgb = hexToRgb(p.color);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },
    createComboEffect: function(x, y, comboCount) {
        const colors = ['#ffcc00', '#ff6600', '#ff3300'];
        for (let i = 0; i < comboCount * 3; i++) {
            this.particles.push({
                x: x + Math.random() * 40 - 20,
                y: y - Math.random() * 20,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 5 - 3,
                radius: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                life: 40
            });
        }
    },
    createEnergyChargeEffect: function(player) {
        const x = player.x + player.width / 2;
        const y = player.y + player.height / 2;
        const color = player.isPlayer2 ? '#ff00cc' : '#00aaff';
        
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * player.width * 1.5,
                y: y + (Math.random() - 0.5) * player.height,
                vx: (x - (x + (Math.random() - 0.5) * player.width)) * 0.05,
                vy: (y - (y + (Math.random() - 0.5) * player.height)) * 0.05,
                radius: Math.random() * 4 + 2,
                color: color,
                alpha: 0.7,
                life: 20
            });
        }
    }
};