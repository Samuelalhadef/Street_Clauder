// Classe pour le décor
class Background {
    constructor() {
        // Définition des couches avec parallaxe
        this.layers = [
            { // Ciel
                color: '#87CEEB',
                y: 0,
                height: canvas.height * 0.5,
                speed: 0.1
            },
            { // Montagnes lointaines
                color: '#9e9e9e',
                y: canvas.height * 0.35,
                height: canvas.height * 0.15,
                speed: 0.2
            },
            { // Sol
                color: '#8B4513',
                y: canvas.height * 0.5,
                height: canvas.height * 0.05,
                speed: 0.5
            },
            { // Herbe
                color: '#228B22',
                y: canvas.height * 0.55,
                height: canvas.height * 0.45,
                speed: 0.5
            }
        ];
        
        // Éléments décoratifs
        this.decorations = [
            // Montagnes lointaines
            { type: 'farMountain', x: -50, y: canvas.height * 0.35, width: 300, height: 100, speedFactor: 0.2 },
            { type: 'farMountain', x: 200, y: canvas.height * 0.35, width: 250, height: 120, speedFactor: 0.2 },
            { type: 'farMountain', x: 450, y: canvas.height * 0.35, width: 200, height: 90, speedFactor: 0.2 },
            { type: 'farMountain', x: 650, y: canvas.height * 0.35, width: 300, height: 110, speedFactor: 0.2 },
            
            // Montagnes plus proches
            { type: 'mountain', x: -100, y: canvas.height * 0.5, width: 300, height: 180, speedFactor: 0.3 },
            { type: 'mountain', x: 250, y: canvas.height * 0.5, width: 350, height: 200, speedFactor: 0.3 },
            { type: 'mountain', x: 600, y: canvas.height * 0.5, width: 400, height: 220, speedFactor: 0.3 },
            
            // Nuages
            { type: 'cloud', x: 50, y: 50, width: 80, height: 40, speedFactor: 0.05, drift: 0.1 },
            { type: 'cloud', x: 200, y: 80, width: 100, height: 50, speedFactor: 0.07, drift: 0.15 },
            { type: 'cloud', x: 400, y: 60, width: 120, height: 45, speedFactor: 0.06, drift: 0.12 },
            { type: 'cloud', x: 600, y: 90, width: 90, height: 40, speedFactor: 0.04, drift: 0.08 },
            { type: 'cloud', x: 750, y: 40, width: 110, height: 55, speedFactor: 0.03, drift: 0.05 },
            
            // Arbres
            { type: 'tree', x: -30, y: canvas.height * 0.55, width: 60, height: 120, speedFactor: 0.5 },
            { type: 'tree', x: 100, y: canvas.height * 0.55, width: 50, height: 100, speedFactor: 0.5 },
            { type: 'tree', x: 700, y: canvas.height * 0.55, width: 70, height: 130, speedFactor: 0.5 },
            { type: 'tree', x: 820, y: canvas.height * 0.55, width: 60, height: 110, speedFactor: 0.5 },
            
            // Buissons
            { type: 'bush', x: 50, y: canvas.height * 0.55, width: 30, height: 20, speedFactor: 0.5 },
            { type: 'bush', x: 200, y: canvas.height * 0.55, width: 40, height: 25, speedFactor: 0.5 },
            { type: 'bush', x: 500, y: canvas.height * 0.55, width: 35, height: 22, speedFactor: 0.5 },
            { type: 'bush', x: 650, y: canvas.height * 0.55, width: 45, height: 28, speedFactor: 0.5 }
        ];
        
        // Effet de parallaxe
        this.offset = 0;
        
        // Décoration de l'arène de combat
        this.arenaDecorations = [
            { type: 'torch', x: 100, y: canvas.height * 0.48, animationOffset: 0 },
            { type: 'torch', x: 700, y: canvas.height * 0.48, animationOffset: 0.5 },
            { type: 'banner', x: 400, y: 50, width: 40, height: 80, swingOffset: 0 },
            { type: 'lantern', x: 300, y: canvas.height * 0.48, animationOffset: 0.2 },
            { type: 'lantern', x: 500, y: canvas.height * 0.48, animationOffset: 0.7 }
        ];
        
        // Particules d'ambiance
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: Math.random() * -0.2 - 0.1,
                opacity: Math.random() * 0.7 + 0.3
            });
        }
        
        // Dégradé pour le ciel
        this.skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
        this.skyGradient.addColorStop(0, '#1e88e5');
        this.skyGradient.addColorStop(1, '#90caf9');
        
        // Temps pour les animations
        this.time = 0;
        
        // Ajout d'effets de lumière
        this.lightSpots = [
            { x: 150, y: canvas.height * 0.5, radius: 100, intensity: 0.3, color: '#ffcc00' },
            { x: 650, y: canvas.height * 0.5, radius: 100, intensity: 0.3, color: '#ffcc00' }
        ];
    }
    // Suite de la classe Background
    update() {
        // Mise à jour du temps pour les animations
        this.time += 0.016;
        
        // Animation des nuages et autres décorations
        this.decorations.forEach(dec => {
            if (dec.type === 'cloud') {
                dec.x += dec.drift;
                if (dec.x > canvas.width + 100) {
                    dec.x = -dec.width;
                }
            }
        });
        
        // Mise à jour des torches
        this.arenaDecorations.forEach(dec => {
            if (dec.type === 'torch' || dec.type === 'lantern') {
                dec.animationOffset = (dec.animationOffset + 0.05) % 1;
            } else if (dec.type === 'banner') {
                dec.swingOffset = Math.sin(this.time) * 5;
            }
        });
        
        // Mise à jour des particules
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Réinitialisation des particules sorties de l'écran
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
        });
        
        // Animation des spots lumineux
        this.lightSpots.forEach(spot => {
            spot.intensity = 0.3 + Math.sin(this.time * 2) * 0.1;
        });
    }
    
    draw() {
        // Dessiner le ciel avec dégradé
        ctx.fillStyle = this.skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);
        
        // Dessiner les couches de fond
        ctx.fillStyle = this.layers[2].color; // Sol
        ctx.fillRect(
            0, 
            this.layers[2].y, 
            canvas.width, 
            this.layers[2].height
        );
        
        ctx.fillStyle = this.layers[3].color; // Herbe
        ctx.fillRect(
            0, 
            this.layers[3].y, 
            canvas.width, 
            this.layers[3].height
        );
        
        // Dessiner les décorations avec parallaxe
        this.decorations.forEach(dec => {
            const offsetX = ((player1.x + player2.x) / 2 - canvas.width / 2) * dec.speedFactor;
            const drawX = dec.x - offsetX;
            
            if (dec.type === 'farMountain') {
                // Montagnes lointaines
                const mountainGradient = ctx.createLinearGradient(drawX, dec.y - dec.height, drawX, dec.y);
                mountainGradient.addColorStop(0, '#9e9e9e');
                mountainGradient.addColorStop(1, '#6d6d6d');
                
                ctx.fillStyle = mountainGradient;
                ctx.beginPath();
                ctx.moveTo(drawX, dec.y);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height);
                ctx.lineTo(drawX + dec.width, dec.y);
                ctx.closePath();
                ctx.fill();
                
                // Légère brume sur les montagnes lointaines
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(drawX, dec.y - dec.height * 0.3);
                ctx.lineTo(drawX + dec.width, dec.y - dec.height * 0.3);
                ctx.lineTo(drawX + dec.width, dec.y);
                ctx.lineTo(drawX, dec.y);
                ctx.closePath();
                ctx.fill();
            } else if (dec.type === 'mountain') {
                // Montagnes
                const mountainGradient = ctx.createLinearGradient(drawX, dec.y - dec.height, drawX, dec.y);
                mountainGradient.addColorStop(0, '#808080');
                mountainGradient.addColorStop(1, '#505050');
                
                ctx.fillStyle = mountainGradient;
                ctx.beginPath();
                ctx.moveTo(drawX, dec.y);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height);
                ctx.lineTo(drawX + dec.width, dec.y);
                ctx.closePath();
                ctx.fill();
                
                // Sommet enneigé
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.moveTo(drawX + dec.width * 0.3, dec.y - dec.height * 0.7);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height);
                ctx.lineTo(drawX + dec.width * 0.7, dec.y - dec.height * 0.7);
                ctx.closePath();
                ctx.fill();
                
                // Reflet sur la neige
                ctx.fillStyle = 'rgba(220, 220, 255, 0.5)';
                ctx.beginPath();
                ctx.moveTo(drawX + dec.width * 0.35, dec.y - dec.height * 0.85);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height);
                ctx.lineTo(drawX + dec.width * 0.55, dec.y - dec.height * 0.9);
                ctx.closePath();
                ctx.fill();
            } else if (dec.type === 'cloud') {
                // Nuage
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(drawX, dec.y, dec.height / 2, 0, Math.PI * 2);
                ctx.arc(drawX + dec.width / 3, dec.y - dec.height / 4, dec.height / 2.5, 0, Math.PI * 2);
                ctx.arc(drawX + dec.width / 1.5, dec.y, dec.height / 2, 0, Math.PI * 2);
                ctx.arc(drawX + dec.width, dec.y - dec.height / 4, dec.height / 2.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Légère ombre sous le nuage
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.beginPath();
                ctx.ellipse(
                    drawX + dec.width / 2,
                    dec.y + dec.height / 2,
                    dec.width / 2,
                    dec.height / 4,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            // Suite de la méthode draw de la classe Background
            else if (dec.type === 'tree') {
                // Tronc
                const trunkGradient = ctx.createLinearGradient(
                    drawX + dec.width / 3, dec.y,
                    drawX + dec.width * 2/3, dec.y
                );
                trunkGradient.addColorStop(0, '#8B4513');
                trunkGradient.addColorStop(0.5, '#A0522D');
                trunkGradient.addColorStop(1, '#8B4513');
                
                ctx.fillStyle = trunkGradient;
                ctx.fillRect(drawX + dec.width / 3, dec.y, dec.width / 3, dec.height / 2);
                
                // Feuillage
                const leafGradient = ctx.createLinearGradient(
                    drawX, dec.y - dec.height / 2,
                    drawX + dec.width, dec.y - dec.height / 2
                );
                leafGradient.addColorStop(0, '#006400');
                leafGradient.addColorStop(0.5, '#008000');
                leafGradient.addColorStop(1, '#006400');
                
                ctx.fillStyle = leafGradient;
                
                // Premier étage du feuillage
                ctx.beginPath();
                ctx.moveTo(drawX, dec.y);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height / 2);
                ctx.lineTo(drawX + dec.width, dec.y);
                ctx.closePath();
                ctx.fill();
                
                // Deuxième étage
                ctx.beginPath();
                ctx.moveTo(drawX + dec.width * 0.1, dec.y - dec.height / 4);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height * 3/4);
                ctx.lineTo(drawX + dec.width * 0.9, dec.y - dec.height / 4);
                ctx.closePath();
                ctx.fill();
                
                // Reflets sur le feuillage
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.moveTo(drawX + dec.width * 0.3, dec.y - dec.height / 3);
                ctx.lineTo(drawX + dec.width / 2, dec.y - dec.height / 2);
                ctx.lineTo(drawX + dec.width * 0.6, dec.y - dec.height / 3);
                ctx.closePath();
                ctx.fill();
            } else if (dec.type === 'bush') {
                // Buisson
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.arc(drawX, dec.y, dec.height, 0, Math.PI * 2);
                ctx.arc(drawX + dec.width / 2, dec.y - dec.height / 2, dec.height, 0, Math.PI * 2);
                ctx.arc(drawX + dec.width, dec.y, dec.height, 0, Math.PI * 2);
                ctx.fill();
                
                // Reflets sur le buisson
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(drawX + dec.width * 0.3, dec.y - dec.height * 0.3, dec.height * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Dessiner les spots de lumière au sol
        this.lightSpots.forEach(spot => {
            const gradient = ctx.createRadialGradient(
                spot.x, spot.y, 0,
                spot.x, spot.y, spot.radius
            );
            const rgb = hexToRgb(spot.color);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${spot.intensity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(
                spot.x,
                spot.y,
                spot.radius,
                spot.radius / 2,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        // Dessiner les décorations de l'arène
        this.arenaDecorations.forEach(dec => {
            if (dec.type === 'torch') {
                // Support de la torche
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(dec.x - 5, dec.y - 30, 10, 30);
                
                // Base de la torche
                ctx.fillStyle = '#A0522D';
                ctx.beginPath();
                ctx.arc(dec.x, dec.y - 30, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Flamme de la torche
                const flameHeight = 20 + Math.sin(this.time * 10 + dec.animationOffset * Math.PI * 2) * 5;
                
                // Gradient pour la flamme
                const flameGradient = ctx.createRadialGradient(
                    dec.x, dec.y - 35,
                    0,
                    dec.x, dec.y - 35,
                    flameHeight
                );
                flameGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                flameGradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.8)');
                flameGradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.8)');
                flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                
                ctx.fillStyle = flameGradient;
                ctx.beginPath();
                ctx.ellipse(
                    dec.x,
                    dec.y - 40,
                    10,
                    flameHeight,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Lumière ambiante de la torche
                const glowGradient = ctx.createRadialGradient(
                    dec.x, dec.y - 35,
                    0,
                    dec.x, dec.y - 35,
                    50
                );
                glowGradient.addColorStop(0, 'rgba(255, 150, 50, 0.3)');
                glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
                
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(dec.x, dec.y - 35, 50, 0, Math.PI * 2);
                ctx.fill();
            }
            // Fin de la méthode draw de la classe Background
            else if (dec.type === 'lantern') {
                // Poteau de support
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(dec.x - 3, dec.y - 60, 6, 60);
                
                // Corps de la lanterne
                ctx.fillStyle = '#4d3900';
                ctx.fillRect(dec.x - 10, dec.y - 80, 20, 25);
                
                // Détails métalliques
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(dec.x - 12, dec.y - 82, 24, 4);
                ctx.fillRect(dec.x - 12, dec.y - 58, 24, 3);
                
                // Vitre de la lanterne
                ctx.fillStyle = 'rgba(255, 240, 150, 0.3)';
                ctx.fillRect(dec.x - 8, dec.y - 77, 16, 17);
                
                // Lumière oscillante
                const glowIntensity = 0.5 + Math.sin(this.time * 8 + dec.animationOffset * Math.PI * 2) * 0.2;
                const lanternGlow = ctx.createRadialGradient(
                    dec.x, dec.y - 70,
                    0,
                    dec.x, dec.y - 70,
                    30
                );
                lanternGlow.addColorStop(0, `rgba(255, 240, 150, ${glowIntensity})`);
                lanternGlow.addColorStop(1, 'rgba(255, 240, 150, 0)');
                
                ctx.fillStyle = lanternGlow;
                ctx.beginPath();
                ctx.arc(dec.x, dec.y - 70, 30, 0, Math.PI * 2);
                ctx.fill();
            } else if (dec.type === 'banner') {
                // Mât de la bannière
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(dec.x - 2, 0, 4, dec.y + dec.height);
                
                // Bannière avec oscillation
                ctx.save();
                ctx.translate(dec.x, dec.y);
                ctx.rotate(Math.sin(this.time) * 0.05);
                
                // Dessiner la bannière
                const bannerGradient = ctx.createLinearGradient(0, 0, 0, dec.height);
                bannerGradient.addColorStop(0, '#ff0000');
                bannerGradient.addColorStop(1, '#990000');
                
                ctx.fillStyle = bannerGradient;
                ctx.fillRect(0, 0, dec.width, dec.height);
                
                // Symbole sur la bannière
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(dec.width / 2, dec.height / 2, dec.width / 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dec.width / 4, dec.height / 4);
                ctx.lineTo(dec.width * 3/4, dec.height * 3/4);
                ctx.moveTo(dec.width * 3/4, dec.height / 4);
                ctx.lineTo(dec.width / 4, dec.height * 3/4);
                ctx.stroke();
                
                ctx.restore();
            }
        });
        
        // Dessiner les particules d'ambiance
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.particles.forEach(p => {
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
} // Fin de la classe Background