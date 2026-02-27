/**
 * Progress Tracker (PerformanceEngine)
 * Tracks the child's interactions. Analyzes wins/fails to serve 
 * appropriate difficulty in the games.
 * 
 * PRO VERSION: Syncs with Node.js/SQLite backend for robust, permanent storage.
 */
class ProgressTracker {
    constructor() {
        this.userId = 'demo_child_1'; // In a real app, this would come from a login layer
        this.data = {
            abcLevel: 1,
            abcStreak: 0,
            puzzleLevel: 1,
            puzzleStreak: 0,
            wordsMastered: []
        };
        this.initServerData();
    }

    async initServerData() {
        try {
            const response = await fetch(`http://localhost:3000/api/progress/${this.userId}`);
            if (response.ok) {
                const serverData = await response.json();
                this.data = { ...this.data, ...serverData };
                console.log("Successfully loaded robust Server Data:", this.data);

                // If parents dashboard is open, refresh it
                const statsList = document.getElementById('progress-list');
                if (statsList && document.getElementById('screen-parents').classList.contains('active')) {
                    statsList.innerHTML = this.getStatsHTML();
                }
            } else {
                console.warn("Failed to load server data. Using local defaults.");
            }
        } catch (error) {
            console.error("Backend offline. Make sure to run `node server.js`:", error);
        }
    }

    async save() {
        try {
            await fetch(`http://localhost:3000/api/progress/${this.userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
        } catch (error) {
            console.error("Failed to sync progress with backend:", error);
        }
    }

    // Called when user successfully completes a test
    recordSuccess(module) {
        if (module === 'abc') {
            this.data.abcStreak += 1;
            // Every 3 correct answers in a row, increase difficulty
            if (this.data.abcStreak >= 3 && this.data.abcLevel < 3) {
                this.data.abcLevel += 1;
                this.data.abcStreak = 0; // reset streak for next tier
                console.log(`ABC Leveled Up! Now Tier ${this.data.abcLevel}`);
            }
        }
        else if (module === 'puzzle') {
            this.data.puzzleStreak += 1;
            if (this.data.puzzleStreak >= 2 && this.data.puzzleLevel < 3) {
                this.data.puzzleLevel += 1;
                this.data.puzzleStreak = 0;
            }
        }
        this.save();
    }

    // Called when the user makes a mistake
    recordFailure(module) {
        if (module === 'abc') {
            this.data.abcStreak = 0; // Break streak
            // To prevent frustration, if they fail immediately, lower the difficulty
            if (this.data.abcLevel > 1) {
                this.data.abcLevel -= 1;
                console.log(`ABC Leveled Down to Tier ${this.data.abcLevel} to prevent frustration.`);
            }
        }
        else if (module === 'puzzle') {
            this.data.puzzleStreak = 0;
            if (this.data.puzzleLevel > 1) {
                this.data.puzzleLevel -= 1;
            }
        }
        this.save();
    }

    getDifficulty(module) {
        return this.data[`${module}Level`] || 1;
    }

    // For the Parents Dashboard
    getStatsHTML() {
        return `
            <li>ABC Difficulty Tier: <strong>Level ${this.data.abcLevel} / 3</strong></li>
            <li>Puzzle Difficulty Tier: <strong>Level ${this.data.puzzleLevel} / 3</strong></li>
            <li>Words Mastered: <strong>${this.data.wordsMastered ? this.data.wordsMastered.length : 0} words</strong></li>
        `;
    }
}

window.ProgressEngine = new ProgressTracker();
