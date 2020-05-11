function Keyboard(keyboardId) {
    keyboardId = keyboardId || 'keyboard';
    addEventListener('keydown', (e) => {
        if (this.isStopped) return;
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Control':
                this.down(e.key);
                break;
            case ' ':
                this.down('Space');
                break;
            case 'Enter':
                this.down('Pause');
                break;
                // case 's':
                //     this.down('S');
                //     break;
                // case 'l':
                //     this.down('L');
                //     break;
        }
    }, false);
    addEventListener('keyup', (e) => {
        if (this.isStopped) return;
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Control':
                this.up(e.key);
                break;
            case ' ':
                this.up('Space');
                break;
            case 'Enter':
                this.up('Pause');
                break;
            case 's':
                this.up('S');
                break;
            case 'l':
                this.up('L');
                break;
        }
    }, false);

    if (innerHeight < innerWidth) return;

    this.isPaused = false;
    this.isStopped = false;

    var html = '';
    for (var i = 0; i < Keyboard.Keys.length; i++) {
        html += `<div id="${Keyboard.Keys[i]}">${Keyboard.Values[i]}</div>`;
    }
    var el = document.getElementById(keyboardId);
    el.innerHTML = html;
    var self = this;
    for (var i = 0; i < Keyboard.Keys.length; i++) {
        el = document.getElementById(Keyboard.Keys[i]);
        el.addEventListener(Keyboard.EventDown, function (e) {
            if (!self.isStopped) self.down(e.target.id);
            e.preventDefault();
        }, false);
        el.addEventListener(Keyboard.EventUp, function (e) {
            if (!self.isStopped) self.up(e.target.id);
            e.preventDefault();
        }, false);
    }
}
Keyboard.EventDown = 'touchstart';
Keyboard.EventUp = 'touchend';
Keyboard.Keys = ['Pause', 'Space', 'Control', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
Keyboard.Values = ['⏸️', 'A', 'B', '⬅️', '➡️', '⬆️', '⬇️'];

Keyboard.prototype = {
    constructor: Keyboard,
    stop: function () {
        this.isStopped = true;
    },
    start: function () {
        this.isStopped = false;
    },

    pause: function () {
        var el = document.getElementById('Pause');
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            el.innerText = '⏸️';
        } else {
            el.innerText = '▶️';
        }
    },

    down: function (id) {
        config.key[id] = true;
        // console.log(config.key)
    },

    up: function (id) {
        //config.key[id] = false;
        delete config.key[id];
    }

}
var keyboard = new Keyboard();