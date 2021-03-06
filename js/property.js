/**
 * 奖励
 */
function Property(type) {
    this.type = type;
    this.size = 16;
    this.ctx = canvasProperty.getContext('2d');
    do {
        row = genRandom(3, 22), col = genRandom(3, 22);
    } while (config.property.some(function (v) {
            return collide(v.x, v.y, v.size, v.size, col * 8, row * 8, v.size, v.size);
        }));
    this.x = col * 8;
    this.y = row * 8;
    this.img = document.querySelectorAll('.imgProperty')[this.type - 1];
    this.tick = 0;
    this.isPaused = false;
    this.isEatten = false;
    this.isDestroyed = false;
    this.toggle = true;
    config.property.push(this);

    sound(avOut);
    this.show();
}

Property.prototype = {
    constructor: Property,

    get location() {
        var row = Math.floor(this.y / 8),
            col = Math.floor(this.x / 8);
        return [{
                row: row,
                col: col
            },
            {
                row: row,
                col: col + 1
            },
            {
                row: row + 1,
                col: col
            },
            {
                row: row + 1,
                col: col + 1
            }
        ];
    },
    pause: function () {
        this.isPaused = !this.isPaused();
    },

    show: function () {
        var duration = 30,
            period = 30,
            durationOfFast = 4,
            periodOfFast = 10,
            elapsed = 0,
            self = this;

        if (this.isDestroyed) return;

        if (this.isPaused) {
            requestAnimationFrame(this.show.bind(this));
            return;
        }
        if (config.isGameOver) {
            self.ctx.clearRect(self.x + 16, self.y + 16, self.size, self.size);
            return;
        }

        if (this.isEatten) {
            this.ctx.clearRect(self.x + 16, self.y + 16, self.size, self.size);
            var self = this;
            config.property = config.property.filter(function (v) {
                return v !== self;
            });
            return;
        }

        elapsed = Math.floor(this.tick / period);
        if (elapsed > duration + durationOfFast) {
            this.ctx.clearRect(this.x + 16, this.y + 16, this.size, this.size);
            var self = this;
            config.property = config.property.filter(function (v) {
                return v !== self;
            });
            return;
        }

        if (elapsed <= duration) {
            if (this.tick % period === 0) {
                this.ctx.drawImage(self.img, self.x + 16, self.y + 16, self.size, self.size);
            }
            if (this.tick % (3 * period) === 0) {
                this.ctx.clearRect(self.x + 16, self.y + 16, self.size, self.size);
            }
        } else {
            if (this.tick % periodOfFast === 0) {
                twinkle();
            }
        }

        this.tick++;
        requestAnimationFrame(this.show.bind(this));

        function twinkle() {
            if (self.toggle) {
                self.ctx.drawImage(self.img, self.x + 16, self.y + 16, self.size, self.size);
            } else {
                self.ctx.clearRect(self.x + 16, self.y + 16, self.size, self.size);
            }
            self.toggle = !self.toggle;
        }
    },
    spade: function () {
        var ctx = canvasMap.getContext('2d'),
            self = this,
            tick = 0,
            block = '3';

        setFence('5');
        swap();

        function setFence(block) {
            var x, y;
            for (let i = 23; i <= 25; i++) {
                for (let j = 11; j <= 14; j++) {
                    if (config.map[i][j] === 'c') continue;
                    x = j * 8, y = i * 8;
                    ctx.clearRect(x + 16, y + 16, 8, 8);
                    if (block === '5') {
                        ctx.drawImage(imgSteel, x + 16, y + 16, 8, 8);
                    } else {
                        ctx.drawImage(imgBrick, x + 16, y + 16, 8, 8);
                    }
                    if (config.map[i][j] !== 'c') config.map[i][j] = block;
                }
            }
        }

        function swap() {
            var newBlock,
                duration = 15,
                lastSecond = 3,
                speed = 20;
            if (self.isPaused) {
                requestAnimationFrame(swap.bind(self));
                return;
            }
            tick++;
            if (tick / 60 <= (duration - lastSecond)) {
                requestAnimationFrame(swap.bind(self));
                return;
            }
            if (self.isDestroyed || tick / 60 >= duration) {
                setFence('3');
                return;
            }

            if (tick % speed === 0) {
                newBlock = block;
                if (block === '3') {
                    block = '5';
                } else {
                    block = '3';
                }
                setFence(newBlock);
            }

            requestAnimationFrame(swap.bind(self));
        }

    },
    eatten: function () {
        if (this.isEatten) return;
        this.isEatten = true;
        sound(avEat);
        this.ctx.drawImage(imgScore500, this.x + this.size / 2 + 16, this.y - this.size + 16, 16, 16);
        var self = this;
        setTimeout(function () {
            self.ctx.clearRect(self.x + self.size / 2 + 16, self.y - self.size + 16, 16, 16);
        }, 1500);
        config.playerScore += 500;
        // TODO 奖励eatten
        switch (this.type) {
            case 1: // add life
                // console.log('add life')
                config.lives++;
                sound(avAddLife);
                showPlayerCount(config.lives);
                break;
            case 2: // star
                config.player.upgrade();
                break;
            case 3: // clock
                config.enemy.forEach(function (v) {
                    if (!v.isDestroyed) v.froze();
                });
                break;
            case 4: // mine
                config.enemy.forEach(function (v) {
                    if (!v.isDestroyed) v.hit(true);
                });
                break;
            case 5: // spade
                this.spade();
                break;
            case 6: // shield
                config.player.putOnShield();
                break;
        }
    }
}