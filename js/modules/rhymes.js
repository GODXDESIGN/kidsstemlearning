/**
 * Rhymes & Games Module
 * Hand-eye coordination through popping floating balloons.
 * Incorporates musical chime notes.
 */
const RhymesModule = {
    poppedCount: 0,
    totalBalloons: 5,
    animationInterval: null,
    colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
    notes: [261.63, 293.66, 329.63, 349.23, 392.00], // C D E F G frequencies

    init() {
        this.rhymesArea = document.getElementById('rhymes-area');
        this.celebration = document.getElementById('rhyme-celebration');
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    },

    // Simple synthesized blip to sound like a musical note
    playNote(freq) {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    },

    startRound() {
        this.rhymesArea.innerHTML = '';
        this.celebration.classList.add('hidden');
        this.poppedCount = 0;

        // Spawn balloons
        for (let i = 0; i < this.totalBalloons; i++) {
            this.spawnBalloon(i);
        }

        window.AudioManager.speak("Pop the balloons!");
    },

    spawnBalloon(index) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';

        // Randomize spawn position horizontally, starting near bottom
        const startX = Math.random() * 80 + 10;
        const color = this.colors[index % this.colors.length];
        const freq = this.notes[index % this.notes.length];

        balloon.style.left = `${startX}%`;
        balloon.style.bottom = '-120px'; // Start below container
        balloon.style.backgroundColor = color;

        // Float animation
        const duration = Math.random() * 3000 + 4000; // 4 - 7 seconds
        // delay spawn staggered
        setTimeout(() => {
            this.rhymesArea.appendChild(balloon);

            // CSS Animation equivalent via Web Animations API for smooth control
            const animation = balloon.animate([
                { transform: 'translateY(0px)', offset: 0 },
                { transform: 'translateY(-450px)', offset: 1 } // float out top
            ], {
                duration: duration,
                iterations: 1,
                fill: 'forwards'
            });

            // Reseed if missed
            animation.onfinish = () => {
                if (!balloon.classList.contains('popped') && this.rhymesArea.contains(balloon)) {
                    balloon.remove();
                    this.spawnBalloon(index); // spawn a replacement
                }
            };

            // Interaction Event
            const popEvent = (e) => {
                e.preventDefault();
                if (balloon.classList.contains('popped')) return;

                balloon.classList.add('popped');
                this.playNote(freq);
                animation.pause();

                setTimeout(() => {
                    if (this.rhymesArea.contains(balloon)) balloon.remove();
                }, 200);

                this.poppedCount++;
                if (this.poppedCount >= this.totalBalloons) {
                    this.celebration.classList.remove('hidden');
                    window.AudioManager.playSuccess();
                    window.AudioManager.speak('Great popping!');
                    setTimeout(() => this.startRound(), 3000);
                }
            };

            balloon.addEventListener('mousedown', popEvent);
            balloon.addEventListener('touchstart', popEvent, { passive: false });

        }, index * 800); // stagger
    },

    activate() {
        this.startRound();
    },

    deactivate() {
        this.rhymesArea.innerHTML = '';
    }
};

window.RhymesModule = RhymesModule;
