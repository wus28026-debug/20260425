let treasureChest;
let pearls = [];
let keyTreasure;
let bagTreasure;
let rocks = [];
let seaweeds = []; // 晃動的水草
let jellyfish = []; // 透明水母

// 孢子粒子類別
class Spore {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.3, 0.3), random(-0.5, -1.2));
    this.color = col;
    this.lifespan = 255;
    this.size = random(2, 4);
    this.noiseOff = random(1000);
  }

  update() {
    this.pos.add(this.vel);
    this.pos.x += sin(frameCount * 0.05 + this.noiseOff) * 0.5; // 水中漂浮感
    this.lifespan -= 1.5;
  }

  display() {
    push();
    noStroke();
    let c = color(red(this.color), green(this.color), blue(this.color), this.lifespan);
    fill(c);
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = c;
    circle(this.pos.x, this.pos.y, this.size);
    pop();
  }

  isDead() { return this.lifespan < 0; }
}

// 透明水母類別
class Jellyfish {
  constructor() {
    this.reset();
    this.y = random(height); // 初始時隨機高度
  }

  reset() {
    this.x = random(width);
    this.y = height + 150;
    this.size = random(15, 30); // 縮小水母尺寸
    this.pulseOffset = random(TWO_PI);
    this.speed = random(0.4, 0.8);
    this.noiseSeed = random(1000);

    // 初始化每條觸手的獨特屬性，使其長短不一且擺動不規則
    this.tentacleData = [];
    for (let i = 0; i < 5; i++) {
      this.tentacleData.push({
        xRatio: map(i, 0, 4, -0.4, 0.4), // 觸手在傘下的分佈位置
        lenMult: random(0.7, 2.0),       // 隨機長度倍率
        noiseOff: random(1000)           // 每條觸手獨立的噪音偏移
      });
    }
  }

  update() {
    let pulse = sin(frameCount * 0.03 + this.pulseOffset);
    // 向上脈動：收縮時向上移動較快
    let moveUp = map(pulse, -1, 1, 0.1, 1.2);
    this.y -= this.speed * moveUp;
    
    // 水平隨機漂移 (Perlin Noise)
    this.x += (noise(frameCount * 0.01, this.noiseSeed) - 0.5) * 1.5;

    // 超出邊界重置至底部
    if (this.y < -150) this.reset();
    if (this.x < -100) this.x = width + 100;
    if (this.x > width + 100) this.x = -100;
  }

  display() {
    push();
    translate(this.x, this.y);
    let pulse = map(sin(frameCount * 0.03 + this.pulseOffset), -1, 1, 0.8, 1.1);
    
    // 讓顏色與發光效果隨脈動從透明過渡到發光
    let bodyAlpha = map(pulse, 0.8, 1.1, 15, 130);       // 身體透明度：從極透到半透
    let currentShadowBlur = map(pulse, 0.8, 1.1, 5, 55);   // 光暈範圍：從微弱到擴散
    let currentShadowAlpha = map(pulse, 0.8, 1.1, 0, 255); // 發光強度：從無到全開

    noStroke();
    // 傘狀體 (Bell) - 顏色與發光隨脈動動態變化
    fill(255, 240, 150, bodyAlpha); 
    drawingContext.shadowBlur = currentShadowBlur;
    drawingContext.shadowColor = color(255, 215, 0, currentShadowAlpha);

    beginShape();
    for (let a = PI; a <= TWO_PI; a += 0.2) {
      let rX = (this.size * 0.8) * pulse;
      let rY = (this.size * 0.5) / pulse;
      vertex(cos(a) * rX, sin(a) * rY);
    }
    // 傘狀體底部邊緣
    for (let a = TWO_PI; a >= PI; a -= 0.4) {
      let rX = (this.size * 0.8) * pulse;
      let rY = sin(frameCount * 0.1 + a * 8) * 4;
      vertex(cos(a) * rX, rY);
    }
    endShape(CLOSE);

    // 觸手 (Tentacles)
    stroke(255, 230, 150, bodyAlpha * 0.5); // 觸手同步透明度變化，保持更輕盈的質感
    strokeWeight(1);
    noFill();
    for (let t of this.tentacleData) {
      let xStart = t.xRatio * this.size;
      beginShape();
      curveVertex(xStart, 0);
      curveVertex(xStart, 0);
      
      let segments = 6;
      for (let j = 1; j <= segments; j++) {
        // y 座標受長度倍率影響
        let ty = j * (this.size * 0.3) * t.lenMult; 
        // x 座標擺動改用 noise 實現不規則動態，並受脈動感 (pulse) 放大
        let noiseVal = noise(t.noiseOff + j * 0.2 + frameCount * 0.02);
        let tx = xStart + (noiseVal - 0.5) * 20 * pulse;
        curveVertex(tx, ty);
      }
      endShape();
    }

    pop();
  }
}

let fishes = []; // 多樣化的魚群
let coralsBack = [];  // 後方珊瑚 (最遠)
let coralsMid = [];   // 中間珊瑚 (岩石間)
let coralsFront = []; // 前方珊瑚 (最近)
let crabs = [];  // 底棲螃蟹
let coins = []; // 存放金幣特效
let bgBubbles = []; // 背景裝飾氣泡
let assignments = [
  { week: "week1", url: "https://wus28026-debug.github.io/20260223/" },
  { week: "week2", url: "https://wus28026-debug.github.io/20260302/" },
  { week: "week3", url: "https://wus28026-debug.github.io/20260309-1-/" },
  { week: "week4", url: "https://wus28026-debug.github.io/20260316/" },
  { week: "week5", url: "https://wus28026-debug.github.io/20260323/" },
  { week: "week6", url: "https://wus28026-debug.github.io/20260330/" },
  { week: "week7", url: "https://wus28026-debug.github.io/20260406/" },
  { week: "week8", url: "https://wus28026-debug.github.io/20260420/" }
];
let myIframe;
let closeBtn;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1'); // 讓畫布背景化

  // 初始化背景氣泡
  for (let i = 0; i < 80; i++) {
    bgBubbles.push(new RisingBubble(true));
  }

  // 初始化水母
  for (let i = 0; i < 5; i++) {
    jellyfish.push(new Jellyfish());
  }

  // 初始化水草：調整數量以限制重疊不超過兩層
  for (let i = 0; i < 30; i++) {
    seaweeds.push(new Seaweed(random(width), height + 10));
  }

  // 初始化魚群
  for (let i = 0; i < 6; i++) {
    fishes.push(new Fish());
  }

  // 初始化珊瑚：將 Y 座標固定以排成直線，並透過隨機 X 座標使其分散
  for (let i = 0; i < 8; i++) coralsBack.push(new Coral(random(width), height - 15));
  for (let i = 0; i < 6; i++) coralsMid.push(new Coral(random(width), height - 15));
  for (let i = 0; i < 4; i++) coralsFront.push(new Coral(random(width), height - 15));

  // 初始化螃蟹
  for (let i = 0; i < 3; i++) {
    crabs.push(new Crab());
  }

  // 初始化岩石（均為小塊，限制堆疊高度不超過兩層）
  for (let i = 0; i < 100; i++) {
    rocks.push(new Rock(random(width), height - random(5, 25)));
  }

  // 初始化單個大型寶藏箱（位於右下角）
  treasureChest = new BigTreasureChest(width - 180, height - 60);

  // 初始化特殊寶物 (鑰匙與錢袋)
  // 當滑鼠按下鑰匙圖案則連結到 week 1，錢袋連結到 week 2
  keyTreasure = new TreasureItem(width - 260, height - 160, "https://hackmd.io/@BaN-RevzTta1yPjQLaJ-Ew/SJPaFLvjbg", "key");
  bagTreasure = new TreasureItem(width - 100, height - 160, "https://hackmd.io/@BaN-RevzTta1yPjQLaJ-Ew/S1dP4AFnbl", "bag");

  // 初始化珍珠
  for (let i = 0; i < assignments.length; i++) {
    let posX = (i + 1) * (width / (assignments.length + 1)); 
    // 初始化作品珍珠
    let bubbleY = (i % 2 === 0) ? height * 0.35 : height * 0.45; // 交錯排列
    pearls.push(new Pearl(posX, bubbleY, assignments[i]));
  }

  // 建立 iframe 元素
  myIframe = createElement('iframe');
  myIframe.position(width * 0.05, height * 0.05); // 放大至 90%
  myIframe.size(width * 0.9, height * 0.9);
  myIframe.style('border', '2px solid white');
  myIframe.style('border-radius', '10px');
  myIframe.style('display', 'none'); // 初始隱藏

  // 建立關閉按鈕
  closeBtn = createButton('✕');
  closeBtn.position(width * 0.95 - 45, height * 0.05 + 15); // 配合 90% 視窗位置
  closeBtn.style('background-color', '#ff4d4d');
  closeBtn.style('color', 'white');
  closeBtn.style('border', 'none');
  closeBtn.style('border-radius', '50%');
  closeBtn.style('width', '35px');
  closeBtn.style('height', '35px');
  closeBtn.style('cursor', 'pointer');
  closeBtn.style('font-weight', 'bold');
  closeBtn.style('font-size', '18px');
  closeBtn.style('display', 'none'); // 初始隱藏
  closeBtn.style('z-index', '1000');
  closeBtn.mousePressed(() => {
    myIframe.style('display', 'none');
    closeBtn.style('display', 'none');
  });
}

function draw() {
  // 繪製從淺藍到深藍的漸層背景
  drawGradient();
  
  // 繪製水面透光效果
  drawLightRays();

  // 繪製背景裝飾氣泡
  for (let b of bgBubbles) {
    b.update();
    b.display();
  }

  // 繪製水母 (置於背景泡泡之後)
  for (let jf of jellyfish) {
    jf.update();
    jf.display();
  }
  
  // 1. 繪製最遠處的珊瑚
  for (let c of coralsBack) c.display();

  // 繪製水草
  for (let s of seaweeds) s.display();

  // 繪製魚群
  for (let f of fishes) {
    f.update();
    f.display();
  }

  // 更新與繪製金幣特效
  for (let i = coins.length - 1; i >= 0; i--) {
    coins[i].update(rocks);
    coins[i].display();
    if (coins[i].isDead()) {
      coins.splice(i, 1);
    }
  }

  // 2. 繪製岩石與地基
  for (let r of rocks) {
    r.display();
  }

  // 3. 繪製中間層珊瑚 (穿插在岩石中)
  for (let c of coralsMid) c.display();

  // 繪製螃蟹
  for (let cr of crabs) {
    cr.update();
    cr.display();
  }

  // 4. 繪製最前方珊瑚 (可能遮擋寶箱邊緣)
  for (let c of coralsFront) c.display();

  // 顯示大寶藏箱
  treasureChest.display();
  
  // 當寶箱蓋子打開到一定程度時顯示寶物與金幣
  if (treasureChest.currentLidAngle > PI / 10) {
    if (treasureChest.isOpen && frameCount % 2 === 0) {
      treasureChest.spawnCoin(); 
    }

    // 繪製提示文字
    push();
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(20);
    text("選擇寶物", width - 180, height - 230);
    pop();

    keyTreasure.display();
    bagTreasure.display();
  }

  // 更新與顯示珍珠
  for (let p of pearls) {
    p.float();
    p.display();
  }
}

// 繪製背景漸層
function drawGradient() {
  let topColor = color(180, 235, 255);  // 更淺、更透亮的上方藍色
  let bottomColor = color(5, 20, 50);   // 下方深藍
  
  for (let y = 0; y <= height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(topColor, bottomColor, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

// 繪製透光效果 (光束)
function drawLightRays() {
  push();
  noStroke();
  // 計算滑鼠的影響位移
  let mouseShift = map(mouseX, 0, width, -width * 0.2, width * 0.2);

  // 產生 5 條動態光束
  for (let i = 0; i < 5; i++) {
    // 結合 Noise 與滑鼠位移
    let xOffset = (noise(frameCount * 0.002, i * 100) * width) + mouseShift; // 減慢水平擺動速度
    let rayWidth = noise(frameCount * 0.001, i * 50) * 150 + 70; // 縮小基礎寬度與縮放速度
    
    // 呼吸感透明度
    let alpha = map(noise(frameCount * 0.005, i * 20), 0, 1, 10, 35); // 減慢閃爍頻率並稍微降低最大亮度
    fill(255, 255, 255, alpha);
    
    beginShape();
    // 光束從上方散開到下方的比例稍微收斂
    vertex(xOffset, 0);
    vertex(xOffset + rayWidth, 0);
    vertex(xOffset + rayWidth * 1.5, height); 
    vertex(xOffset - rayWidth * 0.5, height);
    endShape(CLOSE);
  }
  pop();
}

// 多樣化的魚類別
class Fish {
  constructor() {
    this.init();
  }

  init() {
    this.dir = random() > 0.5 ? 1 : -1;
    this.pos = createVector(this.dir === 1 ? -100 : width + 100, random(50, height * 0.7));
    this.vel = createVector(random(0.8, 2.2) * this.dir, 0);
    this.size = random(0.6, 1.1);
    
    // 隨機選擇魚的種類 (0: 神仙魚, 1: 流線魚, 2: 圓肚魚)
    this.type = floor(random(3)); 
    
    // 精緻色彩配置
    let colors = [
      { main: color(255, 100, 50), accent: color(255, 200, 50) }, // 橘黃
      { main: color(50, 150, 255), accent: color(200, 255, 255) }, // 藍白
      { main: color(200, 50, 250), accent: color(100, 255, 200) }, // 紫綠
      { main: color(255, 255, 100), accent: color(50, 50, 50) }    // 黃黑
    ];
    let palette = random(colors);
    this.mainColor = palette.main;
    this.accentColor = palette.accent;
    
    this.noiseOff = random(1000);
  }

  update() {
    this.pos.add(this.vel);
    this.pos.y += map(noise(this.noiseOff + frameCount * 0.01), 0, 1, -1, 1);
    
    // 邊界檢查：游出畫面後重新初始化
    if (this.dir === 1 && this.pos.x > width + 150) {
      this.init();
    } else if (this.dir === -1 && this.pos.x < -150) {
      this.init();
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    // 根據游動方向水平翻轉，並套用大小
    scale(this.dir === -1 ? -this.size : this.size, this.size);
    
    let wiggleSpeed = abs(this.vel.x) * 0.15;
    let tailWiggle = sin(frameCount * wiggleSpeed) * 8;

    noStroke();
    
    if (this.type === 0) { // 型態 A: 神仙魚
      fill(this.mainColor);
      triangle(-10, -15, 5, -30, 15, -10); // 背鰭
      triangle(-10, 15, 5, 30, 15, 10);  // 腹鰭
      beginShape(); // 魚尾
      vertex(-15, 0);
      vertex(-30 + tailWiggle, -20);
      vertex(-30 + tailWiggle, 20);
      endShape(CLOSE);
      ellipse(0, 0, 45, 35); // 身體
      fill(this.accentColor); // 條紋花紋
      rect(-5, -15, 4, 30, 2);
      rect(5, -12, 3, 24, 2);
    } else if (this.type === 1) { // 型態 B: 流線魚
      fill(this.mainColor);
      beginShape(); // 魚尾
      vertex(-20, 0);
      vertex(-35 + tailWiggle, -12);
      vertex(-35 + tailWiggle, 12);
      endShape(CLOSE);
      ellipse(0, 0, 60, 22); // 身體
      fill(this.accentColor); // 側鰭與斑點
      triangle(0, 0, -10, -12, -15, -5);
      circle(-10, 2, 4);
      circle(2, -3, 3);
    } else { // 型態 C: 圓肚魚
      fill(this.mainColor);
      beginShape(); // 魚尾
      vertex(-15, 0);
      vertex(-25 + tailWiggle, -15);
      vertex(-25 + tailWiggle, 15);
      endShape(CLOSE);
      ellipse(0, 0, 42, 42); // 身體
      fill(this.accentColor);
      arc(0, -15, 25, 20, PI, TWO_PI); // 大背鰭
    }
    
    // 眼睛 (通用)
    fill(255);
    circle(15, -5, 8);
    fill(0);
    circle(17, -5, 4);
    fill(255, 200);
    circle(18, -7, 2); // 眼睛高光
    
    pop();
  }
}

// 珊瑚類別
class Coral {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.h = random(40, 90);
    this.seed = random(1000);
    this.spores = []; // 存放該珊瑚釋放的孢子

    // 鮮豔的海底色調：珊瑚紅、淺鮭魚、李子紫、粉紅、中紫
    let palettes = [
      color(255, 111, 97, 200),  
      color(255, 160, 122, 200), 
      color(221, 160, 221, 200), 
      color(255, 192, 203, 200), 
      color(147, 112, 219, 200)  
    ];
    this.color = random(palettes);

    // 生成分枝數據
    this.numBranches = floor(random(3, 6));
    this.branches = [];
    for (let i = 0; i < this.numBranches; i++) {
      let angle = map(i, 0, this.numBranches - 1, -PI * 0.75, -PI * 0.25);
      let len = this.h * (0.6 + random(0.4));
      
      // 為每個主分枝生成次要小分枝
      let subBranches = [];
      let numSubs = floor(random(1, 3));
      for (let j = 0; j < numSubs; j++) {
        subBranches.push({
          pos: random(0.4, 0.8), // 在主分枝上的位置百分比
          angleOff: random(-PI / 5, PI / 5),
          len: len * random(0.3, 0.5)
        });
      }
      this.branches.push({ angle, len, subBranches, swayOffset: random(TWO_PI) });
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    strokeCap(ROUND);
    noFill();
    
    for (let b of this.branches) {
      // 模擬水流擺動
      let currentSway = sin(frameCount * 0.02 + this.seed + b.swayOffset) * 10;
      stroke(this.color);
      strokeWeight(map(b.len, 20, 90, 3, 7));
      
      let tipX = cos(b.angle) * b.len + currentSway;
      let tipY = sin(b.angle) * b.len;
      
      // 繪製主分枝
      line(0, 0, tipX, tipY);

      // 繪製次要分枝
      for (let sb of b.subBranches) {
        let startX = tipX * sb.pos;
        let startY = tipY * sb.pos;
        let subAngle = b.angle + sb.angleOff;
        let subTipX = startX + cos(subAngle) * sb.len + currentSway * 0.3;
        let subTipY = startY + sin(subAngle) * sb.len;
        
        strokeWeight(map(sb.len, 5, 45, 1.5, 4));
        line(startX, startY, subTipX, subTipY);

        // 隨機產生孢子 (從次要分枝末端釋放)
        if (random(1) < 0.005) {
          this.spores.push(new Spore(this.x + subTipX, this.y + subTipY, this.color));
        }
        
        // 分枝末端的小白點裝飾 (模擬珊瑚蟲)
        stroke(255, 255, 255, 150);
        strokeWeight(2);
        point(subTipX, subTipY);
        stroke(this.color);
      }
      
      // 主分枝末端釋放孢子
      if (random(1) < 0.005) {
        this.spores.push(new Spore(this.x + tipX, this.y + tipY, this.color));
      }
    }
    pop();

    // 更新並繪製該珊瑚產生的孢子
    for (let i = this.spores.length - 1; i >= 0; i--) {
      this.spores[i].update();
      this.spores[i].display();
      if (this.spores[i].isDead()) this.spores.splice(i, 1);
    }
  }
}

// 螃蟹類別
class Crab {
  constructor() {
    this.x = random(width);
    this.y = height - 15;
    this.speed = random(0.5, 1.5);
    this.dir = random() > 0.5 ? 1 : -1;
    this.w = 30;
    this.waitTimer = 0;
  }

  update() {
    if (this.waitTimer > 0) {
      this.waitTimer--;
    } else {
      this.x += this.speed * this.dir;
      if (this.x < 50 || this.x > width - 50) this.dir *= -1;
      
      // 偶爾停下來
      if (random(1) < 0.01) this.waitTimer = floor(random(30, 90));
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    fill(200, 50, 50);
    noStroke();
    
    // 腳的動畫
    let legMove = (this.waitTimer === 0) ? sin(frameCount * 0.2) * 3 : 0;
    
    stroke(180, 40, 40);
    strokeWeight(2);
    // 左腳
    line(-15, 0, -20 - legMove, 5);
    line(-12, 0, -18 - legMove, 5);
    // 右腳
    line(15, 0, 20 + legMove, 5);
    line(12, 0, 18 + legMove, 5);
    
    // 身體
    noStroke();
    ellipse(0, 0, this.w, 18);
    
    // 眼睛
    fill(255);
    circle(-6, -8, 5);
    circle(6, -8, 5);
    fill(0);
    circle(-6, -9, 2);
    circle(6, -9, 2);
    
    // 螯
    fill(200, 50, 50);
    push();
    rotate(legMove * 0.05);
    ellipse(-18, -5, 12, 8);
    pop();
    push();
    rotate(-legMove * 0.05);
    ellipse(18, -5, 12, 8);
    pop();
    
    pop();
  }
}

// 精緻大型寶藏箱類別
class BigTreasureChest {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 140;
    this.h = 90;
    this.isOpen = false;
    this.currentLidAngle = 0; // 用於平滑動畫
  }

  display() {
    // 動態更新角度
    let targetAngle = this.isOpen ? PI / 1.5 : 0; // 改為正值，從右側支點順時針旋轉開啟
    this.currentLidAngle = lerp(this.currentLidAngle, targetAngle, 0.1);

    push();
    translate(this.x, this.y);
    rotate(PI / 10); // 往右邊傾斜

    // 2. 箱體本體
    fill(101, 67, 33);
    stroke(50, 30, 10);
    strokeWeight(3);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 5);

    // 3. 箱蓋（鉸鏈在右側，向左上開啟）
    push();
    translate(this.w / 2, -this.h / 2); // 移動到右上的鉸鏈支點
    rotate(this.currentLidAngle);
    
    fill(139, 69, 19); 
    stroke(50, 30, 10);
    arc(-this.w / 2, 0, this.w, 80, PI, TWO_PI, CHORD); // 中心點改為向左偏移
    
    // 蓋子的金邊裝飾
    noFill();
    stroke(255, 215, 0, 180);
    strokeWeight(4);
    arc(-this.w / 2, 0, this.w * 0.8, 60, PI, TWO_PI);
    pop();

    // 4. 正面飾條與鎖扣
    fill(255, 215, 0);
    noStroke();
    rect(0, -5, 12, 15, 2);
    
    stroke(255, 215, 0, 150);
    strokeWeight(6);
    line(-this.w/2 + 20, -this.h/2, -this.w/2 + 20, this.h/2);
    line(this.w/2 - 20, -this.h/2, this.w/2 - 20, this.h/2);
    
    pop();
  }

  isClicked(mx, my) {
    return mx > this.x - this.w / 2 && mx < this.x + this.w / 2 &&
           my > this.y - this.h / 2 && my < this.y + this.h / 2;
  }

  spawnCoin() {
    // 從寶箱中央噴發
    coins.push(new Coin(this.x, this.y - 30));
  }
}

// 寶物類別 (鑰匙與錢袋)
class TreasureItem {
  constructor(x, y, url, type) {
    this.x = x;
    this.y = y;
    this.url = url;
    this.type = type;
    this.size = 50;
  }

  display() {
    push();
    // 懸浮動畫
    let hover = sin(frameCount * 0.05) * 10;
    translate(this.x, this.y + hover);
    
    if (this.type === "key") {
      // 繪製鑰匙圖案
      stroke(212, 175, 55);
      strokeWeight(2);
      fill(255, 215, 0);
      ellipse(0, -15, 20, 20); // 鑰匙孔
      fill(10, 30, 60);
      ellipse(0, -15, 8, 8);
      fill(255, 215, 0);
      rectMode(CENTER);
      rect(0, 5, 6, 30); // 鑰匙身
      rect(6, 10, 8, 4); // 鑰匙齒
      rect(6, 18, 8, 4);
    } else {
      // 繪製錢袋圖案
      stroke(100, 60, 20);
      strokeWeight(2);
      fill(139, 69, 19);
      ellipse(0, 5, 40, 45); // 袋身
      fill(160, 82, 45);
      ellipse(0, -15, 25, 15); // 袋口
      fill(255, 215, 0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(18);
      text("$", 0, 5);
    }
    pop();
  }

  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }
}

// 精美金幣粒子類別
class Coin {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-2.5, 2.5), random(-5, -10)); // 減慢噴發速度
    this.acc = createVector(0, 0.15); // 降低重力效果，讓下墜感更輕盈
    this.lifespan = 255;
    this.size = random(12, 18);
    this.spinSpeed = random(0.1, 0.2);
  }

  update(rocks) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 2;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // 模擬 3D 旋轉效果
    let spin = sin(frameCount * this.spinSpeed);
    scale(spin, 1);

    // 金幣主體與金屬邊框
    stroke(180, 120, 0, this.lifespan);
    strokeWeight(1);
    fill(255, 220, 50, this.lifespan);
    ellipse(0, 0, this.size, this.size);
    
    // 內部裝飾符號與高光
    stroke(255, 255, 255, this.lifespan * 0.5);
    noFill();
    ellipse(0, 0, this.size * 0.65, this.size * 0.65);
    fill(255, 255, 255, this.lifespan * 0.3);
    noStroke();
    rect(0, 0, this.size * 0.2, this.size * 0.4); // 模擬錢幣中間的孔或浮雕
    
    pop();
  }

  isDead() {
    return this.lifespan < 0 || this.pos.y > height;
  }
}

// 岩石類別
class Rock {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // 均為小塊石頭
    let sizeBase = random(12, 25);
    this.w = sizeBase;
    this.h = sizeBase * random(0.6, 0.9);
    
    this.rotation = random(TWO_PI); // 隨機旋轉
    this.seed = random(100);
    let gray = random(60, 100);
    // 增加透明度 (Alpha)，讓堆疊感更自然
    this.rockColor = color(gray, gray - 5, gray - 12, random(150, 220));
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation); // 旋轉角度，增加堆疊的自然感
    fill(this.rockColor);
    noStroke();
    beginShape();
    for (let a = 0; a <= TWO_PI; a += PI / 6) {
      let r = noise(this.seed + a) * 0.5 + 0.8;
      vertex(cos(a) * this.w * r, sin(a) * this.h * r);
    }
    endShape(CLOSE);
    pop();
  }
}

// 水草類別
class Seaweed {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.h = random(100, height * 0.5); // 限制高度不超過畫面的一半
    this.baseW = random(15, 30); // 基礎葉片寬度
    this.segments = 12; // 增加節點讓曲線更細膩
    this.swayOffset = random(1000);
    this.seed = random(100); // 用於不規則寬度變化的種子
    // 定義底部深色與頂部淺色以模擬漸層光照
    let r = random(30, 70);
    let g = random(110, 170);
    let b = random(40, 80);
    this.baseColor = color(r * 0.4, g * 0.4, b * 0.4, 220); // 底部深色
    this.tipColor = color(r * 1.4, g * 1.4, b * 1.4, 180);  // 頂部淺色
  }

  display() {
    push();
    // 使用原生 Canvas API 建立線性漸層填色
    let grad = drawingContext.createLinearGradient(0, this.y, 0, this.y - this.h);
    grad.addColorStop(0, this.baseColor.toString());
    grad.addColorStop(1, this.tipColor.toString());
    drawingContext.fillStyle = grad;
    noStroke();
    
    beginShape();
    // 1. 右側輪廓：從底部到頂部
    for (let i = 0; i <= this.segments; i++) {
      let t = i / this.segments;
      // 減小晃動幅度 (40 -> 20) 與速度 (0.02 -> 0.015)
      let sway = sin(frameCount * 0.015 + this.swayOffset + i * 0.3) * (t * 20);
      // 使用 noise 產生不規則的寬度變化，並隨高度遞減
      let organicW = this.baseW * (1 - t * 0.9) * (0.7 + noise(this.seed + i * 0.3) * 0.6);
      let px = this.x + sway + organicW / 2;
      let py = this.y - t * this.h;
      
      if (i === 0 || i === this.segments) curveVertex(px, py); // 控制點
      curveVertex(px, py);
    }

    // 2. 左側輪廓：從頂部回到底部
    for (let i = this.segments; i >= 0; i--) {
      let t = i / this.segments;
      let sway = sin(frameCount * 0.015 + this.swayOffset + i * 0.3) * (t * 20);
      let organicW = this.baseW * (1 - t * 0.9) * (0.7 + noise(this.seed + i * 0.3) * 0.6);
      let px = this.x + sway - organicW / 2;
      let py = this.y - t * this.h;
      
      if (i === this.segments || i === 0) curveVertex(px, py); // 控制點
      curveVertex(px, py);
    }
    
    endShape(CLOSE);
    pop();
  }
}

/**
 * 氣泡類別：具有上升與擺動效果
 */
class RisingBubble {
  constructor(isInitial) {
    this.reset(isInitial);
  }

  reset(isInitial) {
    this.x = random(width);
    this.y = isInitial ? random(height) : height + 20;
    this.size = random(4, 12);
    this.speed = random(1.5, 4.5);
    this.wobbleOffset = random(TWO_PI);
  }

  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.02 + this.wobbleOffset) * 0.4;
    if (this.y < -20) this.reset(false);
  }

  display() {
    push();
    stroke(255, 255, 255, 120);
    strokeWeight(1);
    noFill();
    circle(this.x, this.y, this.size);
    // 氣泡高光
    noStroke();
    fill(255, 255, 255, 80);
    circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.25);
    pop();
  }
}

class Pearl {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.originY = y; 
    this.data = data;
    this.size = 75;
    this.angle = random(TWO_PI);
  }

  float() {
    this.y = this.originY + sin(frameCount * 0.02 + this.angle) * 20;
  }

  display() {
    push();
    // 檢查滑鼠是否懸停
    let d = dist(mouseX, mouseY, this.x, this.y);
    let isHover = d < this.size / 2;
    
    if (isHover) {
      cursor(HAND);
      this.size = lerp(this.size, 85, 0.1);
    } else {
      this.size = lerp(this.size, 75, 0.1);
    }
    
    // 珍珠主體（帶有一點淡淡的粉紫色光澤）
    noStroke();
    for(let i = 10; i > 0; i--) {
      let step = i / 10;
      fill(245 + step*10, 240 + step*10, 255, isHover ? 255 : 200);
      circle(this.x, this.y, this.size * step);
    }
    
    // 珍珠高光
    fill(255, 255, 255, 180);
    circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.25);
    
    // 珍珠邊緣光
    noFill();
    stroke(255, 150);
    strokeWeight(1);
    circle(this.x, this.y, this.size);
    
    // 文字標籤
    fill(80, 80, 120);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.data.week, this.x, this.y);
    pop();
  }

  isClicked() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.size / 2;
  }
}

function mousePressed() {
  // 檢查是否點擊大型寶藏箱
  if (treasureChest.isClicked(mouseX, mouseY)) {
    treasureChest.isOpen = !treasureChest.isOpen;
    return; // 點擊箱子時不觸發珍珠邏輯
  }
  
  // 只有當寶箱開啟時才能點擊寶物
  if (treasureChest.isOpen && treasureChest.currentLidAngle > PI / 4) {
    if (keyTreasure.isClicked(mouseX, mouseY)) {
      myIframe.attribute('src', keyTreasure.url);
      myIframe.style('display', 'block');
      closeBtn.style('display', 'block'); // 顯示關閉按鈕
      console.log("Opening Key Link");
      return;
    }
    
    if (bagTreasure.isClicked(mouseX, mouseY)) {
      myIframe.attribute('src', bagTreasure.url);
      myIframe.style('display', 'block');
      closeBtn.style('display', 'block'); // 顯示關閉按鈕
      console.log("Opening Bag Link");
      return;
    }
  }

  for (let p of pearls) {
    if (p.isClicked()) {
      myIframe.attribute('src', p.data.url);
      myIframe.style('display', 'block');
      closeBtn.style('display', 'block'); // 顯示關閉按鈕
      console.log("Loading: " + p.data.week);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 確保視窗縮放時 iframe 與按鈕位置正確
  myIframe.position(width * 0.05, height * 0.05);
  myIframe.size(width * 0.9, height * 0.9);
  closeBtn.position(width * 0.95 - 45, height * 0.05 + 15);
}
