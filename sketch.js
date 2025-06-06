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
let targetNumber; // 正確答案的目標數字
let score = 0; // 玩家分數

let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"];

let timeLimit = 60; // 遊戲時間限制（秒）
let startTime;

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
  targetNumber = floor(random(1, 10)); // 隨機生成目標數字
  startTime = millis(); // 設定遊戲開始時間
}

function draw() {
  background(220);
  Engine.update(engine);

  let elapsedTime = floor((millis() - startTime) / 1000);
  let remainingTime = timeLimit - elapsedTime;

  if (remainingTime <= 0) {
    // 遊戲結束
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`遊戲結束！分數: ${score}`, width / 2, height / 2);
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
        
        if (distance < ball.radius && ball.number === targetNumber && !ball.done) {
          score++;
          ball.done = true;
        }
      }
    }
  }
  
  // 顯示目標數字
  fill(0);
  textSize(20);
  text(`目標數字: ${targetNumber}`, 10, 30);
  
  // 顯示玩家分數
  text(`分數: ${score}`, width - 100, 30);
}

// Ball 類別，繪製球形狀
class Ball {
  constructor() {
    this.radius = random(20, 40);
    this.body = Bodies.circle(random(width), random(height), this.radius);
    Composite.add(engine.world, this.body);
    this.number = floor(random(1, 10)); // 隨機生成球上的數字
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
    text(this.number, 0, 0); // 在球上顯示數字
    pop();
  }
  
  removeBall() {
    Composite.remove(engine.world, this.body);
  }
}

function gotHands(results) {
  hands = results; // save the output to the hands variable
}
