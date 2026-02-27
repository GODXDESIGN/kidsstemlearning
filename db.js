const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database initialization
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Setup initial tables
        db.run(`
            CREATE TABLE IF NOT EXISTS progress (
                userId TEXT PRIMARY KEY,
                abcLevel INTEGER DEFAULT 1,
                abcStreak INTEGER DEFAULT 0,
                puzzleLevel INTEGER DEFAULT 1,
                puzzleStreak INTEGER DEFAULT 0,
                wordsMastered TEXT DEFAULT '[]'
            )
        `, (err) => {
            if (err) {
                console.error("Error creating progress table", err);
            } else {
                console.log("Progress table ready.");
            }
        });
    }
});

// Helper functions wrapping sqlite queries in Promises for robust async/await usage
const getProgress = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM progress WHERE userId = ?', [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const createProgress = (userId, initialData) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO progress (userId, abcLevel, abcStreak, puzzleLevel, puzzleStreak, wordsMastered) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            userId,
            initialData.abcLevel || 1,
            initialData.abcStreak || 0,
            initialData.puzzleLevel || 1,
            initialData.puzzleStreak || 0,
            JSON.stringify(initialData.wordsMastered || [])
        ];

        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...initialData });
        });
    });
};

const updateProgress = (userId, data) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE progress SET 
                        abcLevel = COALESCE(?, abcLevel),
                        abcStreak = COALESCE(?, abcStreak),
                        puzzleLevel = COALESCE(?, puzzleLevel),
                        puzzleStreak = COALESCE(?, puzzleStreak),
                        wordsMastered = COALESCE(?, wordsMastered)
                     WHERE userId = ?`;

        let wordsStr = data.wordsMastered ? JSON.stringify(data.wordsMastered) : null;
        const params = [data.abcLevel, data.abcStreak, data.puzzleLevel, data.puzzleStreak, wordsStr, userId];

        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ changes: this.changes });
        });
    });
};

module.exports = {
    db,
    getProgress,
    createProgress,
    updateProgress
};
