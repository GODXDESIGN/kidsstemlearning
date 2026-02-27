const express = require('express');
const cors = require('cors');
const path = require('path');
const dbApi = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Robust parsing of incoming JSON data
app.use(express.static(path.join(__dirname, '.'))); // Also serve the static files

// --- REST API Routes ---

/**
 * GET /api/progress/:userId
 * Retrieves the child's progress from the SQLite database.
 */
app.get('/api/progress/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        let row = await dbApi.getProgress(userId);

        if (!row) {
            // User doesn't exist, create default
            const defaultData = {
                abcLevel: 1, abcStreak: 0,
                puzzleLevel: 1, puzzleStreak: 0,
                wordsMastered: []
            };
            await dbApi.createProgress(userId, defaultData);
            return res.status(200).json(defaultData);
        }

        // Parse the stored JSON array string back into an array
        if (row.wordsMastered) {
            try {
                row.wordsMastered = JSON.parse(row.wordsMastered);
            } catch (e) {
                row.wordsMastered = [];
            }
        }

        res.status(200).json(row);
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({ error: "Internal Server Error while fetching progress" });
    }
});

/**
 * POST /api/progress/:userId
 * Updates the child's progress safely.
 */
app.post('/api/progress/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;

        // Input Validation (Basic type checking to ensure robustness)
        if (typeof data !== 'object' || data === null) {
            return res.status(400).json({ error: "Invalid payload format. Expected JSON object." });
        }

        // Check if user exists before updating
        const existing = await dbApi.getProgress(userId);
        if (!existing) {
            // If they somehow didn't GET first, create them before updating
            await dbApi.createProgress(userId, data);
        } else {
            await dbApi.updateProgress(userId, data);
        }

        res.status(200).json({ success: true, message: "Progress saved." });
    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ error: "Internal Server Error while saving progress" });
    }
});

// --- Server Initialization ---
app.listen(PORT, () => {
    console.log(`Professional Backend Server running on port ${PORT}`);
    console.log(`Serving static kids app files...`);
    console.log(`API configured with SQLite Database at database.sqlite`);
});
