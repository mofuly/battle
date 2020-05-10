class Keyboard {
    static EventDown = 'touchstart';
    static EventUp = 'touchend';

    // static Keys = ['S', 'L', 'Pause', 'Space', 'Control', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    // static Values = ['S', 'L', '', 'A', 'B', '⬅️', '➡️', '⬆️', '⬇️'];
    static Keys = ['Pause', 'Space', 'Control', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    static Values = ['', 'A', 'B', '⬅️', '➡️', '⬆️', '⬇️'];
    constructor(keyboardId = 'keyboard') {
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

        let html = '';
        for (let i = 0; i < Keyboard.Keys.length; i++) {
            // console.log(`<div id="${Keyboard.Keys[i]}">${Keyboard.Values[i]}</div>`);
            html += `<div id="${Keyboard.Keys[i]}">${Keyboard.Values[i]}</div>`;
        }
        let el = document.getElementById(keyboardId);
        el.innerHTML = html;
        // console.log(html)
        for (let i = 0; i < Keyboard.Keys.length; i++) {
            el = document.getElementById(Keyboard.Keys[i]);
            el.addEventListener(Keyboard.EventDown, () => {
                if (!this.isStopped) this.down(Keyboard.Keys[i]);
            }, false);
            el.addEventListener(Keyboard.EventUp, () => {
                if (!this.isStopped) this.up(Keyboard.Keys[i]);
            }, false);
        }
    }

    stop() {
        this.isStopped = true;
    }
    start() {
        this.isStopped = false;
    }

    pause() {
        let el = document.getElementById('Pause');
        if (this.isPaused) {
            el.className = 'Pause';
        } else {
            el.className = 'Resume';
        }
        this.isPaused = !this.isPaused;
    }

    down(id) {
        config.key[id] = true;
        // console.log(config.key)
    }

    up(id) {
        //config.key[id] = false;
        delete config.key[id];
    }

}

window.Keyboard = Keyboard;
keyboard = new Keyboard()