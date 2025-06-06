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

const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;

// Matter.js 
const {Engine, Body, Bodies, Composite, Composites, Constraint, Vector} = Matter;
let engine;
let balls = [];
let targetKnowledge; // 正確答案的目標知識
let score = 0; // 玩家分數

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
}

function draw() {
  background(220);
  Engine.update(engine);
  
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
  
  // 檢查手指是否觸碰到正確答案的球
  if (hands.length > 0) {
    let indexFinger = hands[0]?.keypoints[INDEX_FINGER_TIP];
    
    if (indexFinger) {
      fill(0, 255, 0);
      noStroke();
      circle(indexFinger.x, indexFinger.y, 10);
      
      for (let ball of balls) {
        let ballPos = ball.body.position;
        let distance = dist(indexFinger.x, indexFinger.y, ballPos.x, ballPos.y);
        
        if (distance < ball.radius && ball.text === targetKnowledge && !ball.done) {
          score++;
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
}

// Ball 類別，繪製球形狀
class Ball {
  constructor() {
    this.radius = random(20, 40);
    this.body = Bodies.circle(random(width), random(height), this.radius, {
      frictionAir: 0.02, // 增加空氣阻力，讓球掉落速度變慢
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
    textSize(16);
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
