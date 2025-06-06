/*
----- Coding Tutorial by Patt Vira ----- 
Name: Interactive Game: Touch the Correct Ball (matter.js + ml5.js)
Video Tutorial: https://youtu.be/K7b5MEhPCuo

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

// ml5.js 
let handPose;
let video;
let hands = [];

const PALM_BASE = 0; // 手掌基底的索引

// Matter.js 
const {Engine, Body, Bodies, Composite, Composites, Constraint, Vector} = Matter;
let engine;
let balls = [];
let targetKnowledge; // 正確答案的目標知識
let score = 0; // 玩家分數
let lives = 3; // 玩家愛心數量
let gameTime = 30; // 遊戲時間限制（秒）
let startTime;

let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"];

// 教育科技知識庫
const knowledgePool = [
  { text: "AI可以幫助人類", correct: true },
  { text: "教育科技的出路很廣泛", correct: true },
  { text: "教科的老師人很好", correct: true },
  { text: "小狗", correct: false },
  { text: "貓咪", correct: false },
  { text: "食物", correct: false },
];

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({maxHands: 2, flipped: true});
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true}, (stream) => {
    if (!stream) {
      console.error("No webcam found on this device.");
    }
  });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  engine = Engine.create();
  targetKnowledge = random(knowledgePool.filter(k => k.correct)).text; // 隨機選擇正確知識作為目標
  startTime = millis(); // 設定遊戲開始時間
}

function draw() {
  background(220);
  Engine.update(engine);
  
  // 計算剩餘時間
  let elapsedTime = floor((millis() - startTime) / 1000);
  let remainingTime = gameTime - elapsedTime;

  if (remainingTime <= 0 || lives <= 0) {
    // 遊戲結束
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    if (lives <= 0) {
      text("遊戲失敗！", width / 2, height / 2);
    } else {
      text("闖關成功！", width / 2, height / 2);
    }
    noLoop(); // 停止 draw 循環
    return;
  }

  // 顯示剩餘時間
  fill(0);
  textSize(20);
  text(`剩餘時間: ${remainingTime} 秒`, width / 2, 30);

  // Draw the webcam video
  if (video.loadedmetadata) {
    image(video, 0, 0, width, height);
  } else {
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Webcam not found", width / 2, height / 2);
    return;
  }
  
  // 隨機生成球
  if (random() < 0.03) {
    balls.push(new Ball());
  }
  
  // 更新並顯示球
  for (let i = balls.length - 1; i >= 0; i--) {
    balls[i].checkDone();
    balls[i].display();
    
    if (balls[i].done) {
      balls[i].removeBall();
      balls.splice(i, 1);
    }
  }
  
  // 檢查手掌是否觸碰到球
  if (hands.length > 0) {
    let palmBase = hands[0]?.keypoints[PALM_BASE];
    
    if (palmBase) {
      fill(0, 255, 0, 100);
      noStroke();
      ellipse(palmBase.x, palmBase.y, 50, 50); // 用手掌基底繪製一個較大的接觸面積
      
      for (let ball of balls) {
        let ballPos = ball.body.position;
        let distance = dist(palmBase.x, palmBase.y, ballPos.x, ballPos.y);
        
        if (distance < ball.radius && !ball.done) {
          if (ball.correct) {
            score++;
          } else {
            lives--; // 扣除愛心
          }
          ball.done = true;
        }
      }
    }
  }
  
  // 顯示目標知識
  fill(0);
  textSize(20);
  text(`目標知識: ${targetKnowledge}`, 10, 30);
  
  // 顯示玩家分數
  text(`分數: ${score}`, width - 100, 30);

  // 顯示玩家愛心（右上角）
  fill(255, 0, 0);
  for (let i = 0; i < lives; i++) {
    heart(width - 30 - i * 40, 30, 30); // 大愛心顯示在右上角
  }
}

// Ball 類別，繪製球形狀
class Ball {
  constructor() {
    this.radius = random(30, 50); // 放大球的大小
    this.body = Bodies.circle(random(width), random(height), this.radius, {
      frictionAir: 0.1, // 增加空氣阻力，讓球掉落速度更慢
    });
    Composite.add(engine.world, this.body);
    let knowledge = random(knowledgePool); // 隨機選擇知識
    this.text = knowledge.text;
    this.correct = knowledge.correct;
    this.done = false;
  }
  
  checkDone() {
    if (this.body.position.y > height) {
      this.done = true;
    }
  }
  
  display() {
    fill(random(colorPalette));
    noStroke();
    push();
    translate(this.body.position.x, this.body.position.y);
    circle(0, 0, this.radius * 2);
    fill(0);
    textSize(20); // 放大球上的文字
    textAlign(CENTER, CENTER);
    text(this.text, 0, 0); // 在球上顯示知識
    pop();
  }
  
  removeBall() {
    Composite.remove(engine.world, this.body);
  }
}

function gotHands(results) {
  hands = results; // save the output to the hands variable
}

// 繪製愛心
function heart(x, y, size) {
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
}
