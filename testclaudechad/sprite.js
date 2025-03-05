// Classes pour les sprites et animations
class Sprite {
    constructor(x, y, width, height, color, isPlayer2 = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalHeight = height; // Hauteur d'origine
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isCrouching = false;
        this.isAttacking = false;
        this.attackType = null;
        this.attackTimer = 0;
        this.health = 100;
        this.specialEnergy = 0; // Énergie pour les attaques spéciales
        this.isPlayer2 = isPlayer2;
        this.facingLeft = isPlayer2 ? false : true;
        this.hitboxes = {
            body: { x: 0, y: 0, width: 0, height: 0 },
            attack: { x: 0, y: 0, width: 0, height: 0, active: false }
        };
        this.animationFrame = 0;
        this.frameCount = 0;
        this.isHit = false;
        this.hitReactionX = 0;
        this.hitTimer = 0;
        this.comboCounter = 0;
        this.lastHitTime = 0;
        this.shadowY = 0; // Pour l'effet d'ombre
        this.idleFrames = 4;
        this.walkFrames = 6;
        this.attackFrames = 3;
        this.state = 'idle'; // idle, walk, attack, jump, crouch, hit
        this.stateFrameCount = 0;
        this.frameDelay = 6; // Délai entre les frames pour les animations
        
        // Ajouts pour les attaques spéciales
        this.isChargingSpecial = false;
        this.isUsingSpecial = false;
        this.specialType = null;
        this.specialTimer = 0;
        this.specialCooldown = 0;
        this.projectileCooldown = 0;
        this.directionalAttackCooldown = 0;
        
        // Couleurs du personnage
        this.bodyColor = isPlayer2 ? '#f44336' : '#2196F3';
        this.headColor = '#ffdbac';
        this.bandanaColor = isPlayer2 ? '#ff0000' : '#0000ff';
        this.clothesColor = isPlayer2 ? '#ffffff' : '#ffffff';
        this.projectileColor = isPlayer2 ? '#ff00cc' : '#00aaff';
        
        // Effets de lumière
        this.lightEffects = [];
    }
    
    update(ground) {
        // Mouvement horizontal avec inertie
        this.x += this.velocityX;
        
        // Ajout d'un effet de friction pour des mouvements plus naturels
        if (this.velocityX > 0.1) {
            this.velocityX -= 0.1;
        } else if (this.velocityX < -0.1) {
            this.velocityX += 0.1;
        } else {
            this.velocityX = 0;
        }
        
        // Limites de l'écran
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        // Gravité et saut
        if (this.isJumping) {
            this.y += this.velocityY;
            this.velocityY += 0.6; // Gravité
            
            if (this.y >= ground - this.height) {
                this.y = ground - this.height;
                this.isJumping = false;
                this.velocityY = 0;
                // Effet de particules à l'atterrissage
                for (let i = 0; i < 5; i++) {
                    effectsManager.particles.push({
                        x: this.x + this.width / 2 + (Math.random() - 0.5) * 20,
                        y: ground,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 2 - 1,
                        radius: Math.random() * 3 + 1,
                        color: '#ccc',
                        alpha: 0.7,
                        life: 15
                    });
                }
            }
        }
        
        // Accroupissement - CORRECTION: S'assurer que le personnage reste au sol
        if (this.isCrouching) {
            if (!this.isJumping) {
                // Réduire la hauteur en s'accroupissant et ajuster la position Y
                const crouchHeight = this.originalHeight * 0.6;
                const heightDiff = this.originalHeight - crouchHeight;
                this.height = crouchHeight;
                this.y = ground - this.height; // Repositionner au sol
            }
        } else {
            // Rétablir la hauteur normale si on n'est pas accroupi
            if (!this.isJumping) {
                this.height = this.originalHeight;
                this.y = ground - this.height; // Repositionner au sol
            }
        }
        
        // Effet d'ombre sous le personnage
        this.shadowY = ground;
        
        // Animation d'attaque
        if (this.isAttacking) {
            this.attackTimer++;
            if (this.attackTimer > 20) {
                this.isAttacking = false;
                this.attackTimer = 0;
                this.attackType = null;
                this.hitboxes.attack.active = false;
                this.state = this.velocityX !== 0 ? 'walk' : 'idle';
            } else if (this.attackTimer > 5 && this.attackTimer < 15) {
                // Activation de la hitbox d'attaque pendant les frames 5-15
                this.hitboxes.attack.active = true;
            }
        }
        
        // Animation de coup reçu
        if (this.isHit) {
            this.hitTimer++;
            
            // Effet de recul progressif
            if (this.hitTimer < 10) {
                this.x += this.hitReactionX;
                this.hitReactionX *= 0.8; // Amortissement
            }
            
            if (this.hitTimer > 20) {
                this.isHit = false;
                this.hitTimer = 0;
                this.state = 'idle';
            }
        }
        
        // Animation d'attaque spéciale directionnelle
        if (this.isUsingSpecial) {
            this.specialTimer++;
            
            if (this.specialTimer > 30) {
                this.isUsingSpecial = false;
                this.specialTimer = 0;
                this.specialType = null;
                this.state = 'idle';
            } else if (this.specialTimer === 15) {
                // Moment de l'impact de l'attaque spéciale
                this.executeSpecialAttack();
            }
        }
        
        // Gestion du cooldown des attaques spéciales
        if (this.projectileCooldown > 0) {
            this.projectileCooldown--;
        }
        
        if (this.directionalAttackCooldown > 0) {
            this.directionalAttackCooldown--;
        }
        
        // Mise à jour des hitboxes
        this.updateHitboxes();
        
        // Régénération graduelle de l'énergie spéciale
        if (this.specialEnergy < 100 && !this.isHit && !this.isUsingSpecial) {
            this.specialEnergy += 0.1;
            if (this.specialEnergy > 100) this.specialEnergy = 100;
            
            // Mise à jour de la barre d'énergie
            const specialBar = this.isPlayer2 ? player2SpecialBar : player1SpecialBar;
            specialBar.style.width = `${this.specialEnergy}%`;
        }
        
        // Animation - Gestion des états
        this.stateFrameCount++;
        if (this.stateFrameCount >= this.frameDelay) {
            this.stateFrameCount = 0;
            
            // Mise à jour de l'animation selon l'état
            if (this.state === 'idle') {
                this.animationFrame = (this.animationFrame + 1) % this.idleFrames;
            } else if (this.state === 'walk') {
                this.animationFrame = (this.animationFrame + 1) % this.walkFrames;
            } else if (this.state === 'attack') {
                this.animationFrame = (this.animationFrame + 1) % this.attackFrames;
            }
        }
        
        // Détermine l'état actuel
        if (this.isHit) {
            this.state = 'hit';
        } else if (this.isUsingSpecial) {
            this.state = 'special';
        } else if (this.isAttacking) {
            this.state = 'attack';
        } else if (this.isJumping) {
            this.state = 'jump';
        } else if (this.isCrouching) {
            this.state = 'crouch';
        } else if (this.velocityX !== 0) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }
        
        // Réinitialiser le combo si trop de temps s'est écoulé
        if (Date.now() - this.lastHitTime > 1500) {
            this.comboCounter = 0;
        }
        
        // Mise à jour des effets de lumière
        for (let i = this.lightEffects.length - 1; i >= 0; i--) {
            const effect = this.lightEffects[i];
            effect.life--;
            effect.radius += 1;
            effect.alpha -= 0.05;
            
            if (effect.life <= 0) {
                this.lightEffects.splice(i, 1);
            }
        }
    }
    
    updateHitboxes() {
        // Hitbox du corps
        this.hitboxes.body = {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 20
        };
        
        // Hitbox d'attaque
        if (this.isAttacking) {
            const attackWidth = this.attackType === 'punch' ? 40 : 50;
            const attackHeight = this.attackType === 'punch' ? 30 : 20;
            const attackX = this.facingLeft ? 
                this.x - attackWidth + 10 : 
                this.x + this.width - 10;
            const attackY = this.isCrouching ? 
                this.y + this.height - attackHeight - 10 : 
                this.y + this.height / 3;
            
            this.hitboxes.attack = {
                x: attackX,
                y: attackY,
                width: attackWidth,
                height: attackHeight,
                active: true
            };
        }
        
        // Hitbox d'attaque spéciale directionnelle
        if (this.isUsingSpecial && this.specialTimer >= 15 && this.specialTimer <= 25) {
            let attackWidth, attackHeight, attackX, attackY;
            
            switch(this.specialType) {
                case 'up':
                    attackWidth = this.width;
                    attackHeight = 60;
                    attackX = this.x;
                    attackY = this.y - attackHeight;
                    break;
                case 'down':
                    attackWidth = this.width * 1.5;
                    attackHeight = 30;
                    attackX = this.x - this.width * 0.25;
                    attackY = this.y + this.height;
                    break;
                case 'forward':
                    attackWidth = 80;
                    attackHeight = this.height * 0.7;
                    attackX = this.facingLeft ? this.x - attackWidth : this.x + this.width;
                    attackY = this.y + this.height * 0.15;
                    break;
                case 'backward':
                    attackWidth = 60;
                    attackHeight = this.height;
                    attackX = this.facingLeft ? this.x + this.width : this.x - attackWidth;
                    attackY = this.y;
                    break;
            }
            
            this.hitboxes.attack = {
                x: attackX,
                y: attackY,
                width: attackWidth,
                height: attackHeight,
                active: true,
                type: 'special'
            };
        }
    }
    // Suite de la classe Sprite
    attack(type) {
        if (!this.isAttacking && !this.isHit && !this.isUsingSpecial) {
            this.isAttacking = true;
            this.attackType = type;
            this.attackTimer = 0;
            this.state = 'attack';
            this.animationFrame = 0;
            
            // Ajouter un effet de lumière
            this.lightEffects.push({
                x: this.facingLeft ? this.x : this.x + this.width,
                y: this.y + this.height / 2,
                radius: 20,
                color: type === 'punch' ? '#ffaa00' : '#ff0000',
                alpha: 0.7,
                life: 10
            });
            
            // Son d'attaque
            const attackSound = new Audio();
            attackSound.src = type === 'punch' ? 
                'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAACP/6T/XQCp/1sAQQBGAA==' : 
                'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAACi/8f/1P/L/wsAFgDj/xAA';
            attackSound.volume = 0.3;
            attackSound.play().catch(e => console.log("Audio error:", e));
            
            // Gain d'énergie spéciale lors d'une attaque réussie
            this.specialEnergy += 5;
            if (this.specialEnergy > 100) this.specialEnergy = 100;
            
            // Mise à jour de la barre d'énergie
            const specialBar = this.isPlayer2 ? player2SpecialBar : player1SpecialBar;
            specialBar.style.width = `${this.specialEnergy}%`;
        }
    }
    
    fireProjectile() {
        // Vérifier si le joueur a assez d'énergie et si le cooldown est terminé
        if (this.specialEnergy >= 30 && this.projectileCooldown <= 0 && !this.isHit && !this.isUsingSpecial) {
            // Consommer de l'énergie
            this.specialEnergy -= 30;
            
            // Mise à jour de la barre d'énergie
            const specialBar = this.isPlayer2 ? player2SpecialBar : player1SpecialBar;
            specialBar.style.width = `${this.specialEnergy}%`;
            
            // Activer le cooldown
            this.projectileCooldown = 60; // ~1 seconde à 60 FPS
            
            // Créer un projectile
            const direction = this.facingLeft ? -1 : 1;
            const projectileX = this.facingLeft ? this.x - 30 : this.x + this.width;
            const projectileY = this.y + this.height / 3;
            
            const projectile = new Projectile(
                projectileX,
                projectileY,
                30,
                30,
                direction,
                7,
                this,
                this.projectileColor
            );
            
            // Ajouter le projectile au gestionnaire d'effets
            effectsManager.projectiles.push(projectile);
            
            // Animation de lancement
            this.state = 'attack';
            this.animationFrame = 0;
            
            // Effet visuel pour le lancement
            this.lightEffects.push({
                x: projectileX,
                y: projectileY,
                radius: 40,
                color: this.projectileColor,
                alpha: 0.9,
                life: 15
            });
            
            // Son de projectile
            const projectileSound = new Audio();
            projectileSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAABjAJsAzQDNAM0AzQCbAGQA';
            projectileSound.volume = 0.4;
            projectileSound.play().catch(e => console.log("Audio error:", e));
            
            return true;
        }
        
        return false;
    }
    
    useDirectionalAttack(direction) {
        // Vérifier si le joueur a assez d'énergie et si le cooldown est terminé
        if (this.specialEnergy >= 20 && this.directionalAttackCooldown <= 0 && !this.isHit && !this.isAttacking && !this.isUsingSpecial) {
            // Consommer de l'énergie
            this.specialEnergy -= 20;
            
            // Mise à jour de la barre d'énergie
            const specialBar = this.isPlayer2 ? player2SpecialBar : player1SpecialBar;
            specialBar.style.width = `${this.specialEnergy}%`;
            
            // Activer le cooldown
            this.directionalAttackCooldown = 45; // ~0.75 seconde à 60 FPS
            
            // Activer l'attaque spéciale
            this.isUsingSpecial = true;
            this.specialTimer = 0;
            this.specialType = direction;
            
            // Effet de charge
            effectsManager.createEnergyChargeEffect(this);
            
            // Son de charge
            const chargeSound = new Audio();
            chargeSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAABMAFsAaABrAGsAagBiAFUA';
            chargeSound.volume = 0.4;
            chargeSound.play().catch(e => console.log("Audio error:", e));
            
            return true;
        }
        
        return false;
    }
    
    executeSpecialAttack() {
        // Cette fonction est appelée au milieu de l'animation d'attaque spéciale
        if (this.specialType) {
            const directionFactor = this.facingLeft ? -1 : 1;
            let x, y, width, height, damage = 25;
            
            switch(this.specialType) {
                case 'up':
                    x = this.x;
                    y = this.y - 60;
                    width = this.width;
                    height = 60;
                    effectsManager.createDirectionalAttackEffect(x, y, width, height, directionFactor, 'up');
                    break;
                case 'down':
                    x = this.x - this.width * 0.25;
                    y = this.y + this.height;
                    width = this.width * 1.5;
                    height = 30;
                    effectsManager.createDirectionalAttackEffect(x, y, width, height, directionFactor, 'down');
                    damage = 30; // Attaque au sol plus puissante
                    
                    // Effet de secousse d'écran pour l'attaque au sol
                    screenShake(8, 250);
                    break;
                case 'forward':
                    x = this.facingLeft ? this.x - 80 : this.x + this.width;
                    y = this.y + this.height * 0.15;
                    width = 80;
                    height = this.height * 0.7;
                    effectsManager.createDirectionalAttackEffect(x, y, width, height, directionFactor, 'forward');
                    damage = 20;
                    break;
                case 'backward':
                    x = this.facingLeft ? this.x + this.width : this.x - 60;
                    y = this.y;
                    width = 60;
                    height = this.height;
                    effectsManager.createDirectionalAttackEffect(x, y, width, height, directionFactor, 'backward');
                    damage = 15;
                    break;
            }
            
            // Vérifier si l'attaque touche l'adversaire
            const target = this.isPlayer2 ? player1 : player2;
            
            if (x < target.hitboxes.body.x + target.hitboxes.body.width &&
                x + width > target.hitboxes.body.x &&
                y < target.hitboxes.body.y + target.hitboxes.body.height &&
                y + height > target.hitboxes.body.y) {
                
                target.hit(damage, this);
            }
        }
    }
    
    hit(damage, attacker) {
        if (!this.isHit) {
            this.health -= damage;
            if (this.health < 0) this.health = 0;
            
            this.isHit = true;
            this.hitTimer = 0;
            this.isAttacking = false;
            this.isUsingSpecial = false;
            this.state = 'hit';
            
            // Direction de la réaction
            this.hitReactionX = this.facingLeft ? 3 : -3;
            
            // Créer un effet de particules
            const effectX = this.facingLeft ? this.x + this.width : this.x;
            const hitColor = this.isPlayer2 ? '#ff6347' : '#4169e1';
            effectsManager.createHitEffect(effectX, this.y + this.height / 2, hitColor);
            
            // Effet de secousse d'écran pour les gros coups
            if (damage > 7) {
                screenShake(5, 200);
            }
            
            // Son de coup
            const hitSound = new Audio();
            hitSound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQA' + 
                'AAAAAP//vwAAAP8=';
            hitSound.volume = 0.4;
            hitSound.play().catch(e => console.log("Audio error:", e));
            
            // Bonus d'énergie pour l'attaquant
            attacker.specialEnergy += damage * 0.5;
            if (attacker.specialEnergy > 100) attacker.specialEnergy = 100;
            
            // Mise à jour de la barre d'énergie
            const attackerSpecialBar = attacker.isPlayer2 ? player2SpecialBar : player1SpecialBar;
            attackerSpecialBar.style.width = `${attacker.specialEnergy}%`;
            
            // Mise à jour du compteur de combo
            const now = Date.now();
            if (now - attacker.lastHitTime < 1500) {
                attacker.comboCounter++;
                
                // Afficher le compteur de combo
                if (attacker.comboCounter > 1) {
                    showComboText(attacker.comboCounter, this.x, this.y);
                    effectsManager.createComboEffect(this.x + this.width / 2, this.y, attacker.comboCounter);
                }
            } else {
                attacker.comboCounter = 1;
            }
            attacker.lastHitTime = now;
            
            // Mise à jour de la barre de vie avec effet de flash
            const healthBar = this.isPlayer2 ? player2HealthBar : player1HealthBar;
            updateHealthBar(healthBar, this.health);
            
            // Flash d'alerte si santé faible
            if (this.health < 30) {
                healthBar.parentElement.animate([
                    { boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)' },
                    { boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)' },
                    { boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)' }
                ], {
                    duration: 1000,
                    iterations: 3
                });
            }
            
            // Vérification de K.O.
            if (this.health <= 0) {
                gameOver = true;
                showKO();
                setTimeout(endGame, 3000);
            }
        }
    }
    // Suite de la classe Sprite (méthode draw)
    draw() {
        ctx.save();
        
        // Ombre sous le personnage
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.shadowY,
            this.width / 2,
            10,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Effet de clignotement quand touché
        if (this.isHit && this.hitTimer % 4 < 2) {
            ctx.globalAlpha = 0.7;
        }
        
        // Effet de mise à l'échelle pendant l'animation
        let scaleX = 1;
        let scaleY = 1;
        let offsetY = 0;
        
        if (this.state === 'idle') {
            // Légère oscillation en position idle
            offsetY = Math.sin(Date.now() / 150) * 2;
        } else if (this.state === 'attack') {
            // Effet de dynamisme pendant l'attaque
            if (this.attackTimer < 10) {
                scaleX = 1 + (this.attackTimer / 50);
            }
        } else if (this.state === 'hit') {
            // Effet d'impact
            scaleX = 0.9 + Math.sin(this.hitTimer / 2) * 0.1;
        } else if (this.state === 'special') {
            // Effet pour attaque spéciale
            if (this.specialTimer < 15) {
                // Phase de charge
                scaleX = 0.9 + Math.sin(this.specialTimer / 3) * 0.1;
                scaleY = 0.9 + Math.sin(this.specialTimer / 3) * 0.1;
            } else {
                // Phase d'attaque
                scaleX = 1.1;
                scaleY = 1.1;
            }
        }
        
        // Application des transformations
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        
        // Dessiner les effets de lumière derrière le personnage
        for (const effect of this.lightEffects) {
            const rgb = hexToRgb(effect.color);
            
            const gradient = ctx.createRadialGradient(
                effect.x, effect.y, 0,
                effect.x, effect.y, effect.radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${effect.alpha})`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${effect.alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Effet spécial pendant la charge d'une attaque spéciale
        if (this.isUsingSpecial && this.specialTimer < 15) {
            const chargeIntensity = this.specialTimer / 15;
            const rgb = hexToRgb(this.projectileColor);
            
            // Aura autour du personnage
            const auraGradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, 0,
                this.x + this.width / 2, this.y + this.height / 2, this.width
            );
            auraGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${chargeIntensity * 0.5})`);
            auraGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${chargeIntensity * 0.3})`);
            auraGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
            ctx.fill();
            
            // Particules d'énergie convergeant vers le personnage
            if (this.specialTimer % 3 === 0) {
                const angle = Math.random() * Math.PI * 2;
                const distance = this.width + Math.random() * 50;
                const particleX = this.x + this.width / 2 + Math.cos(angle) * distance;
                const particleY = this.y + this.height / 2 + Math.sin(angle) * distance;
                
                effectsManager.particles.push({
                    x: particleX,
                    y: particleY,
                    vx: (this.x + this.width / 2 - particleX) * 0.1,
                    vy: (this.y + this.height / 2 - particleY) * 0.1,
                    radius: Math.random() * 3 + 1,
                    color: this.projectileColor,
                    alpha: 0.8,
                    life: 15
                });
            }
        }
        
        // Corps du personnage
        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(this.x, this.y + offsetY, this.width, this.height - offsetY);
        
        // Tête
        ctx.fillStyle = this.headColor;
        const headSize = 30;
        const headX = this.x + (this.width - headSize) / 2;
        const headY = this.y - headSize + 10 + offsetY;
        
        // Dessiner la tête avec une forme arrondie
        ctx.beginPath();
        ctx.arc(
            headX + headSize / 2,
            headY + headSize / 2,
            headSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Yeux
        ctx.fillStyle = '#000';
        const eyeSize = 5;
        const eyeY = headY + headSize / 2;
        const eyeOffset = this.facingLeft ? -7 : 7;
        
        // Yeux différents selon l'état
        if (this.isUsingSpecial) {
            // Yeux brillants pendant l'attaque spéciale
            ctx.fillStyle = this.projectileColor;
            ctx.beginPath();
            ctx.arc(
                headX + headSize / 2 - eyeOffset,
                eyeY - 2,
                eyeSize * 0.8,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(
                headX + headSize / 2 + eyeOffset,
                eyeY - 2,
                eyeSize * 0.8,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Éclat autour des yeux
            ctx.strokeStyle = this.projectileColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(
                headX + headSize / 2 - eyeOffset,
                eyeY - 2,
                eyeSize * 1.5,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(
                headX + headSize / 2 + eyeOffset,
                eyeY - 2,
                eyeSize * 1.5,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        } else {
            // Yeux normaux
            ctx.fillRect(headX + headSize / 2 - eyeSize / 2 - eyeOffset, eyeY - 2, eyeSize, eyeSize);
            ctx.fillRect(headX + headSize / 2 - eyeSize / 2 + eyeOffset, eyeY - 2, eyeSize, eyeSize);
        }
        
        // Sourcils (en colère quand attaque/hit)
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        if (this.isAttacking || this.isHit || this.isUsingSpecial) {
            // Sourcils en colère
            ctx.beginPath();
            ctx.moveTo(headX + headSize / 2 - 10 - eyeOffset, eyeY - 8);
            ctx.lineTo(headX + headSize / 2 - eyeOffset, eyeY - 6);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(headX + headSize / 2 + 10 + eyeOffset, eyeY - 8);
            ctx.lineTo(headX + headSize / 2 + eyeOffset, eyeY - 6);
            ctx.stroke();
        } else {
            // Sourcils normaux
            ctx.beginPath();
            ctx.moveTo(headX + headSize / 2 - 10 - eyeOffset, eyeY - 7);
            ctx.lineTo(headX + headSize / 2 - eyeOffset, eyeY - 7);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(headX + headSize / 2 + 10 + eyeOffset, eyeY - 7);
            ctx.lineTo(headX + headSize / 2 + eyeOffset, eyeY - 7);
            ctx.stroke();
        }
        // Suite de la méthode draw de la classe Sprite
        // Bouche
        if (this.isAttacking || this.isUsingSpecial) {
            // Bouche ouverte pour l'attaque
            ctx.beginPath();
            ctx.arc(
                headX + headSize / 2,
                eyeY + 8,
                3,
                0,
                Math.PI,
                false
            );
            ctx.fill();
        } else if (this.isHit) {
            // Expression de douleur
            ctx.beginPath();
            ctx.arc(
                headX + headSize / 2,
                eyeY + 8,
                3,
                0,
                Math.PI,
                true
            );
            ctx.fill();
        } else {
            // Bouche normale
            ctx.beginPath();
            ctx.moveTo(headX + headSize / 2 - 5, eyeY + 8);
            ctx.lineTo(headX + headSize / 2 + 5, eyeY + 8);
            ctx.stroke();
        }
        
        // Bandeau (Ryu bleu, Ken rouge)
        ctx.fillStyle = this.bandanaColor;
        const bandanaY = headY + 10;
        // Dessiner le bandeau avec un effet de 3D
        ctx.fillRect(headX - 5, bandanaY, headSize + 10, 8);
        
        // Ombrage sur le bandeau
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(headX - 5, bandanaY + 4, headSize + 10, 4);
        
        // Petits plis sur le bandeau
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX, bandanaY + 2);
        ctx.lineTo(headX + 5, bandanaY + 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(headX + headSize - 5, bandanaY + 2);
        ctx.lineTo(headX + headSize, bandanaY + 2);
        ctx.stroke();
        
        // Parties flottantes du bandeau derrière la tête
        ctx.fillStyle = this.bandanaColor;
        const bandanaEndLength = 20;
        const bandanaEndY = bandanaY + 4;
        const waveOffset = Math.sin(Date.now() / 200) * 3;
        
        if (this.facingLeft) {
            ctx.fillRect(headX - 15, bandanaEndY, 10, bandanaEndLength);
            // Petite queue qui flotte
            ctx.beginPath();
            ctx.moveTo(headX - 15, bandanaEndY + bandanaEndLength);
            ctx.lineTo(headX - 10, bandanaEndY + bandanaEndLength + waveOffset);
            ctx.lineTo(headX - 5, bandanaEndY + bandanaEndLength);
            ctx.fill();
        } else {
            ctx.fillRect(headX + headSize + 5, bandanaEndY, 10, bandanaEndLength);
            // Petite queue qui flotte
            ctx.beginPath();
            ctx.moveTo(headX + headSize + 5, bandanaEndY + bandanaEndLength);
            ctx.lineTo(headX + headSize + 10, bandanaEndY + bandanaEndLength + waveOffset);
            ctx.lineTo(headX + headSize + 15, bandanaEndY + bandanaEndLength);
            ctx.fill();
        }
        
        // Bras et jambes avec animation selon l'état
        const limbWidth = 15;
        let limbOffset = 0;
        
        if (this.state === 'idle') {
            limbOffset = Math.sin(Date.now() / 200) * 2;
        } else if (this.state === 'walk') {
            limbOffset = Math.sin(Date.now() / 100) * 8;
        } else if (this.state === 'special' && this.specialTimer < 15) {
            // Animation de préparation d'attaque spéciale
            limbOffset = Math.sin(Date.now() / 50) * 5;
        }
        
        // Jambes
        ctx.fillStyle = this.clothesColor;
        if (!this.isCrouching) {
            // Jambe gauche
            ctx.fillRect(
                this.x + this.width / 3 - limbWidth / 2 - limbOffset, 
                this.y + this.height / 2, 
                limbWidth, 
                this.height / 2
            );
            
            // Reflet sur la jambe
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(
                this.x + this.width / 3 - limbWidth / 2 - limbOffset, 
                this.y + this.height / 2, 
                limbWidth / 3, 
                this.height / 2
            );
            
            // Jambe droite
            ctx.fillStyle = this.clothesColor;
            ctx.fillRect(
                this.x + this.width * 2/3 - limbWidth / 2 + limbOffset, 
                this.y + this.height / 2, 
                limbWidth, 
                this.height / 2
            );
            
            // Reflet sur la jambe
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(
                this.x + this.width * 2/3 - limbWidth / 2 + limbOffset, 
                this.y + this.height / 2, 
                limbWidth / 3, 
                this.height / 2
            );
        } else {
            // Jambes quand accroupi - plus larges
            ctx.fillStyle = this.clothesColor;
            ctx.fillRect(
                this.x + 5, 
                this.y + this.height / 2, 
                this.width - 10, 
                this.height / 2
            );
            
            // Reflet
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(
                this.x + 5, 
                this.y + this.height / 2, 
                (this.width - 10) / 4, 
                this.height / 2
            );
        }
        
        // Bras
        ctx.fillStyle = this.bodyColor;
        
        if (this.isUsingSpecial && this.specialTimer >= 15) {
            // Animation d'attaque spéciale
            switch(this.specialType) {
                case 'up':
                    // Bras levés pour l'attaque vers le haut
                    ctx.fillRect(
                        this.x + this.width / 3 - limbWidth / 2,
                        this.y - limbWidth,
                        limbWidth,
                        this.height / 3
                    );
                    ctx.fillRect(
                        this.x + this.width * 2/3 - limbWidth / 2,
                        this.y - limbWidth,
                        limbWidth,
                        this.height / 3
                    );
                    break;
                case 'down':
                    // Poings au sol pour l'attaque vers le bas
                    ctx.fillRect(
                        this.x,
                        this.y + this.height - limbWidth,
                        limbWidth,
                        limbWidth * 1.5
                    );
                    ctx.fillRect(
                        this.x + this.width - limbWidth,
                        this.y + this.height - limbWidth,
                        limbWidth,
                        limbWidth * 1.5
                    );
                    break;
                case 'forward':
                    // Bras tendu pour l'attaque vers l'avant
                    const forwardX = this.facingLeft ? 
                        this.x - limbWidth * 3 : 
                        this.x + this.width;
                    
                    ctx.fillRect(
                        forwardX,
                        this.y + this.height / 3,
                        this.facingLeft ? limbWidth * 3 : limbWidth * 3,
                        limbWidth
                    );
                    break;
                case 'backward':
                    // Bras replié pour l'attaque vers l'arrière
                    const backwardX = this.facingLeft ? 
                        this.x + this.width - limbWidth : 
                        this.x - limbWidth;
                    
                    ctx.fillRect(
                        backwardX,
                        this.y + this.height / 4,
                        limbWidth,
                        limbWidth * 2
                    );
                    break;
            }
        } else if (!this.isAttacking) {
            // Bras normal avec balancement
            const armPosX = this.facingLeft ? 
                this.x - limbWidth + 5 : 
                this.x + this.width - 5;
            
            ctx.fillRect(
                armPosX, 
                this.y + this.height / 4 + limbOffset, 
                limbWidth, 
                limbWidth * 2
            );
            
            // Reflet sur le bras
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(
                armPosX, 
                this.y + this.height / 4 + limbOffset, 
                limbWidth / 3, 
                limbWidth * 2
            );
        } else {
            // Animation d'attaque avec trajectoire d'attaque
            const attackExtend = this.attackType === 'punch' ? 30 : 40;
            const attackHeight = this.attackType === 'punch' ? limbWidth : limbWidth * 2;
            const attackY = this.attackType === 'punch' ? 
                          this.y + this.height / 3 : 
                          this.y + this.height / 2;
            const attackX = this.facingLeft ? 
                          this.x - attackExtend : 
                          this.x + this.width;
            
            ctx.fillStyle = this.bodyColor;
            ctx.fillRect(
                attackX, 
                attackY, 
                attackExtend, 
                attackHeight
            );
            
            // Reflet sur le bras en attaque
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(
                attackX, 
                attackY, 
                attackExtend / 4, 
                attackHeight
            );
            
            // Effet de mouvement pour l'attaque
            if (this.attackTimer > 5 && this.attackTimer < 15) {
                // Trajectoire de l'attaque avec des traits semi-transparents
                ctx.strokeStyle = this.attackType === 'punch' ? 
                               'rgba(255, 255, 0, 0.6)' : 
                               'rgba(255, 0, 0, 0.6)';
                ctx.lineWidth = 2;
                
                for (let i = 0; i < 3; i++) {
                    const offsetX = this.facingLeft ? -(i * 7) : i * 7;
                    ctx.globalAlpha = 0.7 - (i * 0.2);
                    
                    ctx.beginPath();
                    ctx.moveTo(
                        attackX + (this.facingLeft ? attackExtend : 0) + offsetX, 
                        attackY
                    );
                    ctx.lineTo(
                        attackX + (this.facingLeft ? attackExtend : 0) + offsetX, 
                        attackY + attackHeight
                    );
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            }
            
            // Si c'est un coup de pied, dessiner la jambe d'attaque
            if (this.attackType === 'kick') {
                // Trajectoire semi-transparente pour le coup de pied
                const direction = this.facingLeft ? -1 : 1;
                effectsManager.createKickEffect(
                    attackX + (this.facingLeft ? 0 : attackExtend), 
                    attackY + attackHeight / 2, 
                    direction
                );
            }
        }
        // Fin de la méthode draw de la classe Sprite
        // Effet visuel pour l'énergie spéciale
        if (this.specialEnergy >= 100) {
            // Aura complète quand l'énergie est pleine
            ctx.save();
            const auraGradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, 0,
                this.x + this.width / 2, this.y + this.height / 2, this.width
            );
            
            const rgb = hexToRgb(this.projectileColor);
            const pulseIntensity = (Math.sin(Date.now() / 500) + 1) / 2; // 0 à 1
            
            auraGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 + pulseIntensity * 0.1})`);
            auraGradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.05 + pulseIntensity * 0.05})`);
            auraGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Détails du visage qui se tournent selon l'orientation
        if (this.facingLeft) {
            // Visage tourné vers la gauche...
        } else {
            // Visage tourné vers la droite...
        }
        
        // Affichage des hitboxes en mode debug
        const showHitboxes = false;
        if (showHitboxes) {
            // Hitbox du corps
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.hitboxes.body.x, 
                this.hitboxes.body.y, 
                this.hitboxes.body.width, 
                this.hitboxes.body.height
            );
            
            // Hitbox d'attaque
            if (this.hitboxes.attack.active) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.strokeRect(
                    this.hitboxes.attack.x, 
                    this.hitboxes.attack.y, 
                    this.hitboxes.attack.width, 
                    this.hitboxes.attack.height
                );
            }
        }
        
        ctx.restore();
    }
} // Fin de la classe Sprite