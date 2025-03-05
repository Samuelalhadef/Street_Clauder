// Classe pour les projectiles
class Projectile {
    constructor(x, y, width, height, direction, speed, owner, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.direction = direction; // 1 pour droite, -1 pour gauche
        this.speed = speed;
        this.owner = owner; // référence au joueur qui a lancé le projectile
        this.active = true;
        this.damage = 15;
        this.color = color;
        this.frame = 0;
        this.frameCount = 0;
        this.maxFrames = 4;
        this.hitbox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        // Effet de particule pour le projectile
        this.particles = [];
        this.trailTimer = 0;
    }
    
    update() {
        // Déplacement du projectile
        this.x += this.direction * this.speed;
        
        // Mise à jour de la hitbox
        this.hitbox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        // Animation
        this.frameCount++;
        if (this.frameCount >= 5) {
            this.frame = (this.frame + 1) % this.maxFrames;
            this.frameCount = 0;
        }
        
        // Création de particules de traînée
        this.trailTimer++;
        if (this.trailTimer >= 3) {
            this.trailTimer = 0;
            
            // Ajouter une particule de traînée
            for (let i = 0; i < 2; i++) {
                this.particles.push({
                    x: this.x + (this.direction < 0 ? this.width : 0),
                    y: this.y + this.height / 2 + (Math.random() - 0.5) * this.height * 0.7,
                    size: Math.random() * 5 + 3,
                    life: 20,
                    alpha: 0.7,
                    color: this.color
                });
            }
        }
        
        // Mise à jour des particules
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life--;
            p.alpha -= 0.035;
            p.x -= this.direction * (this.speed * 0.3);
            
            if (p.life <= 0 || p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Désactiver si le projectile sort de l'écran
        if (this.x < -this.width || this.x > canvas.width) {
            this.active = false;
        }
    }
    
    draw() {
        ctx.save();
        
        // Dessiner les particules de traînée
        for (const p of this.particles) {
            const rgb = hexToRgb(p.color);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dessiner le projectile
        const projectileGradient = ctx.createRadialGradient(
            this.x + this.width / 2,
            this.y + this.height / 2,
            0,
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2
        );
        
        const rgb = hexToRgb(this.color);
        
        projectileGradient.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
        projectileGradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
        projectileGradient.addColorStop(1, `rgba(${rgb.r * 0.5}, ${rgb.g * 0.5}, ${rgb.b * 0.5}, 0.1)`);
        
        ctx.fillStyle = projectileGradient;
        
        // Forme du projectile (plus dynamique qu'un simple rectangle)
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            this.height / 2,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Effet de pulsation
        const pulseSize = Math.sin(Date.now() / 100) * 5;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2 + pulseSize,
            this.height / 2 + pulseSize,
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        // Effet de lumière au centre
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 6,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    checkCollision(target) {
        // Vérifier si le projectile touche un joueur
        if (this.hitbox.x < target.hitboxes.body.x + target.hitboxes.body.width &&
            this.hitbox.x + this.hitbox.width > target.hitboxes.body.x &&
            this.hitbox.y < target.hitboxes.body.y + target.hitboxes.body.height &&
            this.hitbox.y + this.hitbox.height > target.hitboxes.body.y) {
            
            return true;
        }
        return false;
    }
}