# 🥋 Street Fighter JS 🥊

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecmascript6.com/)
[![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS-3-blue.svg)](https://www.w3.org/TR/CSS/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 📜 Description

Street Fighter JS est une réimplémentation moderne et élégante du jeu de combat classique, entièrement développée en JavaScript vanilla. Ce projet recrée l'essence des jeux de combat en arcade des années 90 avec une touche moderne, offrant des animations fluides, des effets visuels dynamiques et un gameplay captivant.

Les joueurs peuvent s'affronter en local sur le même clavier, avec une variété d'attaques spéciales, de combos et de mouvements stratégiques. Le jeu propose une expérience complète avec des barres de vie, un système d'énergie pour les attaques spéciales, et un chronomètre pour limiter la durée des combats.

## ✨ Fonctionnalités

- 🎮 Mode deux joueurs en local
- 🔥 Attaques spéciales et projectiles énergétiques
- ⚡ Système de combos et contre-attaques
- 🌈 Effets visuels avancés (particules, secousses d'écran, lumières dynamiques)
- 📱 Contrôles tactiles pour les appareils mobiles
- ⏱️ Chronomètre et système de K.O.
- 🏆 Écran de victoire et possibilité de rejouer
- 🎭 Personnages avec animations distinctes (idle, marche, attaque, saut, accroupissement)
- 🖼️ Arrière-plan dynamique avec parallaxe
- 🔋 Système d'énergie pour les attaques spéciales

## 🧩 Structure du Projet

Le code est organisé en modules fonctionnels pour une meilleure maintenabilité :

```
street-fighter-js/
│
├── index.html              # Structure principale du jeu
├── styles.css              # Styles visuels (divisé en 3 parties)
├── utils.js                # Fonctions utilitaires et variables globales
├── projectile.js           # Gestion des projectiles
├── effects.js              # Effets visuels (particules, etc.)
├── sprite.js               # Classe des personnages jouables
├── background.js           # Décors et arrière-plans
├── game.js                 # Logique principale du jeu
└── controls.js             # Gestion des entrées clavier et tactiles
```

## 🛠️ Technologies Utilisées

- **JavaScript ES6** - Pour la logique de jeu et l'interactivité
- **HTML5 Canvas** - Pour le rendu du jeu en temps réel
- **CSS3** - Pour les styles, animations et l'interface utilisateur
- **LocalStorage API** (prévu) - Pour sauvegarder les meilleurs scores

## 🚀 Installation et Démarrage

1. Clonez ce dépôt:
   ```bash
   git clone https://github.com/votreusername/street-fighter-js.git
   ```

2. Naviguez vers le dossier du projet:
   ```bash
   cd street-fighter-js
   ```

3. Ouvrez `index.html` dans votre navigateur préféré:
   ```bash
   # Sur Linux/macOS
   open index.html
   
   # Sur Windows
   start index.html
   ```

4. Aucun serveur n'est nécessaire ! Le jeu fonctionne directement dans le navigateur.

## 🎮 Contrôles du Jeu

### Joueur 1 (Ryu)
| Touche | Action |
|--------|--------|
| A / D  | Se déplacer à gauche / droite |
| W      | Sauter |
| S      | S'accroupir |
| Q      | Coup de poing |
| E      | Coup de pied |
| R      | Projectile d'énergie (Hadoken) |
| F + Direction | Attaque spéciale directionnelle |

### Joueur 2 (Ken)
| Touche | Action |
|--------|--------|
| ← / →  | Se déplacer à gauche / droite |
| ↑      | Sauter |
| ↓      | S'accroupir |
| M      | Coup de poing |
| K      | Coup de pied |
| L      | Projectile d'énergie (Hadoken) |
| P + Direction | Attaque spéciale directionnelle |

## 🔄 Système de Combat

Le jeu intègre un système de combat profond avec plusieurs mécaniques :

- **Combos** : Enchaînez plusieurs coups rapidement pour déclencher des compteurs de combo et infliger plus de dégâts.
- **Jauge d'énergie spéciale** : Se remplit en attaquant et en recevant des dégâts. Utilisez-la pour déclencher des attaques spéciales.
- **Attaques directionnelles** : Quatre types d'attaques spéciales selon la direction (haut, bas, avant, arrière).
- **Contre-attaques** : Timing précis pour contrer les attaques adverses.
- **Dégâts variables** : Différentes attaques infligent différents niveaux de dégâts.

## 🔮 Roadmap et Développements Futurs

- [ ] Ajout de nouveaux personnages avec des mouvements uniques
- [ ] Mode histoire avec progression
- [ ] Mode en ligne avec matchmaking
- [ ] Personnalisation des couleurs des personnages
- [ ] Nouveaux stages avec éléments interactifs
- [ ] Mode entraînement avec affichage des hitboxes
- [ ] Effets sonores améliorés et musique de fond
- [ ] Système de classement des joueurs

## 🙏 Remerciements

Ce projet est un hommage aux jeux de combat classiques qui ont marqué l'histoire du jeu vidéo. Un grand merci à la communauté des développeurs de jeux indépendants pour l'inspiration et le partage de connaissances.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

Développé avec ❤️ et JavaScript. Prêt à combattre ?

```
  _____  _                _     ______  _         _      _              _  _____  
 / ____|| |              | |   |  ____|| |       | |    | |            | |/ ____|
| (___  | |_  _ __  ___  _| |_  | |__   | |  __ _| |__  | |_ ___ _ __  | | (___  
 \___ \ | __|| '__|/ _ \|_   _| |  __|  | | / _` | '_ \ | __/ _ \ '__| | |\___ \ 
 ____) || |_ | |  |  __/  |_|   | |     | || (_| | | | || ||  __/ |    | |____) |
|_____/  \__||_|   \___|        |_|     |_| \__, |_| |_| \__\___|_|    |_|_____/ 
                                              __/ |                               
                                             |___/                                
```
