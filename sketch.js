/*
----- Coding Tutorial by Patt Vira ----- 
Name: Interactive Bridge w Bouncing Balls (matter.js + ml5.js)
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
let leftBridge, rightBridge; // 左右手各控制一條繩子
let num = 10; let radius = 10; let length = 25;
let circles = [];
let leftScore = 0; // 左手分數
let rightScore = 0; // 右手分數

let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"];

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({maxHands: 2, flipped: true}); // 修正 maxHands 為 2，支援雙手
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO, {flipped: true}, (stream) => {
    if (!stream) {
      console.error("No webcam found on this device.");
    }
  });
  video.size(640, 480);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
  
  engine = Engine.create();
  leftBridge = new Bridge(num, radius, length); // 左手控制的繩子
  rightBridge = new Bridge(num, radius, length); // 右手控制的繩子
}

function draw() {
  background(220);
  Engine.update(engine);
  strokeWeight(2);
  stroke(0);
  
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
  
  if (random() < 0.03) { // 降低愛心生成的頻率，避免性能問題
    circles.push(new Heart());
  }
  
  for (let i = circles.length - 1; i >= 0; i--) {
    circles[i].checkDone();
    circles[i].display();
    
    if (circles[i].done) {
      circles[i].removeHeart();
      circles.splice(i, 1);
    }
  }
  
  if (hands.length > 0) {
    let thumbLeft = hands[0]?.keypoints[THUMB_TIP];
    let indexLeft = hands[0]?.keypoints[INDEX_FINGER_TIP];
    let thumbRight = hands.length > 1 ? hands[1]?.keypoints[THUMB_TIP] : null;
    let indexRight = hands.length > 1 ? hands[1]?.keypoints[INDEX_FINGER_TIP] : null;
    
    if (thumbLeft && indexLeft) {
      fill(0, 255, 0);
      noStroke();
      circle(thumbLeft.x, thumbLeft.y, 10);
      circle(indexLeft.x, indexLeft.y, 10);
      
      // 平滑移動左手繩子
      leftBridge.bodies[0].position.x = lerp(leftBridge.bodies[0].position.x, thumbLeft.x, 0.5);
      leftBridge.bodies[0].position.y = lerp(leftBridge.bodies[0].position.y, thumbLeft.y, 0.5);
      leftBridge.bodies[leftBridge.bodies.length - 1].position.x = lerp(leftBridge.bodies[leftBridge.bodies.length - 1].position.x, indexLeft.x, 0.5);
      leftBridge.bodies[leftBridge.bodies.length - 1].position.y = lerp(leftBridge.bodies[leftBridge.bodies.length - 1].position.y, indexLeft.y, 0.5);
      leftBridge.display("red"); // 繩子顏色改為紅色
    }
    
    if (thumbRight && indexRight) {
      fill(255, 0, 0);
      noStroke();
      circle(thumbRight.x, thumbRight.y, 10);
      circle(indexRight.x, indexRight.y, 10);
      
      // 平滑移動右手繩子
      rightBridge.bodies[0].position.x = lerp(rightBridge.bodies[0].position.x, thumbRight.x, 0.5);
      rightBridge.bodies[0].position.y = lerp(rightBridge.bodies[0].position.y, thumbRight.y, 0.5);
      rightBridge.bodies[rightBridge.bodies.length - 1].position.x = lerp(rightBridge.bodies[rightBridge.bodies.length - 1].position.x, indexRight.x, 0.5);
      rightBridge.bodies[rightBridge.bodies.length - 1].position.y = lerp(rightBridge.bodies[rightBridge.bodies.length - 1].position.y, indexRight.y, 0.5);
      rightBridge.display("red"); // 繩子顏色改為紅色
    }
  }
  
  // 檢查愛心是否被繩子接住
  for (let heart of circles) {
    let heartPos = heart.body.position;
    let leftBridgeStart = leftBridge.bodies[0].position;
    let leftBridgeEnd = leftBridge.bodies[leftBridge.bodies.length - 1].position;
    let rightBridgeStart = rightBridge.bodies[0].position;
    let rightBridgeEnd = rightBridge.bodies[rightBridge.bodies.length - 1].position;
    
    // 左手繩子接住愛心
    if (heartPos.x > leftBridgeStart.x && heartPos.x < leftBridgeEnd.x &&
        heartPos.y > leftBridgeStart.y && heartPos.y < leftBridgeEnd.y) {
      if (!heart.done) { // 確保只加一次分
        leftScore++;
        heart.done = true;
      }
    }
    
    // 右手繩子接住愛心
    if (heartPos.x > rightBridgeStart.x && heartPos.x < rightBridgeEnd.x &&
        heartPos.y > rightBridgeStart.y && heartPos.y < rightBridgeEnd.y) {
      if (!heart.done) { // 確保只加一次分
        rightScore++;
        heart.done = true;
      }
    }
  }
  
  // 顯示左手分數
  fill(0);
  textSize(20);
  text(`左手分數: ${leftScore}`, 10, 30);
  
  // 顯示右手分數
  text(`右手分數: ${rightScore}`, width - 150, 30);
  
  // 顯示畫面中間的文字
  textSize(40);
  textAlign(CENTER, CENTER);
  text("教育科技系", width / 2, height / 2);
}

function gotHands(results) {
  hands = results;  // save the output to the hands variable
}

// Heart 類別，繪製愛心形狀
class Heart {
  constructor() {
    this.body = Bodies.circle(random(width), random(height), radius);
    Composite.add(engine.world, this.body);
    this.done = false;
  }
  
  checkDone() {
    // 判斷愛心是否超出畫面
    if (this.body.position.y > height) {
      this.done = true;
    }
  }
  
  display() {
    fill("#ff69b4"); // 愛心顏色
    noStroke();
    push();
    translate(this.body.position.x, this.body.position.y);
    beginShape();
    vertex(0, -radius);
    bezierVertex(-radius, -radius * 1.5, -radius * 1.5, 0, 0, radius);
    bezierVertex(radius * 1.5, 0, radius, -radius * 1.5, 0, -radius);
    endShape(CLOSE);
    pop();
  }
  
  removeHeart() {
    Composite.remove(engine.world, this.body);
  }
}
