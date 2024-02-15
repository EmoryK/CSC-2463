
class Character {
  constructor(spriteSheet, x, y) {
    this.sprite = new Sprite(x, y, 80, 80);
    this.sprite.spriteSheet = spriteSheet;
    this.animations = {
      stand: { row: 0, frames: 1 },
      walk: { row: 0, col: 1, frames: 8 }
    };
    this.sprite.anis.frameDelay = 8;
    this.sprite.addAnis(this.animations);
    this.sprite.changeAni('stand');
  }

  move(direction) {
    if (direction === 'right') {
      this.sprite.changeAni('walk');
      this.sprite.vel.x = 1;
      this.sprite.scale.x = 1;
    } else if (direction === 'left') {
      this.sprite.changeAni('walk');
      this.sprite.velocity.x = -1;
      this.sprite.scale.x = -1;
    } else {
      this.stop();
    }
  }

  stop() {
    this.sprite.vel.x = 0;
    this.sprite.changeAni('stand');
  }
}
let characters = []; 
let spriteSheets = ['assets/Green.png', 'assets/SpelunkyGuy.png','assets/Cyan.png'];


function setup() {
  createCanvas(400, 400);

  spriteSheets.forEach(sheet => {
    let x = random(60, width-40);
    let y = random(60, height-40);
    characters.push(new Character(sheet, x, y));
  });
}

function draw() {
  background(0);
  
  characters.forEach(character => {
    if (kb.pressing('right') && (character.sprite.position.x + character.sprite.width / 4 < width)) {
      character.move('right');
    } else if (kb.pressing('left') && (character.sprite.position.x - character.sprite.width / 4 > 0)) {
      character.move('left');
    } else {
      character.stop();
    }
    character.sprite.collider = 'none';
  });
}
