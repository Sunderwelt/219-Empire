// Minimal Phaser 3 prototype for 219-Empire
// - Michigan City node on map
// - Spin button grants coins
// - Buy a single building (Lighthouse)

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#87ceeb',
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
  this.add.image(400, 300, 'map').setDisplaySize(800, 600);

  // Michigan City node
  const town = this.add.image(300, 320, 'town').setScale(0.8);
  town.setInteractive();
  town.on('pointerdown', () => {
    // simple popup effect
    scene.tweens.add({ targets: town, scale: 1.0, duration: 150, yoyo: true });
  });

  // Pin and label
  this.add.image(300, 260, 'pin').setScale(0.5);
  this.add.text(315, 270, 'Michigan City', { fontSize: '16px', color: '#000' });

  coinText = document.getElementById('coin-count');
  document.getElementById('spin-btn').addEventListener('click', () => {
    const gained = Math.floor(Math.random() * 50) + 10; // 10-59 coins
    coins += gained;
    coinText.innerText = coins;
    // show floating text
    const fx = scene.add.text(400, 100, `+${gained} coins`, { fontSize: '20px', color: '#fff' });
    scene.tweens.add({ targets: fx, y: 60, alpha: 0, duration: 900, onComplete: () => fx.destroy() });
  });

  document.getElementById('buy-btn').addEventListener('click', () => {
    const cost = 100;
    if (coins >= cost && !lighthouseOwned) {
      coins -= cost;
      coinText.innerText = coins;
      lighthouseOwned = true;
      // place lighthouse
      this.add.image(360, 300, 'lighthouse').setScale(0.6);
      document.getElementById('buy-btn').innerText = 'Lighthouse Owned';
      document.getElementById('buy-btn').disabled = true;
    } else {
      // flash button or show message
      const old = document.getElementById('buy-btn');
      old.style.background = '#ff6b6b';
      setTimeout(() => old.style.background = '#f5c518', 300);
    }
  });
}

function update() {}
