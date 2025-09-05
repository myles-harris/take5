const express = require('express');
const ChimeService = require('../services/chimeService');
const { GroupRepository } = require('../db/groupRepository');
const { validateCreateCall, validateCallId, validateAddParticipant, validateRemoveParticipant } = require('../utils/helpers/validators');

const router = express.Router();
const chimeService = new ChimeService();
const groupRepository = new GroupRepository();
const { UserRepository } = require("../db/userRepository");
const userRepository = new UserRepository();

/**
 * Create a video call for a group
 * POST /api/chime/call
 */
router.post('/call', async (req, res) => {
    try {
        const { error, value } = validateCreateCall(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { groupId, scheduledTime } = value;
        
        // Get group details
        const group = await groupRepository.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Create video call
        const call = await chimeService.createGroupCall(group, scheduledTime);
        
        // Send SMS notifications
        const smsResult = await chimeService.sendSMSNotification(group.users, call);
        console.log('SENDING SMS:', smsResult);

        res.status(201).json({
            message: 'Video call created successfully',
            call: call
        });

    } catch (error) {
        console.error('Error creating video call:', error.message);
        res.status(500).json({ error: 'Failed to create video call' });
    }
});

/**
 * Start a video call
 * POST /api/chime/call/:callId/start
 */
router.post('/call/:callId/start', async (req, res) => {
    try {
        const { error, value } = validateCallId(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { callId } = value;
        const result = await chimeService.startCall(callId);

        res.json({
            message: 'Video call started successfully',
            result: result
        });

    } catch (error) {
        console.error('Error starting video call:', error.message);
        res.status(500).json({ error: 'Failed to start video call' });
    }
});

/**
 * End a video call
 * POST /api/chime/call/:callId/end
 */
router.post('/call/:callId/end', async (req, res) => {
    try {
        const { error, value } = validateCallId(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { callId } = value;
        const result = await chimeService.endCall(callId);

        res.json({
            message: 'Video call ended successfully',
            result: result
        });

    } catch (error) {
        console.error('Error ending video call:', error.message);
        res.status(500).json({ error: 'Failed to end video call' });
    }
});

/**
 * Get video call status
 * GET /api/chime/call/:callId
 */
router.get('/call/:callId', async (req, res) => {
    try {
        const { error, value } = validateCallId(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { callId } = value;
        const status = await chimeService.getCallStatus(callId);

        res.json({
            message: 'Video call status retrieved successfully',
            status: status
        });

    } catch (error) {
        console.error('Error getting video call status:', error.message);
        res.status(500).json({ error: 'Failed to get video call status' });
    }
});

/**
 * Add participant to video call
 * POST /api/chime/call/:callId/participants
 */
router.post('/call/:callId/participants', async (req, res) => {
    try {
        const { error, value } = validateAddParticipant({ ...req.params, ...req.body });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { callId, userId } = value;
        
        // Get user details
        const user = await userRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await chimeService.addParticipant(callId, user);

        res.json({
            message: 'Participant added successfully',
            result: result
        });

    } catch (error) {
        console.error('Error adding participant:', error.message);
        res.status(500).json({ error: 'Failed to add participant' });
    }
});

/**
 * Remove participant from video call
 * DELETE /api/chime/call/:callId/participants/:attendeeId
 */
router.delete('/call/:callId/participants/:attendeeId', async (req, res) => {
    try {
        const { error, value } = validateRemoveParticipant(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { callId, attendeeId } = value;
        const result = await chimeService.removeParticipant(callId, attendeeId);

        res.json({
            message: 'Participant removed successfully',
            result: result
        });

    } catch (error) {
        console.error('Error removing participant:', error.message);
        res.status(500).json({ error: 'Failed to remove participant' });
    }
});

/**
 * Send SMS notification
 * POST /api/chime/sms
 */
router.post('/sms', async (req, res) => {
    try {
        const { users, message } = req.body;
        
        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: 'Users array is required' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const results = [];
        for (const user of users) {
            const result = await chimeService.sendSMSNotification([user], { 
                scheduledTime: new Date(),
                joinUrl: 'https://chime.aws/join/test'
            });
            results.push(result);
        }

        res.json({
            message: 'SMS notifications sent successfully',
            results: results
        });

    } catch (error) {
        console.error('Error sending SMS:', error.message);
        res.status(500).json({ error: 'Failed to send SMS notifications' });
    }
});

/**
 * Get video call analytics
 * GET /api/chime/call/:callId/analytics
 */
router.get('/call/:callId/analytics', async (req, res) => {
    try {
        const { error, value } = validateCallId(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { callId } = value;
        const analytics = await chimeService.getCallAnalytics(callId);

        res.json({
            message: 'Video call analytics retrieved successfully',
            analytics: analytics
        });

    } catch (error) {
        console.error('Error getting video call analytics:', error.message);
        res.status(500).json({ error: 'Failed to get video call analytics' });
    }
});

/**
 * Schedule a video call for a group
 * POST /api/chime/schedule
 */
router.post('/schedule', async (req, res) => {
    try {
        const { groupId, scheduledTime } = req.body;
        
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        if (!scheduledTime) {
            return res.status(400).json({ error: 'Scheduled time is required' });
        }

        // Get group details
        const group = await groupRepository.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Create video call
        const call = await chimeService.createGroupCall(group, scheduledTime);
        
        // Send SMS notifications
        const smsResult = await chimeService.sendSMSNotification(group.users, call);

        res.status(201).json({
            message: 'Video call scheduled successfully',
            call: call,
            smsResult: smsResult
        });

    } catch (error) {
        console.error('Error scheduling video call:', error.message);
        res.status(500).json({ error: 'Failed to schedule video call' });
    }
});

module.exports = router;
