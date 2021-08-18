class Game {
  constructor(menuInit) {
    this.menuInit = menuInit;
    this.wave = 0;
    this.state = {
      waveActive: false,
      entities: [],
      bullets: [],
      moveDirection: null,
      rotateDirection: null,
      canShoot: true,
      fire: false,
      wave: 0,
      playerHealth: 10,
      relPlayerPosition: {
        x: 475,
        y: 275,
        deg: 0
      }
    };
  }

  hurtPlayer() {
    this.state.playerHealth -= 1;
    if (this.state.playerHealth <= 0) {
      this.endGame();
    }
    this.healthBanner.innerHTML = 'Health: ' + this.state.playerHealth;
  }

  move(direction) {
    const allDirections = {
      up: -6,
      down: 6,
      left: -6,
      right: 6
    }
    direction === 'up' || direction === 'down' ? this.state.relPlayerPosition.y = this.state.relPlayerPosition.y + allDirections[direction] : this.state.relPlayerPosition.x = this.state.relPlayerPosition.x + allDirections[direction]
  }

  rotate(direction) {
    if (direction === 'left') {
      this.state.relPlayerPosition.deg = this.state.relPlayerPosition.deg - 10
    } else {
      this.state.relPlayerPosition.deg = this.state.relPlayerPosition.deg + 10
    }
  }

  handleEvents(e) {
    if (e.type === 'keydown') {
      switch(e.key) {
        case 'w' :
          this.state.moveDirection = 'up';
          break;
        case 's' :
          this.state.moveDirection = 'down';
          break;
        case 'a' :
          this.state.moveDirection = 'left';
          break;
        case 'd' :
          this.state.moveDirection = 'right';
          break;
        case 'ArrowLeft' :
          this.state.rotateDirection = 'left';
          break;
        case 'ArrowRight' :
          this.state.rotateDirection = 'right';
          break;
        case ' ' :
          this.state.fire = true;
          break;
        default :
          break;
      }
    } else if (e.type === 'keyup') {
      if (
        e.key === 'w' ||
        e.key === 's' ||
        e.key === 'a' ||
        e.key === 'd'
      ) {
        this.state.moveDirection = null;
      }
      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        this.state.rotateDirection = null;
      }
      if (e.key === ' ') { this.state.fire = false }
    }
  }

  refreshCanvas() {
    this.createStage();
    this.tickEntities();
    this.state.absPlayerPosition = Utils.getAbsPosition(this.state.relPlayerPosition, 0, { x: 475, y: 275 });
    player(this.ctx, this.state.relPlayerPosition.x, this.state.relPlayerPosition.y, this.state.relPlayerPosition.deg);
    this.handleBullets(this.state.bullets);
    let conflicts = Utils.checkForConflicts(this.state.bullets, this.state.entities);
    if (conflicts !== undefined) {
      this.handleConflicts(conflicts);
    }
  }

  tickEntities() {
    for (let i = 0; i < this.state.entities.length; i++) {
      if (this.state.entities[i].health > 0) {
        this.state.entities[i].tick(this.ctx, this.state.absPlayerPosition);
      } else {
        this.state.entities.splice(i, 1);
        this.zombieCountBanner.innerHTML = `${this.state.entities.length} Zombies Left`;
      }
    }
  }

  handleConflicts(conflicts) {
    for (let i = 0; i < conflicts.length; i++) {
      // console.log(conflicts[i]);
      conflicts[i].health = conflicts[i].health - 1;
    }
  }

  shoot() {
    const bullet = new Bullet(this.ctx, this.state.relPlayerPosition.x, this.state.relPlayerPosition.y, this.state.relPlayerPosition.deg);
    this.state.bullets.push(bullet);
    this.state.canShoot = false;
    bullet.init();
    setTimeout(() => {
      this.state.canShoot = true;
    }, 300)
    setTimeout(() => {
      this.state.bullets.shift();
    }, 2000)
  }

  handleBullets(bullets) {
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].tick(this.ctx);
    }
  }

  tick() {
    if (this.state.moveDirection) {
      this.move(this.state.moveDirection);
    }
    if (this.state.rotateDirection) {
      this.rotate(this.state.rotateDirection);
    }
    if (this.state.fire && this.state.canShoot) {
      this.shoot();
    }
    this.refreshCanvas();
    if (this.waveActive) {
      if (this.state.entities.length === 0) {
        this.waveOver();
      }
    }
  }

  gameLoop() {
    return setInterval(() => {
      this.tick();
    }, 75);
  }

  createStage() {
    this.stage = document.createElement('canvas');
    this.stage.id = "game-canvas";
    this.stage.height = "600";
    this.stage.width = "1000";
    this.ctx = this.stage.getContext('2d');
    let oldCanvas = document.getElementById('game-canvas');
    if (oldCanvas) {
      document.body.removeChild(oldCanvas);
    }
    document.body.appendChild(this.stage);
  }

  createExitButton() {
    this.exitButton = document.createElement('button');
    this.exitButton.id = "exit-button";
    this.exitButton.innerHTML = 'EXIT GAME';
    this.exitButton.onclick = () => { this.endGame(); }
    document.body.appendChild(this.exitButton);
  }

  createWaveBanner() {
    this.waveBanner = document.createElement('h1');
    this.waveBanner.innerHTML = 'WAVE ' + this.wave;
    this.waveBanner.id = 'wave-banner';
    document.body.appendChild(this.waveBanner);
  }

  createStartWaveButton() {
    this.startWaveButton = document.createElement('button');
    this.startWaveButton.innerHTML = 'START NEXT WAVE';
    this.startWaveButton.id = 'start-wave-button';
    this.startWaveButton.onclick = () => {
      this.startNextWave();
    }
    document.body.appendChild(this.startWaveButton);
  }

  createHealthBanner() {
    this.healthBanner = document.createElement('h1');
    this.healthBanner.id = 'health-banner';
    this.healthBanner.innerHTML = 'Health: ' + this.state.playerHealth;
    document.body.appendChild(this.healthBanner);
  }

  startNextWave() {
    this.waveActive = true;
    this.wave ++;
    this.waveBanner.innerHTML = 'WAVE ' + this.wave;
    document.body.removeChild(this.startWaveButton);
    this.generateZombies();
    this.createZombieCountBanner();
  }

  createZombieCountBanner() {
    this.zombieCountBanner = document.createElement('h2');
    this.zombieCountBanner.id = 'zombie-count-banner';
    this.zombieCountBanner.innerHTML = `${this.state.entities.length} Zombies Left`;
    document.body.appendChild(this.zombieCountBanner);
  }

  generateZombies() {
    while(this.state.entities.length < this.wave * 3) {
      this.state.entities.push(new Zombie(this.ctx, this.hurtPlayer.bind(this), Math.random() * 6 + 1));
    }
  }

  waveOver() {
    document.body.appendChild(this.startWaveButton);
    document.body.removeChild(this.zombieCountBanner);
    this.waveActive = false;
  }

  endGame() {
    console.log('Game Ended');
    if (this.waveActive) { this.waveOver(); }
    clearInterval(this.game);
    document.body.removeChild(this.stage);
    document.body.removeChild(this.exitButton);
    document.body.removeChild(this.startWaveButton);
    document.body.removeChild(this.healthBanner);
    document.body.removeChild(this.waveBanner);
    this.menuInit();
  }

  controllerInit() {
    window.addEventListener('keydown', this.handleEvents.bind(this));
    window.addEventListener('keyup', this.handleEvents.bind(this));
  }

  testDummyInit() {
    let testDummy = {
      position: { x: 475, y: 245 },
      paint: this.paintTestDummy.bind(this),
      health: 5
    }
    this.state.entities.push(testDummy);
  }

  paintTestDummy(health) {
    let x = 475;
    let y = 245;
    this.dummyPosition = Utils.getAbsPosition({ x, y }, 0, { x, y });
    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    this.ctx.fillRect(x, y, 30, 30);
    this.ctx.fillStyle = 'rgb(255, 0, 0)';
    this.ctx.fillRect(x, y, 30, 5);
    this.ctx.fillStyle = 'rgb(0, 255, 0)';
    this.ctx.fillRect(x, y, health * 6, 5);
  }

  init() {
    this.createWaveBanner();
    this.createHealthBanner();
    this.createStage();
    this.createExitButton();
    this.createStartWaveButton();
    // this.testDummyInit();
    this.controllerInit();
    player(this.ctx, this.state.relPlayerPosition.x, this.state.relPlayerPosition.y, this.state.relPlayerPosition.deg);
    this.game = this.gameLoop();
  }
}