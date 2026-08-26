// Minimal Phaser 3 prototype for 219-Empire (mobile-friendly)
// - Responsive canvas (Scale.FIT)
// - Persistent coins and building ownership (localStorage)
// - Touch-friendly UI

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let coins = 0;
let coinText;
let lighthouseOwned = false;

function preload() {
  this.load.image('map', 'assets/map-placeholder.png');
  this.load.image('pin', 'assets/pin.png');
  this.load.image('town', 'assets/town.png');
  this.load.image('lighthouse', 'assets/lighthouse.png');
}

function create() {
  const scene = this;

  // Load persisted state
  coins = parseInt(localStorage.getItem('219_coins')) || 0;
  lighthouseOwned = localStorage.getItem('219_lighthouse') === 'true';

  this.add.image(400, 300, 'map').setDisplaySize(800, 600);

  // Michigan City node
  const town = this.add.image(300, 320, 'town').setScale(0.8);
  town.setInteractive({ useHandCursor: true });
  town.on('pointerdown', () => {
    scene.tweens.add({ targets: town, scale: 1.0, duration: 150, yoyo: true });
  });

  // Pin and label
  this.add.image(300, 260, 'pin').setScale(0.5);
  this.add.text(315, 270, 'Michigan City', { fontSize: '16px', color: '#000' });

  coinText = document.getElementById('coin-count');
  coinText.innerText = coins;

  const spinBtn = document.getElementById('spin-btn');
  const buyBtn = document.getElementById('buy-btn');

  // Initialize buy button state if already owned
  if (lighthouseOwned) {
    buyBtn.innerText = 'Lighthouse Owned';
    buyBtn.disabled = true;
  }

  spinBtn.addEventListener('click', () => {
    // Mobile-friendly spin (larger reward variance possible later)
    const gained = Math.floor(Math.random() * 50) + 10; // 10-59 coins
    coins += gained;
    coinText.innerText = coins;
    saveState();
    // show floating text inside Phaser scene
    const fx = scene.add.text(scene.cameras.main.centerX, 100, `+${gained} coins`, { fontSize: '28px', color: '#fff' }).setOrigin(0.5);
    scene.tweens.add({ targets: fx, y: 60, alpha: 0, duration: 900, onComplete: () => fx.destroy() });
  });

  buyBtn.addEventListener('click', () => {
    const cost = 100;
    if (coins >= cost && !lighthouseOwned) {
      coins -= cost;
      coinText.innerText = coins;
      lighthouseOwned = true;
      saveState();
      this.add.image(360, 300, 'lighthouse').setScale(0.6);
      buyBtn.innerText = 'Lighthouse Owned';
      buyBtn.disabled = true;
    } else {
      // small flash feedback
      const old = buyBtn;
      old.style.background = '#ff6b6b';
      setTimeout(() => old.style.background = '#f5c518', 300);
    }
  });

  // If lighthouse was already owned, show it
  if (lighthouseOwned) {
    this.add.image(360, 300, 'lighthouse').setScale(0.6);
  }

  // Handle window resize for high-DPI devices
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
}

function update() {}

function saveState() {
  try {
    localStorage.setItem('219_coins', String(coins));
    localStorage.setItem('219_lighthouse', lighthouseOwned ? 'true' : 'false');
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}
