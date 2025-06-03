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
  handPose = ml5.handPose({maxHands: 1, flipped: true});
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO, {flipped: true});
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
  image(video, 0, 0, width, height);
  
  if (random() < 0.1) {
    circles.push(new Circle());
  }
  
  for (let i = circles.length - 1; i >= 0; i--) {
    circles[i].checkDone();
    circles[i].display();
    
    if (circles[i].done) {
      circles[i].removeCircle();
      circles.splice(i, 1);
      // 判斷圓形被哪一條繩子移除，更新對應的分數
      if (circles[i].removedBy === "left") {
        leftScore++;
      } else if (circles[i].removedBy === "right") {
        rightScore++;
      }
    }
  }
  
  if (hands.length > 0) {
    let thumbLeft = hands[0].keypoints[THUMB_TIP];
    let indexLeft = hands[0].keypoints[INDEX_FINGER_TIP];
    let thumbRight = hands.length > 1 ? hands[1].keypoints[THUMB_TIP] : null;
    let indexRight = hands.length > 1 ? hands[1].keypoints[INDEX_FINGER_TIP] : null;
    
    fill(0, 255, 0);
    noStroke();
    circle(thumbLeft.x, thumbLeft.y, 10);
    circle(indexLeft.x, indexLeft.y, 10);
    
    leftBridge.bodies[0].position.x = thumbLeft.x;
    leftBridge.bodies[0].position.y = thumbLeft.y;
    leftBridge.bodies[leftBridge.bodies.length - 1].position.x = indexLeft.x;
    leftBridge.bodies[leftBridge.bodies.length - 1].position.y = indexLeft.y;
    leftBridge.display();
    
    if (thumbRight && indexRight) {
      fill(255, 0, 0);
      circle(thumbRight.x, thumbRight.y, 10);
      circle(indexRight.x, indexRight.y, 10);
      
      rightBridge.bodies[0].position.x = thumbRight.x;
      rightBridge.bodies[0].position.y = thumbRight.y;
      rightBridge.bodies[rightBridge.bodies.length - 1].position.x = indexRight.x;
      rightBridge.bodies[rightBridge.bodies.length - 1].position.y = indexRight.y;
      rightBridge.display();
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

// Circle 類別需要新增屬性 `removedBy`，用來記錄圓形被哪一條繩子移除
class Circle {
  constructor() {
    this.body = Bodies.circle(random(width), random(height), radius);
    Composite.add(engine.world, this.body);
    this.done = false;
    this.removedBy = null; // 初始化為 null
  }
  
  checkDone() {
    // 判斷圓形是否被移除，並記錄移除者
    if (this.body.position.y > height) {
      this.done = true;
      this.removedBy = this.body.position.x < width / 2 ? "left" : "right";
    }
  }
  
  display() {
    fill(colorPalette[floor(random(colorPalette.length))]);
    circle(this.body.position.x, this.body.position.y, radius * 2);
  }
  
  removeCircle() {
    Composite.remove(engine.world, this.body);
  }
}
