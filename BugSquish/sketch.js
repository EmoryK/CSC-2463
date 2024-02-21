class Character {
  constructor(spriteSheet, x, y, speed) {
    this.sprite = new Sprite(x, y, 32, 32);
    this.sprite.spriteSheet = spriteSheet;

    this.speed= speed;

    this.animations = {
      stand: { row: 0, frames: 1 },
      walk: { row: 0, frames: 4 },
      dead: {row:0, col: 4}
    };
    this.sprite.anis.frameDelay = 8;
    this.sprite.addAnis(this.animations);
    this.sprite.changeAni('stand');

    this.squished = false;
  }

  move() {
    
    this.sprite.changeAni('walk');
    //this.sprite.vel.y += random(-this.speed, this.speed);
   if (this.sprite.position.x + this.sprite.width / 4 > width){
      
      this.sprite.vel.x = this.sprite.vel.x * -1;
      
    }
    else if (this.sprite.position.x - this.sprite.width / 4 < 0){
      
      this.sprite.vel.x = this.sprite.vel.x * -1;
      
    }
    if(this.sprite.vel.x <= 0){
      this.sprite.vel.x =-this.speed;
      this.sprite.scale.x = -1;
    }
    else if(this.sprite.vel.x >= 0){
      this.sprite.vel.x = this.speed;
      this.sprite.scale = 1;
    }

  }

  isClicked(px, py) {
    let d = dist(px, py, this.sprite.x, this.sprite.y);
    return d < 15; 
  }

  squish() {
    this.squished = true;
    this.stop();
  }

  stop() {
    this.sprite.vel.x = 0;
    this.sprite.changeAni('dead');
  }
}

let characters = []; 
let spriteSheets = ['assets/BugSprite.png'];
let score = 0;
let timer = 30;
let bugSpeed = 1;

function setup() {
  createCanvas(400, 400);

  for(let i= 0; i < 5; i++)
  spriteSheets.forEach(sheet => {
    let x = random(60, width-40);
    let y = random(60, height-40);
    characters.push(new Character(sheet, x, y, bugSpeed));
  });

   setInterval(function() {
    if (timer > 0) {
      timer--;
    }
  }, 1000);
}

function draw() {
  background(220);

  fill(0);
  textSize(16);
  text(`Score: ${score}`, 10, 20);
  text(`Time: ${timer}`, 10, 40);

  // If the timer is not yet zero, update and draw characters
  if (timer > 0) {
    characters.forEach(character => {
      if (!character.squished) {
        character.move();
      }
      character.sprite.collider = 'none';
    });
  } else {
    // If the timer is zero, display the game over message
    textSize(32);
    fill(255, 0, 0); // Red color for the game over text
    text(`Game Over! Score: ${score}`, width / 2 - 150, height / 2);
    noLoop(); // Stops the draw loop
  }
}


function mousePressed() {
  // Check if a bug is clicked
  for (let i = 0; i < characters.length; i++) {
    if (characters[i].isClicked(mouseX, mouseY) && !characters[i].squished) {
      characters[i].squish();
      score++;
      bugSpeed += .2; // Make game harder
      let x = random(60, width-40);
      let y = random(60, height-40);
      characters.push(new Character(spriteSheets[0], x, y, bugSpeed));
    }
  }
}

