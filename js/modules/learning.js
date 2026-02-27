/**
 * Learning Module (ABC & Words)
 * Utilizes the adaptive ProgressTracker engine to scale difficulty
 */
const LearningModule = {
    letters: Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    currentAnswer: null,

    init() {
        this.grid = document.getElementById('abc-grid');
        this.title = document.getElementById('abc-title');
        this.celebration = document.getElementById('abc-celebration');
    },

    startRound() {
        this.grid.innerHTML = '';
        this.celebration.classList.add('hidden');

        // 1. Ask ProgressTracker for difficulty (1, 2, or 3)
        const difficulty = window.ProgressEngine.getDifficulty('abc');

        // 2. Determine number of options based on difficulty level
        const numOptions = difficulty === 1 ? 2 : (difficulty === 2 ? 3 : 4);

        // 3. Pick random letters for the round
        let options = [];
        while (options.length < numOptions) {
            let r = this.letters[Math.floor(Math.random() * this.letters.length)];
            if (!options.includes(r)) options.push(r);
        }

        // 4. Set the answer
        this.currentAnswer = options[Math.floor(Math.random() * options.length)];

        // 5. Update UI
        this.title.textContent = `Find the letter ${this.currentAnswer}`;
        window.AudioManager.speak(`Find the letter ${this.currentAnswer}`);

        // 6. Render Flashcards
        options.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'flashcard';
            btn.textContent = letter;

            // Random vibrant background for kids
            const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--success)', '#8b5cf6'];
            btn.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            btn.onclick = () => this.handleGuess(letter, btn);
            this.grid.appendChild(btn);
        });
    },

    handleGuess(letter, buttonEl) {
        if (letter === this.currentAnswer) {
            // Correct!
            window.AudioManager.playSuccess();
            window.AudioManager.speak(`Yes! ${letter}.`);

            // Give massive visual reward
            this.celebration.classList.remove('hidden');
            window.ProgressEngine.recordSuccess('abc'); // Tell Tracker we won!

            // Next round after brief delay
            setTimeout(() => {
                this.startRound();
            }, 2500);

        } else {
            // Wrong
            window.AudioManager.playBounce(); // friendly bounce sound instead of scary 'buzz'
            buttonEl.classList.add('wrong');
            window.ProgressEngine.recordFailure('abc'); // Tell Tracker we messed up

            setTimeout(() => {
                buttonEl.classList.remove('wrong');
            }, 400);

            window.AudioManager.speak(`Oops, that's ${letter}. Try to find ${this.currentAnswer}.`);
        }
    },

    activate() {
        this.startRound();
    },
    deactivate() {
        this.grid.innerHTML = '';
    }
};

window.LearningModule = LearningModule;
