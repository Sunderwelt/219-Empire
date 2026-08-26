// Phaser 3 prototype with simple slot machine and improved lighthouse visuals (placeholder art)
// - Adds a 3-reel slot machine UI
// - Integrates lighthouse sprite + beam layer when owned
// - Uses simple placeholder symbols; replace with final art later

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#000000',
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

const SYMBOL_KEYS = ['symbol_coin', 'symbol_lighthouse', 'symbol_star'];
const REEL_COUNT = 3;
let game = new Phaser.Game(config);
let coins = 0;
let coinText;
let lighthouseOwned = false;
let reels = [];
let spinning = false;

function preload() {
  this.load.image('map', 'assets/map-placeholder.png');
  this.load.image('pin', 'assets/pin.png');
  this.load.image('town', 'assets/town.png');
  this.load.image('lighthouse', 'assets/lighthouse.png');
  this.load.image('lighthouse_beam', 'assets/lighthouse_beam.png');

  // Slot assets
  this.load.image('slot_bg', 'assets/slot_bg.png');
  this.load.image('symbol_coin', 'assets/symbol_coin.png');
  this.load.image('symbol_lighthouse', 'assets/symbol_lighthouse.png');
  this.load.image('symbol_star', 'assets/symbol_star.png');
}

function create() {
  const scene = this;

  // Load persisted state
  coins = parseInt(localStorage.getItem('219_coins')) || 0;
  lighthouseOwned = localStorage.getItem('219_lighthouse') === 'true';

  // Background map
  this.add.image(400, 300, 'map').setDisplaySize(800, 600);

  // Slot machine container (centered)
  const slotX = 400;
  const slotY = 180;
  this.add.image(slotX, slotY, 'slot_bg').setScale(0.9);

  // Create reels as image placeholders that swap textures rapidly when spinning
  const reelSpacing = 120;
  for (let r = 0; r < REEL_COUNT; r++) {
    const img = this.add.image(slotX - reelSpacing + r * reelSpacing, slotY, Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)).setScale(1.2);
    reels.push(img);
  }

  // HUD and buttons are in DOM overlay
  coinText = document.getElementById('coin-count');
  coinText.innerText = coins;

  const spinBtn = document.getElementById('spin-btn');
  const buyBtn = document.getElementById('buy-btn');

  // Update buy button if owned
  if (lighthouseOwned) {
    buyBtn.innerText = 'Lighthouse Owned';
    buyBtn.disabled = true;
    showLighthouse(scene);
  }

  spinBtn.addEventListener('click', () => {
    if (spinning) return;
    startSpin(scene);
  });

  buyBtn.addEventListener('click', () => {
    const cost = 100;
    if (coins >= cost && !lighthouseOwned) {
      coins -= cost;
      coinText.innerText = coins;
      lighthouseOwned = true;
      saveState();
      showLighthouse(scene);
      buyBtn.innerText = 'Lighthouse Owned';
      buyBtn.disabled = true;
    } else {
      const old = buyBtn;
      old.style.background = '#ff6b6b';
      setTimeout(() => old.style.background = '#f5c518', 300);
    }
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

function startSpin(scene) {
  spinning = true;
  const spinCost = 5;
  if (coins < spinCost) {
    // Not enough coins
    flashButton('#spin-btn');
    spinning = false;
    return;
  }
  coins -= spinCost;
  coinText.innerText = coins;
  saveState();

  // For each reel, cycle textures quickly and stop sequentially
  const stopDelays = [900, 1300, 1700];
  const results = [];

  for (let r = 0; r < REEL_COUNT; r++) {
    const reel = reels[r];
    let interval = setInterval(() => {
      reel.setTexture(Phaser.Utils.Array.GetRandom(SYMBOL_KEYS));
    }, 80 + r * 10);

    // Schedule stop
    scene.time.delayedCall(stopDelays[r], () => {
      clearInterval(interval);
      // Choose final symbol
      const symbol = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS);
      reel.setTexture(symbol);
      results[r] = symbol;

      // If last reel, evaluate
      if (r === REEL_COUNT - 1) {
        evaluateSpin(scene, results);
        spinning = false;
      }
    });
  }
}

function evaluateSpin(scene, results) {
  // Count matches
  const counts = {};
  for (const s of results) counts[s] = (counts[s] || 0) + 1;

  let reward = 0;
  // Three of a kind
  for (const k of Object.keys(counts)) {
    if (counts[k] === 3) {
      if (k === 'symbol_lighthouse') reward = 500;
      else if (k === 'symbol_coin') reward = 150;
      else reward = 100;
    } else if (counts[k] === 2) {
      // Pair
      if (k === 'symbol_coin') reward = Math.max(reward, 20);
      else reward = Math.max(reward, 10);
    }
  }

  if (reward > 0) {
    coins += reward;
    coinText.innerText = coins;
    saveState();
    // show floating reward
    const fx = scene.add.text(scene.cameras.main.centerX, 240, `+${reward} coins`, { fontSize: '28px', color: '#ffd700', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
    scene.tweens.add({ targets: fx, y: 200, alpha: 0, duration: 1200, onComplete: () => fx.destroy() });
    // small win effect
    scene.cameras.main.flash(200, 80, 200, 0);
    if (reward >= 100) navigator.vibrate && navigator.vibrate(200);
  } else {
    // no reward small feedback
    scene.cameras.main.shake(150, 0.005);
  }
}

function flashButton(id) {
  const el = document.querySelector(id);
  if (!el) return;
  const old = el.style.background;
  el.style.background = '#ff6b6b';
  setTimeout(() => el.style.background = old || '#f5c518', 300);
}

function showLighthouse(scene) {
  // Add lighthouse base + rotating/pulsing beam
  const base = scene.add.image(600, 360, 'lighthouse').setScale(0.9);
  const beam = scene.add.image(600, 300, 'lighthouse_beam').setScale(1.2).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8);
  scene.tweens.add({ targets: beam, angle: 360, duration: 5000, repeat: -1, ease: 'Linear' });
}
