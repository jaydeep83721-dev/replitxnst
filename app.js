/* Treasureport — Crystal Harbour
 * Original, dependency-free WebGL voxel world and educational adventure.
 * Designed as a standalone static prototype; no third-party art or game code.
 */
'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const formatMoney = (amount) => '₹' + Math.round(amount).toLocaleString('en-IN');
const SAVE_KEY = 'treasureport-crystal-harbour-v1';
const PILLARS = ['plan', 'save', 'invest', 'safe'];
const BASE_STATE = { started: false, avatar: 'boy', name: 'Explorer', happy: 70, completed: {}, played: {}, restAvailable: true };
function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return { ...BASE_STATE, ...data, completed: { ...(data.completed || {}) }, played: { ...(data.played || {}) } };
  } catch { return { ...BASE_STATE }; }
}
let state = loadState();
function saveState() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* private mode */ } }

const GUILDS = {
  plan: { title: "Builder's Workshop", subtitle: 'THE FESTIVAL FUND', x: -6.2, z: -4.8, door: { x: -5.15, z: -2.45 }, tint: '#51b8e8', badge: '⚒', intro: 'The village is hosting a festival. Can you plan the supplies and still keep a buffer for surprises?', steps: [
    { q: 'You have ₹800 for the festival. What should you do first?', options: [
      ['Reserve money for lights, food, and an emergency fund.', 100, 2, 'Good planning! Essentials and a buffer come before decorations.'],
      ['Spend everything on the biggest fireworks display.', 10, -6, 'A celebration needs essentials and emergency money too.'],
      ['Buy decorations first and work out the rest later.', 30, -3, 'The festival can run short of money without a plan.']
    ] },
    { q: 'Your ingredient supplier raises prices unexpectedly. What now?', options: [
      ['Compare vendors and adjust the non-essential decorations.', 100, 3, 'Smart! A flexible plan can survive changed prices.'],
      ['Borrow immediately without checking other options.', 20, -4, 'Borrowing has consequences. Explore alternatives first.'],
      ['Cancel all food to keep the expensive decorations.', 15, -4, 'You should protect the needs of the event first.']
    ] },
    { q: 'There is ₹120 left after all essential purchases. What is wisest?', options: [
      ['Keep a small reserve and spend a little on the community.', 100, 4, 'A balanced budget protects both security and happiness.'],
      ['Spend all ₹120 right away, since it is extra.', 30, -2, 'Unexpected expenses could still arise.'],
      ['Refuse every enjoyable activity despite having a buffer.', 60, -3, 'Saving matters, but planned enjoyment matters too.']
    ] }
  ] },
  save: { title: 'Harbour Bakery', subtitle: 'POCKET PANIC', x: 6.2, z: -4.8, door: { x: 5.1, z: -2.45 }, tint: '#ff9bb1', badge: '▣', intro: 'Manage a small monthly budget, make room for joy, and prepare for expenses you cannot predict.', steps: [
    { q: 'You receive ₹600 for the month. How will you start?', options: [
      ['Set aside transport and food costs, then save a little.', 100, 4, 'Cover needs first and pay your savings jar early.'],
      ['Buy a gaming accessory before calculating bills.', 15, -4, 'Treats should fit after essentials, not replace them.'],
      ['Keep all the cash loose and decide later.', 30, -2, 'A simple plan helps money last longer.']
    ] },
    { q: 'A friend invites you for a ₹100 treat. You have some room in your budget.', options: [
      ['Choose a smaller treat that fits your planned wants budget.', 100, 3, 'You can enjoy life without losing sight of your goal.'],
      ['Spend ₹250 because your friend is paying for some.', 10, -5, 'Spending outside your limit can cause later stress.'],
      ['Never spend money on friends, even when affordable.', 60, -3, 'Financial wellbeing includes thoughtful enjoyment.']
    ] },
    { q: 'A surprise ₹140 repair bill arrives. What is the best response?', options: [
      ['Use the emergency buffer and adjust remaining wants.', 100, 3, 'This is exactly why emergency savings help.'],
      ['Take instant high-fee credit without reading the terms.', 0, -6, 'Quick credit may carry fees that make the problem worse.'],
      ['Ignore the essential bill and hope it disappears.', 5, -5, 'Unpaid essentials can become bigger problems.']
    ] }
  ] },
  invest: { title: 'Merchant Guild', subtitle: 'THE DEAL BOARD', x: -6.2, z: 4.8, door: { x: -5.15, z: 2.35 }, tint: '#dba6ff', badge: '◈', intro: 'Practice researching fictional companies. Good judgement wins here—not lucky profits.', steps: [
    { q: 'A fictional company promises to double your coins quickly. What is your first move?', options: [
      ['Ask about its debt, customers, and how the business earns money.', 100, 2, 'Research before decisions. Big promises need evidence.'],
      ['Invest all your coins as soon as you hear the promise.', 0, -5, 'Exciting claims are not a substitute for research.'],
      ['Decide using only the colorful company logo.', 10, -3, 'Appearance does not tell you whether a business is sound.']
    ] },
    { q: 'You have three fictional businesses to choose from. How do you handle risk?', options: [
      ['Spread exposure across different types and keep a reserve.', 100, 4, 'Diversification reduces dependence on one outcome.'],
      ['Put everything into the one that rose most recently.', 10, -3, 'Recent gains cannot guarantee future results.'],
      ['Borrow more coins to buy just one of them.', 0, -5, 'Borrowing and concentrating together can amplify risk.']
    ] },
    { q: 'Your imaginary portfolio falls one quarter after a market shock. What now?', options: [
      ['Review the reasons calmly and check whether your plan changed.', 100, 4, 'A calm review beats a panic reaction.'],
      ['Sell everything instantly without looking at the facts.', 20, -3, 'A quick reaction is not always a reasoned decision.'],
      ['Keep adding money blindly because prices fell.', 25, -3, 'Every choice still needs research and risk awareness.']
    ] }
  ] },
  safe: { title: "Guardian's Watch", subtitle: 'SCAM DETECTIVE', x: 6.2, z: 4.8, door: { x: 5.1, z: 2.35 }, tint: '#88e6ff', badge: '⬡', intro: 'Watch the harbour message board and spot misleading messages before anyone loses their savings.', steps: [
    { q: 'You get a message asking for your banking OTP to release a prize.', options: [
      ['Do not share it; verify through the official service.', 100, 3, 'One-time passwords are private. Never share them with strangers.'],
      ['Share the OTP because the message mentions a prize.', 0, -6, 'A prize is not a reason to hand over an OTP.'],
      ['Forward the OTP to friends for advice.', 0, -5, 'Sharing a secret with more people makes it less secure.']
    ] },
    { q: 'A payment link looks like your bank, but its web address is slightly different.', options: [
      ['Avoid the link and open your bank using a trusted app.', 100, 3, 'Lookalike sites are a common phishing trick.'],
      ['Enter your details to check if it is genuine.', 0, -6, 'Never test a suspicious link using private credentials.'],
      ['Forward the suspicious link to your group chat.', 15, -4, 'Even forwarding a scam can expose others to it.']
    ] },
    { q: 'A caller claims to be support and demands an immediate payment to avoid account closure.', options: [
      ['Pause, hang up, and verify on an official support number.', 100, 4, 'Pressure and urgency are signs to stop and verify.'],
      ['Pay right away because the caller sounds confident.', 0, -6, 'A confident voice does not prove who is calling.'],
      ['Give them your password instead of money.', 0, -6, 'Never give out passwords to someone who calls you.']
    ] }
  ] }
};

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform mat4 uViewProjection;
varying vec3 vColor;
void main() {
  vec3 light = normalize(vec3(-0.48, 0.96, 0.52));
  float diffuse = max(dot(aNormal, light), 0.0);
  float shade = 0.60 + diffuse * 0.42;
  vColor = aColor * shade;
  gl_Position = uViewProjection * vec4(aPosition, 1.0);
}`;
const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vColor;
void main() { gl_FragColor = vec4(vColor, 1.0); }
`;

function colorFromHex(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
}
function mixColor(a, b, t) {
  const ca = colorFromHex(a), cb = colorFromHex(b);
  const value = ca.map((x, i) => clamp(x * (1 - t) + cb[i] * t, 0, 1));
  return '#' + value.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
function noise(x, z, offset = 0) {
  let n = (Math.imul(x + 3211, 374761393) + Math.imul(z + 131, 668265263) + offset * 775813) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

class Geometry {
  constructor() { this.positions = []; this.normals = []; this.colors = []; }
  triangle(a, b, c, hex, normal = null) {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = normal || normalize(cross(u, v)), col = colorFromHex(hex);
    for (const p of [a, b, c]) { this.positions.push(...p); this.normals.push(...n); this.colors.push(...col); }
  }
  quad(points, hex, normal) {
    this.triangle(points[0], points[1], points[2], hex, normal);
    this.triangle(points[0], points[2], points[3], hex, normal);
  }
  box(x, y, z, w, h, d, color, options = {}) {
    const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2, z0 = z - d / 2, z1 = z + d / 2;
    const top = options.top || mixColor(color, '#ffffff', 0.13), side = options.side || mixColor(color, '#061b39', 0.19);
    this.quad([[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]], top, [0,1,0]);
    this.quad([[x0,y0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1]], side, [0,-1,0]);
    this.quad([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]], color, [1,0,0]);
    this.quad([[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0]], side, [-1,0,0]);
    this.quad([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]], color, [0,0,1]);
    this.quad([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]], side, [0,0,-1]);
  }
  crystal(x, y, z, r, h, hue) {
    const top = [x, y + h / 2, z], bottom = [x, y - h / 2, z];
    const ring = [[x+r,y,z],[x,y,z+r],[x-r,y,z],[x,y,z-r]];
    for (let i = 0; i < 4; i++) {
      const current = ring[i], next = ring[(i+1)%4];
      this.triangle(top, current, next, i % 2 ? mixColor(hue,'#ffffff',.45) : hue);
      this.triangle(bottom, next, current, i % 2 ? mixColor(hue,'#001c69',.25) : mixColor(hue,'#ffffff',.15));
    }
  }
}
function cross(a, b) { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
function normalize(v) { const len = Math.hypot(...v) || 1; return v.map((value) => value / len); }
function subtract(a, b) { return a.map((v, i) => v - b[i]); }
function dot(a, b) { return a.reduce((s, v, i) => s + v*b[i], 0); }
function multiplyMatrix(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 4; k++) out[col*4+row] += a[k*4+row]*b[col*4+k];
  }
  return out;
}
function lookAt(eye, target) {
  const z = normalize(subtract(eye,target)), x = normalize(cross([0,1,0],z)), y = cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
function orthographic(scale, aspect, near = 0.1, far = 140) {
  const left=-scale*aspect,right=scale*aspect,bottom=-scale,top=scale;
  return new Float32Array([2/(right-left),0,0,0,0,2/(top-bottom),0,0,0,0,-2/(far-near),0,-(right+left)/(right-left),-(top+bottom)/(top-bottom),-(far+near)/(far-near),1]);
}

function isLand(x, z) {
  if (x*x/(11.35*11.35)+z*z/(9.45*9.45)>1) return false;
  if (x < -9 && z < -3.9) return false;
  if (x > 9 && z > 6.0) return false;
  if (x < -9 && z > 5.9) return false;
  return true;
}
function isBlocked(x, z) {
  if (!isLand(x,z)) return true;
  if (Math.hypot(x,z)<1.7) return true;
  for (const guild of Object.values(GUILDS)) if (Math.abs(x-guild.x) < 2.35 && Math.abs(z-guild.z) < 1.95) return true;
  if (x > -2.1 && x < 2.1 && z < -8.5) return true; // behind the gate
  return false;
}
function isRoad(x, z) {
  if (Math.abs(x) < 0.78 && z > -8.6 && z < 8.8) return true;
  if (Math.abs(z) < 0.77 && Math.abs(x) < 7.9) return true;
  if (Math.abs(z-2.35) < .8 && Math.abs(x) < 6.8) return true;
  if (Math.abs(z+2.45) < .8 && Math.abs(x) < 6.8) return true;
  return false;
}

function buildHouse(g, guild, kind) {
  const x=guild.x,z=guild.z;
  const tones={plan:['#e4ab72','#3977ba','#14446c'],save:['#f7d1a3','#ee7e9c','#a74376'],invest:['#c7aec0','#9963bd','#572d81'],safe:['#8fa3b3','#398aa7','#1d496d']};
  const [walls,roof,dark]=tones[kind];
  g.box(x,.82,z,4.4,.45,3.55,'#8c7c73');
  g.box(x,2.27,z,3.9,2.75,3.05,walls);
  g.box(x,3.7,z,4.7,.34,3.62,dark);
  g.box(x,4.05,z,4.5,.38,3.48,roof);
  g.box(x,4.39,z,3.7,.40,3.08,roof);
  g.box(x,4.72,z,2.65,.36,2.65,dark);
  g.box(x+1.18,4.92,z-.2,.6,.95,.65,'#bd897d');
  g.box(x+1.18,5.45,z-.2,.8,.15,.85,'#794f5e');
  const front = guild.z < 0 ? 1 : -1, faceZ = z + front*1.55;
  g.box(x,1.55,faceZ+front*.095,1.11,1.71,.19,'#563a38');
  g.box(x,1.55,faceZ+front*.22,.83,1.53,.12,'#895742');
  g.box(x+0.26,1.57,faceZ+front*.32,.12,.12,.13,'#ffe28d');
  for (const off of [-1.32,1.32]) {
    g.box(x+off,2.64,faceZ+front*.12,.70,.79,.15,dark);
    g.box(x+off,2.64,faceZ+front*.22,.53,.59,.13,'#bdf3fe');
    g.box(x+off,2.64,faceZ+front*.28,.11,.59,.05,'#f9f3d5');
    g.box(x+off,2.64,faceZ+front*.30,.53,.10,.07,'#f9f3d5');
  }
  g.box(x,3.30,faceZ+front*.24,1.85,.47,.18,dark);
  g.box(x,3.30,faceZ+front*.35,1.4,.30,.12,'#f5d784');
  // A short set of walk-up stairs sits outside each door.
  for(let i=0;i<3;i++) g.box(x,.51-i*.06,faceZ+front*(.53+i*.35),2.1-i*.16,.22,1.1,'#b2ada0');
  if(kind==='plan') {
    for(let i=0;i<4;i++) g.box(x-1.9+i*.36,.86,z+front*2.5,.30,.45,.6,i%2?'#916345':'#c48653');
    g.box(x+.9,1.0,z+front*2.5,.62,.60,.70,'#94754c');
    g.box(x-1.0,3.68,z+front*2.0,.16,.8,.17,'#e7d1ab');
  } else if(kind==='save') {
    for (let i=-2;i<=2;i++) g.box(x+i*.6,2.52,faceZ+front*.71,.58,.15,.75,i%2?'#f7f1d4':'#d85878');
    for(let i=-1;i<=1;i++) g.box(x+i*.56,.91,faceZ+front*2.1,.38,.35,.33,'#dc9a63');
    g.box(x-1.9,1.1,z+front*.4,.5,.85,.5,'#d89a6d');
  } else if(kind==='invest') {
    for(let i=0;i<3;i++) g.box(x-.9+i*.43,1.1+i*.17,faceZ+front*2.2,.36,.20+i*.34,.33,'#f8bd49');
    g.crystal(x+.65,3.24,faceZ+front*.44,.27,.48,'#ffe38e');
    for(let i=0;i<3;i++) g.box(x+2.1,1.2+i*.48,z-.5,.22,.5,.22,'#edc56b');
  } else {
    g.box(x+1.25,5.15,z-.7,1.72,2.1,1.65,'#8598a5');
    g.box(x+1.25,6.36,z-.7,2.14,.30,2.08,dark);
    for(let i=-1;i<=1;i++)g.box(x+1.25+i*.68,6.66,z-1.25,.45,.38,.55,'#99b7c8');
    g.box(x+1.25,5.55,z+.16,.6,.68,.12,'#ffe2a0');
    g.box(x-1.2,3.38,faceZ+front*.44,.64,.8,.12,'#a8faff');
  }
  // Warm lanterns by each doorway.
  for(const side of [-1,1]){
    const px=x+side*2.12,pz=z+front*2.30;
    g.box(px,1.11,pz,.14,1.06,.14,'#55463b');
    g.box(px,1.68,pz,.34,.4,.31,'#ffc76b');
    g.box(px,1.97,pz,.47,.15,.43,'#3e5763');
  }
}
function buildTree(g) {
  g.box(0,.68,0,4.50,.45,4.50,'#b0b6a2');
  g.box(0,.98,0,3.52,.18,3.52,'#e8d8a8');
  for (const [x,z] of [[-1.75,-1.75],[1.75,-1.75],[-1.75,1.75],[1.75,1.75]]) {
    g.box(x,1.35,z,.42,1.0,.42,'#9a836a');
    g.crystal(x,2.05,z,.28,.77,'#53e6ff');
  }
  g.box(0,2.32,0,1.4,3.00,1.35,'#714d39');
  g.box(.10,4.1,.06,1.7,1.3,1.6,'#6c4e37');
  g.box(-1.05,4.32,.45,2.5,.52,.7,'#805d43');
  g.box(1.00,4.72,-.55,2.05,.56,.9,'#704934');
  const leaves=[[-1.4,5.15,-.4,2.6,1.15,2.6],[1.3,5.22,.4,2.9,1.23,2.6],[0,5.65,1.2,2.8,1.08,2.6],[-.5,6.13,-.6,3.3,1.20,3.3],[.35,6.8,.12,2.65,.78,2.70]];
  for(const [x,y,z,w,h,d] of leaves) g.box(x,y,z,w,h,d,noise(Math.round(x*10),Math.round(z*10))>.5?'#388d5b':'#49b378',{top:'#6bce70'});
  g.crystal(0,8.22,0,1.02,3.0,'#43e8ff');
  g.crystal(-1.2,7.20,.4,.46,1.85,'#72f6ff');
  g.crystal(1.27,7.25,-.2,.45,1.65,'#a8e1ff');
  g.crystal(0,4.85,1.19,.47,1.2,'#4efeff');
  for(let i=0;i<6;i++){
    const a=i*2*Math.PI/6;
    g.box(Math.sin(a)*2.7,1.48,Math.cos(a)*2.7,.15,.75,.15,'#83684a');
    g.box(Math.sin(a)*2.7,1.88,Math.cos(a)*2.7,.35,.46,.35,'#ffe49b');
  }
}
function buildGate(g, unlocked) {
  const z=-8.15;
  for(const x of [-1.65,1.65]){
    g.box(x,1.85,z,.93,3.0,.98,'#96b7bd');
    g.box(x,3.52,z,1.15,.45,1.15,'#587e99');
    g.crystal(x,4.11,z,.48,1.2,unlocked?'#6affd4':'#557f97');
  }
  g.box(0,3.45,z,4.2,.72,1.0,'#688da9');
  g.box(0,3.91,z,3.4,.28,1.3,'#48678f');
  if(unlocked)g.crystal(0,2.1,z,.84,2.7,'#65fce8');
  else {g.box(0,1.76,z,2.50,2.55,.42,'#455d78');for(let i=-1;i<=1;i++)g.box(i*.73,1.78,z+.24,.14,2.5,.12,'#718aa2');}
}
function buildWorldGeometry() {
  const g=new Geometry();
  // Ocean, shoreline foam, layered dirt cliffs and mossy terrain.
  g.box(0,-2.1,0,37,.48,32,'#469ac0',{top:'#66cae7'});
  for(let x=-17;x<18;x+=2)for(let z=-15;z<16;z+=2){
    if(noise(x,z,14)>.72 && !isLand(x,z))g.box(x,-1.82,z,.32,.045,.7,'#a7e9f0');
  }
  for(let x=-11;x<=11;x++)for(let z=-9;z<=9;z++){
    const rand=noise(x,z),on=isLand(x,z);if(!on)continue;
    const edge=!isLand(x+1,z)||!isLand(x-1,z)||!isLand(x,z+1)||!isLand(x,z-1);
    g.box(x,-.74,z,1.04,1.98,1.04,rand>.66?'#7c6854':'#8c6e54',{side:'#6e5b57'});
    g.box(x,.37,z,1.045,.30,1.045,isRoad(x,z)?'#c2b9a3':rand>.76?'#6baf65':'#61ae66',{top:isRoad(x,z)?(rand>.5?'#e1d7b9':'#d9c7a4'):(rand>.55?'#7ecb74':'#78c879')});
    if(edge){g.box(x,-1.5,z,1.07,.51,1.07,rand>.5?'#7d6f6c':'#6d6065');}
    if(!isRoad(x,z)&&rand>.86&&Math.abs(x)>2&&Math.abs(z)>1.8)g.box(x,.61,z,.13,.18,.14,'#bde98b');
  }
  // Main routes and bridges to each quadrant.
  for(let p=-8;p<=8;p+=.86){
    g.box(0,.57,p,.86,.095,.70,'#ded0ad');
    if(Math.abs(p)<6.2){g.box(p,.57,0,.70,.095,.86,'#d5c6a7');}
  }
  for(let x=-5.7;x<5.9;x+=.74){
    g.box(x,.57,2.35,.70,.08,.77,'#d6c5a7');
    g.box(x,.57,-2.45,.70,.08,.77,'#d6c5a7');
  }
  // Docks, ship and seaside lighthouse.
  g.box(0,.18,9.65,4.6,.32,3.6,'#a7794f');
  for(let x=-2.3;x<=2.3;x+=.5)g.box(x,.37,10.45,.39,.11,3.0,'#c89a60');
  for(let x=-2;x<=2;x+=1.2){
    for(let z of [8.55,11.55]){g.box(x,-.40,z,.24,1.63,.24,'#694936');g.box(x,.55,z,.33,.32,.33,'#eecf8b');}
  }
  g.box(4.35,-.97,11.35,3.05,1.06,1.63,'#936444');
  g.box(4.35,-.41,11.35,2.55,.24,1.2,'#c9975c');
  g.box(4.35,.78,11.35,.14,2.45,.14,'#6b4c37');
  g.box(4.78,1.24,11.37,1.4,1.5,.09,'#f8edd0');
  g.box(4.78,1.2,11.44,.13,1.43,.12,'#5d92c7');
  for(let y=0;y<4;y++)g.box(-6.9,1+y*.72,7.45,1.35,.74,1.35,y%2?'#fff1dd':'#f17a61');
  g.box(-6.9,4.13,7.45,1.75,.31,1.65,'#a85555');
  g.box(-6.9,4.48,7.45,1.16,.42,1.19,'#ffda8c');
  g.box(-6.9,4.78,7.45,1.85,.17,1.83,'#4a647a');
  for(let i=0;i<7;i++){const xx=-2.3+i*.75;g.box(xx,0.62,8.35,.68,.16,.15,'#6a4f3b');}
  // Buildings and their themed decoration.
  for(const [kind,guild] of Object.entries(GUILDS))buildHouse(g,guild,kind);
  buildTree(g);
  buildGate(g,PILLARS.every((id)=>state.completed[id]));
  // Landmarks and landscape: chunky trees, blossoms, crops, rocks, flower beds.
  const trees=[[-9,0],[-8,-2.5],[-8.4,5.3],[-3.1,-6.3],[3,-6.5],[8.7,-1],[8.5,6.9],[-3,6],[3.2,5.5],[-8.4,2.2],[8.3,-3.3],[0,7.8]];
  for(const [index,pos] of trees.entries()){
    const [x,z]=pos, pink=index===5||index===7;
    g.box(x,1.32,z,.42,1.6,.44,'#825d3b');
    const leaf=pink?'#f29ec0':(index%3?'#4dba67':'#368f59');
    g.box(x,2.53,z,1.5,1.3,1.5,leaf);
    g.box(x-.48,3.05,z-.26,1.25,1.05,1.13,mixColor(leaf,'#aaff95',.18));
    g.box(x+.42,3.06,z+.22,1.31,1.08,1.42,leaf);
    g.box(x,3.65,z,.86,.7,.92,mixColor(leaf,'#a8eacf',.12));
  }
  for(let i=0;i<65;i++){
    const x=Math.round((noise(i,19)*19-9)*3)/3,z=Math.round((noise(i,33)*16-8)*3)/3;
    if(!isLand(x,z)||isRoad(x,z)||isBlocked(x,z))continue;
    const c=i%4===0?'#ffd471':i%3===0?'#fd8ca7':'#f5f9d2';
    g.box(x,.62,z,.13,.25,.13,'#5c9f50');g.box(x,.77,z,.23,.19,.24,c);
  }
  for(let i=0;i<27;i++){
    const x=noise(i,78)*19-9,z=noise(i,57)*16-8;
    if(!isLand(x,z)||isRoad(x,z)||isBlocked(x,z))continue;
    const s=.20+noise(i,66)*.26;g.box(x,.64,z,s,.19,s,i%2?'#858a86':'#aaa99a');
  }
  for(let i=0;i<18;i++){
    const x=-4.8+i*.22,z=-7.8+noise(i,3)*1.2;
    if(isLand(x,z))g.box(x,.71,z,.14,.45,.14,i%3?'#d6b74d':'#8eaf4d');
  }
  return g;
}

// The character is real 3D geometry rebuilt each frame so arms and legs swing while walking.
function buildAvatar(hero, walking, time) {
  const g=new Geometry(),x=hero.x,z=hero.z,swing=walking?Math.sin(time*11)*.28:0;
  const jacket=state.avatar==='girl'?'#e873a7':'#3badd5';
  const sleeve=state.avatar==='girl'?'#cb5e94':'#217cae';
  const pants=state.avatar==='girl'?'#58426f':'#314f83';
  const hair=state.avatar==='girl'?'#613e53':'#40352d';
  const skin='#d4a17f';
  const c=Math.cos(hero.heading),s=Math.sin(hero.heading);
  function box(localX,localY,localZ,w,h,d,color){
    // Axis aligned boxes are sufficient for the charming blocky avatar; translate and rotate positions via yaw.
    const temp=new Geometry();temp.box(localX,localY,localZ,w,h,d,color);
    for(let i=0;i<temp.positions.length;i+=3){
      const px=temp.positions[i],py=temp.positions[i+1],pz=temp.positions[i+2];
      g.positions.push(x+px*c+pz*s,py,z-px*s+pz*c);
      const nx=temp.normals[i],ny=temp.normals[i+1],nz=temp.normals[i+2];
      g.normals.push(nx*c+nz*s,ny,-nx*s+nz*c);
      g.colors.push(temp.colors[i],temp.colors[i+1],temp.colors[i+2]);
    }
  }
  const bounce=walking?Math.abs(Math.sin(time*11))*.13:Math.sin(time*2)*.025;
  const y=bounce;
  // Shadow just above the ground.
  box(0,.575,.1,.71,.055,.42,'#4c8c74');
  box(-.27,1.01+y,swing*.32,.37,.74,.46,pants);
  box(.27,1.01+y,-swing*.32,.37,.74,.46,pants);
  box(-.27,.68+y,swing*.34+.09,.39,.19,.65,'#413d47');
  box(.27,.68+y,-swing*.34+.09,.39,.19,.65,'#413d47');
  box(0,1.83+y,0,1.0,.96,.63,jacket);
  box(-.64,1.77+y,-swing*.6,.27,.81,.47,sleeve);
  box(.64,1.77+y,swing*.6,.27,.81,.47,sleeve);
  box(-.64,1.29+y,-swing*.6,.29,.19,.42,skin);
  box(.64,1.29+y,swing*.6,.29,.19,.42,skin);
  box(0,2.64+y,0,.9,.82,.79,skin);
  box(0,3.1+y,-.04,1.03,.31,.9,hair);
  box(-.34,2.94+y,.17,.25,.25,.75,hair);
  if(state.avatar==='girl'){box(-.49,2.58+y,-.2,.22,.93,.68,hair);box(.49,2.58+y,-.2,.22,.93,.68,hair);}
  else {box(.3,2.88+y,-.28,.40,.30,.53,hair);}
  box(-.23,2.66+y,.411,.09,.10,.04,'#34303a');
  box(.23,2.66+y,.411,.09,.10,.04,'#34303a');
  box(0,2.43+y,.411,.2,.07,.04,'#b26d67');
  box(0,2.1+y,.35,.29,.17,.12,'#f2dba0');
  return g;
}

class WebGLWorld {
  constructor(canvas) {
    this.canvas=canvas;
    this.gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'}) || canvas.getContext('experimental-webgl');
    if(!this.gl)throw new Error('WebGL unavailable');
    const gl=this.gl;
    const vertex=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vertex,VERTEX_SHADER);gl.compileShader(vertex);
    if(!gl.getShaderParameter(vertex,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(vertex));
    const fragment=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fragment,FRAGMENT_SHADER);gl.compileShader(fragment);
    if(!gl.getShaderParameter(fragment,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(fragment));
    this.program=gl.createProgram();gl.attachShader(this.program,vertex);gl.attachShader(this.program,fragment);gl.linkProgram(this.program);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
    gl.useProgram(this.program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    this.attributes=['aPosition','aNormal','aColor'].map((name)=>gl.getAttribLocation(this.program,name));
    this.uniform=gl.getUniformLocation(this.program,'uViewProjection');
    gl.clearColor(.50,.79,.87,1);
    this.staticBuffers=this.makeBuffers(buildWorldGeometry(),true);
    this.avatarBuffers=this.makeBuffers(buildAvatar({x:0,z:7,heading:Math.PI},false,0),false);
    this.yaw=.67;this.elevation=.84;this.zoom=1;
    this.center={x:0,z:0};this.lastCamera=null;
    this.resize();window.addEventListener('resize',()=>this.resize());
  }
  makeBuffers(geometry,staticDraw) {
    const gl=this.gl,mode=staticDraw?gl.STATIC_DRAW:gl.DYNAMIC_DRAW;
    const values=[geometry.positions,geometry.normals,geometry.colors];
    return { count: geometry.positions.length/3, buffers:values.map((values)=>{
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),mode);return buffer;
    }) };
  }
  updateAvatar(hero,walking,time) {
    const gl=this.gl,geometry=buildAvatar(hero,walking,time);
    const values=[geometry.positions,geometry.normals,geometry.colors];
    this.avatarBuffers.count=geometry.positions.length/3;
    for(let i=0;i<3;i++){
      gl.bindBuffer(gl.ARRAY_BUFFER,this.avatarBuffers.buffers[i]);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values[i]),gl.DYNAMIC_DRAW);
    }
  }
  rebuild() {const gl=this.gl;for(const buffer of this.staticBuffers.buffers)gl.deleteBuffer(buffer);this.staticBuffers=this.makeBuffers(buildWorldGeometry(),true);}
  resize() {
    const deviceScale=Math.min(window.devicePixelRatio||1,1.8);
    this.canvas.width=Math.max(1,Math.round(this.canvas.clientWidth*deviceScale));
    this.canvas.height=Math.max(1,Math.round(this.canvas.clientHeight*deviceScale));
    this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
  }
  cameraMatrices() {
    const aspect=this.canvas.width/this.canvas.height;
    const scale=(aspect<1 ? 12 : 10.6)*this.zoom;
    const target=[this.center.x,1.0,this.center.z];
    const eye=[target[0]+Math.sin(this.yaw)*Math.cos(this.elevation)*32,target[1]+Math.sin(this.elevation)*32,target[2]+Math.cos(this.yaw)*Math.cos(this.elevation)*32];
    const projection=orthographic(scale,aspect),view=lookAt(eye,target),combined=multiplyMatrix(projection,view);
    const forward=normalize(subtract(target,eye)),right=normalize(cross(forward,[0,1,0])),up=normalize(cross(right,forward));
    this.lastCamera={eye,target,forward,right,up,scale,aspect,combined};
    return combined;
  }
  render() {
    const gl=this.gl;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.uniform,false,this.cameraMatrices());
    for(const mesh of [this.staticBuffers,this.avatarBuffers]){
      for(let i=0;i<3;i++){
        gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffers[i]);gl.enableVertexAttribArray(this.attributes[i]);
        gl.vertexAttribPointer(this.attributes[i],3,gl.FLOAT,false,0,0);
      }
      gl.drawArrays(gl.TRIANGLES,0,mesh.count);
    }
  }
  project(worldX,worldY,worldZ) {
    const m=this.lastCamera?.combined;if(!m)return null;
    const w=m[3]*worldX+m[7]*worldY+m[11]*worldZ+m[15];
    const x=(m[0]*worldX+m[4]*worldY+m[8]*worldZ+m[12])/w;
    const y=(m[1]*worldX+m[5]*worldY+m[9]*worldZ+m[13])/w;
    return {x:(x+1)*this.canvas.clientWidth*.5,y:(1-y)*this.canvas.clientHeight*.5,hidden:w<=0||Math.abs(x)>1.6||Math.abs(y)>1.5};
  }
  pointOnGround(clientX,clientY) {
    if(!this.lastCamera)return null;
    const rect=this.canvas.getBoundingClientRect(),cam=this.lastCamera;
    const u=(clientX-rect.left)/rect.width*2-1,v=1-(clientY-rect.top)/rect.height*2;
    const start=cam.eye.map((s,i)=>s+cam.right[i]*u*cam.scale*cam.aspect+cam.up[i]*v*cam.scale);
    const t=(.57-start[1])/cam.forward[1];
    if(t<0)return null;
    return {x:start[0]+cam.forward[0]*t,z:start[2]+cam.forward[2]*t};
  }
}

// WebGL is the normal renderer. When hardware WebGL is disabled, the concept map
// becomes a graceful 2D fallback, with the same movement and learning activities.
class FallbackWorld {
  constructor(canvas) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');
    this.yaw=.67;this.elevation=.84;this.zoom=1;this.center={x:0,z:0};
    this.hero={x:0,z:7.3};this.walking=false;this.time=0;
    canvas.classList.add('fallback');
    this.resize();window.addEventListener('resize',()=>this.resize());
  }
  resize(){this.canvas.width=this.canvas.clientWidth;this.canvas.height=this.canvas.clientHeight;}
  rebuild(){}
  updateAvatar(hero,walking,time){this.hero=hero;this.walking=walking;this.time=time;}
  project(x,y,z){
    const w=this.canvas.clientWidth,h=this.canvas.clientHeight;
    const scale=Math.min(w/19,h/16)/this.zoom;
    const dx=x-this.center.x,dz=z-this.center.z;
    const px=Math.cos(this.yaw)*dx-Math.sin(this.yaw)*dz;
    const py=Math.sin(this.yaw)*dx+Math.cos(this.yaw)*dz;
    return {x:w*.5+px*scale,y:h*.54+py*scale*.60-y*scale*.67,hidden:false};
  }
  pointOnGround(clientX,clientY){
    const r=this.canvas.getBoundingClientRect(),w=r.width,h=r.height;
    const scale=Math.min(w/19,h/16)/this.zoom;
    const px=(clientX-r.left-w*.5)/scale;
    const py=(clientY-r.top-h*.54+.57*scale*.67)/(scale*.60);
    return {x:this.center.x+px*Math.cos(this.yaw)+py*Math.sin(this.yaw),z:this.center.z-px*Math.sin(this.yaw)+py*Math.cos(this.yaw)};
  }
  render(){
    const ctx=this.ctx;if(!ctx)return;
    const w=this.canvas.width,h=this.canvas.height;
    ctx.clearRect(0,0,w,h);
    const p=this.project(this.hero.x,.62,this.hero.z);
    const x=p.x,y=p.y,s=clamp(w/800,.55,1.1);
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    // A tiny voxel-inspired character floats above the painted-world fallback.
    ctx.fillStyle='#0e203766';ctx.beginPath();ctx.ellipse(0,0,20,7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=state.avatar==='girl'?'#583b66':'#254d75';
    const step=this.walking?Math.sin(this.time*11)*4:0;
    ctx.fillRect(-14,-20+step,11,21);ctx.fillRect(3,-20-step,11,21);
    ctx.fillStyle=state.avatar==='girl'?'#e277ae':'#2fa6cf';ctx.fillRect(-19,-48,38,31);
    ctx.fillStyle='#d5a280';ctx.fillRect(-16,-77,32,29);
    ctx.fillStyle=state.avatar==='girl'?'#74495f':'#40332c';ctx.fillRect(-18,-81,36,10);
    if(state.avatar==='girl'){ctx.fillRect(-21,-72,7,23);ctx.fillRect(14,-72,7,23);}
    ctx.fillStyle='#25303f';ctx.fillRect(-9,-65,4,4);ctx.fillRect(6,-65,4,4);
    ctx.restore();
  }
}

// A* pathfinding keeps click-to-walk movement on the island and around the buildings.
const GRID=.55,GRID_LIMIT=22;
function cell(x,z){return {i:Math.round(x/GRID),j:Math.round(z/GRID)};}
function traversable(i,j){return Math.abs(i)<=GRID_LIMIT&&Math.abs(j)<=GRID_LIMIT&&!isBlocked(i*GRID,j*GRID);}
function nearestCell(point){
  const c=cell(point.x,point.z);if(traversable(c.i,c.j))return c;
  for(let r=1;r<9;r++)for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)if(traversable(c.i+i,c.j+j))return {i:c.i+i,j:c.j+j};
  return null;
}
function findPath(from,to) {
  const a=nearestCell(from),b=nearestCell(to);if(!a||!b)return [];
  const key=(i,j)=>`${i},${j}`,id0=key(a.i,a.j),target=key(b.i,b.j);
  const open=[{i:a.i,j:a.j,g:0,f:0}],best=new Map([[id0,0]]),parent=new Map();
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let expanded=0;
  while(open.length&&expanded++<4000){
    open.sort((a,b)=>a.f-b.f);const cur=open.shift(),k=key(cur.i,cur.j);
    if(cur.g>best.get(k)+.0001)continue;
    if(k===target){let p=k,path=[];while(p!==id0){const [i,j]=p.split(',').map(Number);path.push({x:i*GRID,z:j*GRID});p=parent.get(p);if(!p)break;}return path.reverse();}
    for(const [di,dj] of dirs){const i=cur.i+di,j=cur.j+dj;if(!traversable(i,j))continue;
      if(di&&dj&&(!traversable(cur.i+di,cur.j)||!traversable(cur.i,cur.j+dj)))continue;
      const nd=cur.g+(di&&dj?Math.SQRT2:1),nk=key(i,j);
      if(nd>=(best.get(nk)??Infinity))continue;
      best.set(nk,nd);parent.set(nk,k);
      open.push({i,j,g:nd,f:nd+Math.hypot(i-b.i,j-b.j)});
    }
  }
  return [];
}

const hero={x:0,z:7.3,heading:Math.PI,route:[],arrival:null};
let world=null,nearGuild=null,activeGame=null,toasting=null;
const keyDown=new Set();let touchDirection=null;
let startedDrag=null;

function navigateTo(target,arrival=null) {
  if(activeGame)return;
  const route=findPath(hero,target);
  if(!route.length){toast('There is no safe walking path to that location.');return;}
  hero.route=route;hero.arrival=arrival;
}
function travelTo(id) {
  if(id==='gate'){
    if(!PILLARS.every(p=>state.completed[p])){toast('Complete all four guilds to open the crystal gate.');navigateTo({x:0,z:-6.3});return;}
    navigateTo({x:0,z:-6.25},'gate');return;
  }
  const guild=GUILDS[id];if(!guild)return;
  navigateTo(guild.door,id);
  toast(`Walking to ${guild.title}…`);
}
function nearestGuild() {
  let result=null,nearest=3.4;
  for(const [id,guild] of Object.entries(GUILDS)){
    const d=distance(hero,guild.door);if(d<nearest){result=id;nearest=d;}
  }
  return result;
}
function tryMove(dx,dz) {
  if(!isBlocked(hero.x+dx,hero.z+dz)){hero.x+=dx;hero.z+=dz;return true;}
  let moved=false;
  if(!isBlocked(hero.x+dx,hero.z)){hero.x+=dx;moved=true;}
  if(!isBlocked(hero.x,hero.z+dz)){hero.z+=dz;moved=true;}
  return moved;
}
function updateHero(dt) {
  if(activeGame||!state.started)return false;
  let dx=0,dz=0;
  if(keyDown.has('w')||keyDown.has('arrowup')||touchDirection==='up')dz-=1;
  if(keyDown.has('s')||keyDown.has('arrowdown')||touchDirection==='down')dz+=1;
  if(keyDown.has('a')||keyDown.has('arrowleft')||touchDirection==='left')dx-=1;
  if(keyDown.has('d')||keyDown.has('arrowright')||touchDirection==='right')dx+=1;
  let walking=false;
  if(dx||dz){hero.route=[];hero.arrival=null;const len=Math.hypot(dx,dz);dx/=len;dz/=len;walking=tryMove(dx*dt*3.45,dz*dt*3.45);hero.heading=Math.atan2(dx,dz);}
  else if(hero.route.length){
    const next=hero.route[0],x=next.x-hero.x,z=next.z-hero.z,d=Math.hypot(x,z);
    if(d<.10){hero.route.shift();if(!hero.route.length&&hero.arrival){const go=hero.arrival;hero.arrival=null;if(go==='gate')openGate();else openGuild(go);}}
    else {const speed=Math.min(3.8*dt,d);walking=tryMove(x/d*speed,z/d*speed);hero.heading=Math.atan2(x,z);if(!walking){hero.route=[];hero.arrival=null;}}
  }
  const nearby=nearestGuild();if(nearby!==nearGuild){nearGuild=nearby;$('#nearPrompt').hidden=!nearby;$('#nearPrompt').textContent=nearby?`Press E to enter ${GUILDS[nearby].title}`:'';}
  return walking;
}
function updateLabels(){
  const ids={mapLabelPlan:'plan',mapLabelSave:'save',mapLabelInvest:'invest',mapLabelSafe:'safe',mapLabelGate:'gate'};
  for(const [label,id] of Object.entries(ids)){
    const point=id==='gate'?{x:0,z:-8.15,y:5.15}:{x:GUILDS[id].x,z:GUILDS[id].z,y:5.9};
    const screen=world.project(point.x,point.y,point.z),element=document.getElementById(label);
    if(!screen||screen.hidden){element.style.display='none';continue;}
    element.style.display='flex';element.style.left=screen.x+'px';element.style.top=screen.y+'px';
  }
}
function updateHud(){
  const count=PILLARS.filter(p=>state.completed[p]).length;
  const amount=4000+PILLARS.reduce((sum,p)=>sum+(state.completed[p]?.contribution||0),0);
  $('#money').textContent=`${formatMoney(amount)} / ₹30,000`;
  $('#progressFraction').textContent=`${count} / 4`;
  $('#progressFill').style.width=(count*25)+'%';
  $('#happyValue').textContent=state.happy;
  $('#happinessFill').style.width=state.happy+'%';
  $('#moodFace').textContent=state.happy>=60?'☺':state.happy>=35?'•':'☹';
  $$('.crystal').forEach(el=>el.classList.toggle('lit',!!state.completed[el.dataset.pillar]));
  $$('[data-check]').forEach(el=>{const complete=!!state.completed[el.dataset.check];el.classList.toggle('done',complete);el.textContent=complete?'✓':'↗';});
  $('#restBtn').disabled=!state.restAvailable;
  $('#restBtn').innerHTML=state.restAvailable?'☕ &nbsp;Take a break &nbsp;<span>+5 wellbeing</span>':'☕ &nbsp;Rest used this session';
}
function toast(message) {
  const el=$('#toast');el.textContent=message;el.classList.add('show');
  clearTimeout(toasting);toasting=setTimeout(()=>el.classList.remove('show'),2700);
}
function openGate() {
  if(!PILLARS.every(p=>state.completed[p])){toast('Four glowing crystals are needed to unlock the gate.');return;}
  $('#gameEyebrow').textContent='✧ CHAPTER ONE COMPLETE';
  $('#gameTitle').textContent='Crystal Harbour is restored!';
  $('#gameIntro').textContent='Your financial decisions have powered all four guild crystals. You are ready to explore the next horizon.';
  $('#gameBody').innerHTML=`<div class="results"><div class="result-crystal">✦</div><h3>Congratulations, ${escapeHtml(state.name)}!</h3><p>You practiced planning, saving, investing judgement and scam safety. Remember: learning beats luck.</p><button type="button" class="primary-button" id="returnWorld">RETURN TO HARBOUR</button></div>`;
  $('#gameOverlay').classList.remove('hidden');activeGame={id:'gate'};
  $('#returnWorld').addEventListener('click',closeGame);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function openGuild(id) {
  if(!GUILDS[id])return;
  const guild=GUILDS[id];hero.route=[];hero.arrival=null;
  activeGame={id,step:0,score:0,happiness:0};
  $('#gameEyebrow').textContent=`✧ ${guild.subtitle}`;
  $('#gameTitle').textContent=guild.title;
  $('#gameIntro').textContent=guild.intro;
  $('#gameOverlay').classList.remove('hidden');
  showStep();
}
function showStep(){
  if(!activeGame||activeGame.id==='gate')return;
  const guild=GUILDS[activeGame.id],step=guild.steps[activeGame.step];
  if(!step){completeGame();return;}
  const container=$('#gameBody');
  container.innerHTML=`<div class="game-step"><div class="round-counter">SCENARIO ${activeGame.step+1} / ${guild.steps.length} &nbsp; · &nbsp; MADE-UP NUMBERS, REAL-LIFE LESSONS</div><div class="question">${escapeHtml(step.q)}</div><div class="game-options">${step.options.map((option,i)=>`<button class="option-button" type="button" data-answer="${i}">${escapeHtml(option[0])}</button>`).join('')}</div><div id="answerFeedback"></div></div>`;
  $$('[data-answer]').forEach(el=>el.addEventListener('click',()=>chooseAnswer(Number(el.dataset.answer))));
}
function chooseAnswer(index){
  const game=activeGame;if(!game||game.answered)return;
  const step=GUILDS[game.id].steps[game.step],answer=step.options[index];if(!answer)return;
  game.answered=true;game.score+=answer[1];game.happiness+=answer[2];
  $$('[data-answer]').forEach(el=>{el.disabled=true;if(Number(el.dataset.answer)===index)el.classList.add('selected');});
  const good=answer[1]>=70;
  $('#answerFeedback').innerHTML=`<div class="feedback"><strong>${good?'✦ Wise decision!':'✧ A lesson learned'}</strong><p>${escapeHtml(answer[3])}</p><button type="button" class="primary-button" id="nextQuestion">${game.step===2?'SEE MY RESULT':'NEXT SCENARIO'} &nbsp; →</button></div>`;
  $('#nextQuestion').addEventListener('click',()=>{game.step++;game.answered=false;showStep();});
}
function completeGame(){
  const game=activeGame,guild=GUILDS[game.id];if(!game)return;
  const score=Math.round(game.score/guild.steps.length),passed=score>=50;
  const before=!!state.completed[game.id];
  state.happy=clamp(state.happy+clamp(game.happiness,-12,12)-5,10,100);
  state.played[game.id]=Math.max(state.played[game.id]||0,score);
  state.restAvailable=true;
  if(passed){
    const factor=state.happy>=60?1:state.happy>=35?.75:.5;
    const old=state.completed[game.id]?.contribution||0;
    state.completed[game.id]={score:Math.max(state.completed[game.id]?.score||0,score),contribution:Math.max(old,Math.round((30000-4000)/4*factor))};
  }
  saveState();updateHud();if(world)world.rebuild();
  const stars=score>=85?'★★★':score>=60?'★★':passed?'★':'☆';
  $('#gameBody').innerHTML=`<div class="results"><div class="result-crystal">${passed?'◆':'◇'}</div><h3>${passed?'Guild crystal activated!':'Try a different strategy'}</h3><div class="result-score">${stars} &nbsp; ${score}/100 JUDGEMENT</div><p>${passed?'The guild is powered by thoughtful decisions. Your wellbeing influences how brightly its crystal shines.':'You can replay the guild to learn from each choice. No money is lost for a retry.'}</p><p>${before?'Your best previous progress is protected.':''}</p><div class="result-actions"><button type="button" class="secondary-button" id="againGame">PLAY AGAIN</button><button type="button" class="primary-button" id="returnWorld">BACK TO THE ISLAND</button></div></div>`;
  $('#againGame').addEventListener('click',()=>openGuild(game.id));
  $('#returnWorld').addEventListener('click',()=>{closeGame();if(passed&&PILLARS.every(p=>state.completed[p]))toast('All four crystals are lit! Visit the Crystal Gate.');});
}
function closeGame(){activeGame=null;$('#gameOverlay').classList.add('hidden');}
function takeRest(){
  if(!state.restAvailable)return toast('Play a guild challenge before resting again.');
  const previous=state.happy;state.happy=clamp(state.happy+5,10,100);state.restAvailable=false;
  saveState();updateHud();toast(`A quiet moment by the harbour. Wellbeing +${state.happy-previous}.`);
}
function setupUI() {
  let avatarChoice=state.avatar;
  $$('.avatar-option').forEach(el=>el.addEventListener('click',()=>{
    avatarChoice=el.dataset.avatar;
    $$('.avatar-option').forEach(card=>{const active=card.dataset.avatar===avatarChoice;card.classList.toggle('active',active);card.setAttribute('aria-pressed',String(active));});
  }));
  $('#startBtn').addEventListener('click',()=>{
    state.started=true;state.avatar=avatarChoice;
    state.name=$('#playerName').value.trim().slice(0,20)||'Explorer';
    saveState();$('#welcome').classList.add('hidden');updateHud();
    toast(`Welcome to Crystal Harbour, ${state.name}! Pick a guild to explore.`);
  });
  $('#playerName').addEventListener('keydown',e=>{if(e.key==='Enter')$('#startBtn').click();});
  if(state.started){$('#welcome').classList.add('hidden');}
  $$('.quest-card, .map-label').forEach(el=>el.addEventListener('click',()=>travelTo(el.dataset.travel)));
  $('#restBtn').addEventListener('click',takeRest);
  $('#closeGame').addEventListener('click',closeGame);
  $('#gameOverlay').addEventListener('click',e=>{if(e.target===$('#gameOverlay'))closeGame();});
  $('#zoomIn').addEventListener('click',()=>world.zoom=clamp(world.zoom*.87,.6,1.65));
  $('#zoomOut').addEventListener('click',()=>world.zoom=clamp(world.zoom*1.14,.6,1.65));
  $('#rotateLeft').addEventListener('click',()=>world.yaw-=Math.PI/8);
  $('#rotateRight').addEventListener('click',()=>world.yaw+=Math.PI/8);
  $('#resetBtn').addEventListener('click',()=>$('#confirmOverlay').classList.remove('hidden'));
  $('#cancelReset').addEventListener('click',()=>$('#confirmOverlay').classList.add('hidden'));
  $('#confirmReset').addEventListener('click',()=>{localStorage.removeItem(SAVE_KEY);location.reload();});
  window.addEventListener('keydown',e=>{
    const tag=document.activeElement?.tagName?.toLowerCase();
    if(tag==='input'||tag==='textarea')return;
    const key=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e','escape'].includes(key))e.preventDefault();
    keyDown.add(key);
    if(key==='escape'&&activeGame)closeGame();
    if(key==='e'&&nearGuild&&!activeGame&&state.started)openGuild(nearGuild);
  });
  window.addEventListener('keyup',e=>keyDown.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keyDown.clear();touchDirection=null;});
  $$('.touch-controls [data-dir]').forEach(el=>{
    el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);touchDirection=el.dataset.dir;});
    el.addEventListener('pointerup',()=>touchDirection=null);
    el.addEventListener('pointercancel',()=>touchDirection=null);
    el.addEventListener('lostpointercapture',()=>touchDirection=null);
  });
  const canvas=world.canvas;
  canvas.addEventListener('pointerdown',e=>{
    if(!state.started||activeGame)return;
    canvas.setPointerCapture(e.pointerId);
    startedDrag={x:e.clientX,y:e.clientY,prevX:e.clientX,prevY:e.clientY,dragging:false};
  });
  canvas.addEventListener('pointermove',e=>{
    if(!startedDrag)return;
    const d=Math.hypot(e.clientX-startedDrag.x,e.clientY-startedDrag.y);
    if(d>7)startedDrag.dragging=true;
    if(startedDrag.dragging){world.yaw+=(e.clientX-startedDrag.prevX)*.009;world.elevation=clamp(world.elevation+(e.clientY-startedDrag.prevY)*.008,.35,1.35);}
    startedDrag.prevX=e.clientX;startedDrag.prevY=e.clientY;
  });
  canvas.addEventListener('pointerup',e=>{
    if(!startedDrag)return;
    const drag=startedDrag;startedDrag=null;
    if(drag.dragging)return;
    const target=world.pointOnGround(e.clientX,e.clientY);if(!target)return;
    if(Math.hypot(target.x,target.z+8.15)<2.0){travelTo('gate');return;}
    for(const [id,guild] of Object.entries(GUILDS)){
      if(distance(target,guild)<2.85){travelTo(id);return;}
    }
    navigateTo(target);
  });
  canvas.addEventListener('pointercancel',()=>startedDrag=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();world.zoom=clamp(world.zoom*(e.deltaY>0?1.09:.92),.6,1.65);},{passive:false});
  updateHud();
}

function boot(){
  try {world=new WebGLWorld($('#world'));}
  catch(error){
    console.warn('WebGL unavailable; running 2D concept-art fallback.',error);
    try {world=new FallbackWorld($('#world'));}
    catch(fallbackError){console.error(fallbackError);$('#unsupported').classList.remove('hidden');return;}
  }
  setupUI();let prev=performance.now();
  function frame(t){
    const dt=Math.min((t-prev)/1000,.050);prev=t;
    const walking=updateHero(dt);
    // Smooth camera follows as the character walks, retaining independent orbit controls.
    const factor=1-Math.exp(-3*dt);
    world.center.x+=(hero.x*.49-world.center.x)*factor;
    world.center.z+=(hero.z*.49-world.center.z)*factor;
    world.updateAvatar(hero,walking,t/1000);
    world.render();updateLabels();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
boot();
