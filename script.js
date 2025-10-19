// =====================
// PARKOUR 2D - SCRIPT.JS
// =====================

const STORAGE_KEY = 'parkour2d_v1';

// --------- SALVAMENTO ---------
let SAVE = { points: 0, coins: 0, skinsOwned: [0], selectedSkin: 0, level: 1, checkpoint: 0 };
try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) SAVE = JSON.parse(s);
} catch (e) { console.warn(e); }

// --------- SKINS (cores apenas) ---------
const SKINS = [
    { id: 0, name: 'Branco', color: '#fff', price: 0 },
    { id: 1, name: 'Preto', color: '#000', price: 5 },
    { id: 2, name: 'Cinza', color: '#888', price: 5 }
];

// --------- MAP THEMES ---------
const MAP_THEMES = [
    { name: 'Cidade futurista', tag: 'futuristic', difficulty: 2 },
    { name: 'Cidade ancestral', tag: 'ancient', difficulty: 3 },
    { name: 'Cidade do Minecraft', tag: 'minecraft', difficulty: 4 },
    { name: 'Free Fire', tag: 'freefire', difficulty: 4 },
    { name: 'Roblox', tag: 'roblox', difficulty: 3 },
    { name: 'Mario', tag: 'mario', difficulty: 2 },
    { name: 'Space Waves', tag: 'space', difficulty: 4 }
];

// --------- ELEMENTOS ---------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ptsEl = document.getElementById('pts');
const coinsEl = document.getElementById('coins');
const skinListEl = document.getElementById('skinList');
const levelSelect = document.getElementById('levelSelect');
const volSlider = document.getElementById('vol');

const audio = {
    jump: document.getElementById('sJump'),
    death: document.getElementById('sDeath'),
    checkpoint: document.getElementById('sCheckpoint'),
    coin: document.getElementById('sCoin')
};
const bgm = document.getElementById('bgm');

let masterVol = parseFloat(volSlider.value);
volSlider.addEventListener('input', () => {
    masterVol = parseFloat(volSlider.value);
    for (let k in audio) audio[k].volume = masterVol;
    bgm.volume = masterVol * 0.5;
});
bgm.volume = masterVol * 0.5;

// --------- VARIÁVEIS ---------
let selectedSkin = SAVE.selectedSkin || 0;
let running = false, tick = 0, player = null, obstacles = [], camX = 0;
let scorePoints = SAVE.points || 0, coins = SAVE.coins || 0;
let currentCheckpointX = SAVE.checkpoint || 0, obstaclesPassed = 0;

// --------- CONTROLES ---------
const KEY = { left: false, right: false, jump: false };
window.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') KEY.left = true; if (e.key === 'ArrowRight') KEY.right = true; if (e.key === ' ' || e.key === 'ArrowUp') { KEY.jump = true; e.preventDefault(); }});
window.addEventListener('keyup', e => { if (e.key === 'ArrowLeft') KEY.left = false; if (e.key === 'ArrowRight') KEY.right = false; if (e.key === ' ' || e.key === 'ArrowUp') KEY.jump = false; });

// --------- TOQUE ---------
let touchMode = document.getElementById('touchToggle').checked;
document.getElementById('touchToggle').addEventListener('change', e => { touchMode = e.target.checked; setupTouchButtons(); saveNow(); });
let touchButtons = null;
function setupTouchButtons() {
    if (touchButtons) touchButtons.remove();
    if (!touchMode) return;
    touchButtons = document.createElement('div');
    touchButtons.style.position = 'fixed';
    touchButtons.style.left = '8px';
    touchButtons.style.bottom = '8px';
    touchButtons.style.zIndex = 9999;
    touchButtons.innerHTML = `<div style="display:flex;gap:8px"><button id="tLeft">◀</button><button id="tJump">▲</button><button id="tRight">▶</button></div>`;
    document.body.appendChild(touchButtons);
    document.getElementById('tLeft').ontouchstart = () => KEY.left = true;
    document.getElementById('tLeft').ontouchend = () => KEY.left = false;
    document.getElementById('tRight').ontouchstart = () => KEY.right