/**
 * Puzzle Module (Drag & Drop Shapes)
 * Also utilizes the Progress Tracker
 */
const PuzzleModule = {
    shapes: [
        { id: 'circle', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>' },
        { id: 'square', svg: '<svg viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" rx="10" fill="currentColor"/></svg>' },
        { id: 'triangle', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 95,95 5,95" fill="currentColor"/></svg>' },
        { id: 'star', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 68,55 78,85 50,70 22,85 32,55 5,35 39,35" fill="currentColor"/></svg>' }
    ],
    draggedElement: null,
    matchedCount: 0,
    totalToMatch: 0,

    init() {
        this.targetsContainer = document.getElementById('puzzle-targets');
        this.piecesContainer = document.getElementById('puzzle-pieces');
        this.celebration = document.getElementById('puzzle-celebration');
    },

    startRound() {
        this.targetsContainer.innerHTML = '';
        this.piecesContainer.innerHTML = '';
        this.celebration.classList.add('hidden');
        this.matchedCount = 0;

        const difficulty = window.ProgressEngine.getDifficulty('puzzle');

        // Difficulty scaling for puzzles: 1=2 pieces, 2=3 pieces, 3=4 pieces
        this.totalToMatch = difficulty === 1 ? 2 : (difficulty === 2 ? 3 : 4);

        const roundShapes = [...this.shapes].sort(() => 0.5 - Math.random()).slice(0, this.totalToMatch);
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

        // Render Targets (silhouettes)
        roundShapes.forEach(shape => {
            const target = document.createElement('div');
            target.className = 'puzzle-target';
            target.style.cssText = `width: 120px; height: 120px; color: #cbd5e1; /* gray silhouette */`;
            target.innerHTML = shape.svg;
            target.dataset.shape = shape.id;

            // Allow Drop
            target.addEventListener('dragover', e => { e.preventDefault(); target.style.transform = 'scale(1.1)'; });
            target.addEventListener('dragleave', e => { target.style.transform = 'scale(1)'; });
            target.addEventListener('drop', e => this.handleDrop(e, target));

            // Touch fallback for toddlers is crucial, but requires complex math. 
            // We'll rely on HTML5 drag/drop where possible or simple tapping.

            this.targetsContainer.appendChild(target);
        });

        // Render Draggable Pieces (shuffled)
        const shuffled = [...roundShapes].sort(() => 0.5 - Math.random());
        shuffled.forEach((shape, i) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.cssText = `width: 120px; height: 120px; color: ${colors[i]}; cursor: grab;`;
            piece.innerHTML = shape.svg;
            piece.dataset.shape = shape.id;
            piece.draggable = true;

            piece.addEventListener('dragstart', e => {
                this.draggedElement = piece;
                e.dataTransfer.setData('text/plain', shape.id);
                setTimeout(() => piece.style.opacity = '0.5', 0);
            });
            piece.addEventListener('dragend', () => piece.style.opacity = '1');

            // Click to snap (for toddlers who can't drag well yet)
            piece.addEventListener('click', () => {
                const target = document.querySelector(`.puzzle-target[data-shape="${shape.id}"]`);
                if (target && !target.dataset.matched) {
                    this.snapPieceToTarget(piece, target);
                }
            });

            this.piecesContainer.appendChild(piece);
        });

        window.AudioManager.speak('Match the shapes');
    },

    handleDrop(e, targetEl) {
        e.preventDefault();
        targetEl.style.transform = 'scale(1)';
        const draggedShapeId = e.dataTransfer.getData('text/plain');
        const targetShapeId = targetEl.dataset.shape;

        if (draggedShapeId === targetShapeId) {
            this.snapPieceToTarget(this.draggedElement, targetEl);
        } else {
            window.AudioManager.playBounce();
            window.ProgressEngine.recordFailure('puzzle');
        }
    },

    snapPieceToTarget(pieceEl, targetEl) {
        window.AudioManager.playSuccess();
        pieceEl.style.visibility = 'hidden';
        targetEl.style.color = pieceEl.style.color; // fill silhouette with color
        targetEl.dataset.matched = 'true';
        targetEl.classList.add('snapped');

        // Animation
        targetEl.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], { duration: 300 });

        this.matchedCount++;

        if (this.matchedCount === this.totalToMatch) {
            this.celebration.classList.remove('hidden');
            window.AudioManager.speak('Great job!');
            window.ProgressEngine.recordSuccess('puzzle');
            setTimeout(() => this.startRound(), 2500);
        }
    },

    activate() {
        // Inject styles programmatically to keep CSS clean if needed
        const styles = document.createElement('style');
        styles.innerHTML = `
            .puzzle-area { display: flex; flex-direction: column; gap: 3rem; align-items: center; width:100%; max-width: 800px; padding: 2rem;}
            .puzzle-targets { display: flex; gap: 2rem; justify-content: center; width: 100%; border-bottom: 4px dashed #e2e8f0; padding-bottom: 2rem;}
            .puzzle-pieces { display: flex; gap: 2rem; justify-content: center; width: 100%; }
            .puzzle-target { transition: transform 0.2s; }
            .snapped { filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
        `;
        document.head.appendChild(styles);
        this.startRound();
    },
    deactivate() { }
};

window.PuzzleModule = PuzzleModule;
