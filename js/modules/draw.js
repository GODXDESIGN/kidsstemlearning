/**
 * Draw module with basic Canvas strokes and Animation playback
 */
const DrawModule = {
    isDrawing: false,
    strokes: [], // records {x, y, color, isStart} for animation playback
    currentColor: '#ef4444',
    animationFrameId: null,

    init() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Size canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Bind events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events for tablets/mobiles
        this.canvas.addEventListener('touchstart', this.startDrawing.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.draw.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Buttons
        document.getElementById('btn-clear').addEventListener('click', () => {
            this.clearCanvas();
            this.strokes = [];
            window.AudioManager.playBounce();
        });

        document.getElementById('btn-animate').addEventListener('click', () => {
            this.playAnimation();
            window.AudioManager.playSuccess();
        });

        // Palette
        const paletteBtns = document.querySelectorAll('.color-btn');
        paletteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                paletteBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
                window.AudioManager.playBounce();
            });
        });

        // Initial setup
        this.ctx.lineWidth = 15; // thick for toddlers
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    },

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(container.clientWidth - 20, 800);
        this.canvas.height = 400; // fixed height
        this.ctx.lineWidth = 15;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.clearCanvas(); // redrawing on resize is complex, simple clear is okay for toddlers.
    },

    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Handle touch or mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    },

    startDrawing(e) {
        e.preventDefault(); // prevents scrolling
        if (this.animationFrameId) return; // don't draw while animating

        this.isDrawing = true;
        const pos = this.getCoordinates(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);

        // Record stroke start
        this.strokes.push({ x: pos.x, y: pos.y, color: this.currentColor, start: true });
    },

    draw(e) {
        e.preventDefault();
        if (!this.isDrawing || this.animationFrameId) return;

        const pos = this.getCoordinates(e);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();

        // Record for playback
        this.strokes.push({ x: pos.x, y: pos.y, color: this.currentColor, start: false });
    },

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    },

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    playAnimation() {
        if (this.strokes.length === 0) return;

        // Stop any current animation
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        this.clearCanvas();
        let i = 0;

        const animateFrame = () => {
            if (i >= this.strokes.length) {
                this.animationFrameId = null;
                return; // done
            }

            const pt = this.strokes[i];

            if (pt.start) {
                this.ctx.beginPath();
                this.ctx.moveTo(pt.x, pt.y);
            } else {
                this.ctx.strokeStyle = pt.color;
                this.ctx.lineTo(pt.x, pt.y);
                this.ctx.stroke();
            }

            i++;
            // requestAnimationFrame draws too fast for a toddler to appreciate. Wrap in slight timeout or modulo
            this.animationFrameId = requestAnimationFrame(animateFrame);
        };

        this.animationFrameId = requestAnimationFrame(animateFrame);
    },

    activate() {
        // Redraw current strokes if returning to the page
        if (this.strokes.length > 0) {
            this.clearCanvas();
            this.strokes.forEach(pt => {
                if (pt.start) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(pt.x, pt.y);
                } else {
                    this.ctx.strokeStyle = pt.color;
                    this.ctx.lineTo(pt.x, pt.y);
                    this.ctx.stroke();
                }
            });
        }
    },
    deactivate() { }
};

window.DrawModule = DrawModule;
