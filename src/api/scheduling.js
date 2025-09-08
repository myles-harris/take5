const express = require('express');

const router = express.Router();

// Temporarily disable scheduling service to focus on video calling only
console.log('Scheduling service temporarily disabled - focusing on video calling only');

/**
 * Get scheduling service status
 * GET /api/scheduling/stats
 */
router.get('/stats', (req, res) => {
    res.json({
        message: 'Scheduling service temporarily disabled',
        stats: {
            totalCalls: 0,
            scheduled: 0,
            executing: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            isRunning: false,
            message: 'Scheduling disabled - video calling only mode'
        }
    });
});

/**
 * Get all scheduled calls
 * GET /api/scheduling/calls
 */
router.get('/calls', (req, res) => {
    res.json({
        message: 'Scheduling service temporarily disabled',
        calls: [],
        count: 0
    });
});

/**
 * Schedule a call
 * POST /api/scheduling/schedule
 */
router.post('/schedule', (req, res) => {
    res.json({
        message: 'Scheduling service temporarily disabled',
        note: 'Focusing on video calling functionality only'
    });
});

module.exports = router;
