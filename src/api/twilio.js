const express = require('express');
const TwilioService = require('../services/twilioService');
const { GroupRepository } = require('../db/groupRepository');
const { UserRepository } = require('../db/userRepository');
const { validateCreateCall, validateAddParticipant } = require('../utils/helpers/validators');

const router = express.Router();
const twilioService = new TwilioService();
const groupRepository = new GroupRepository();
const userRepository = new UserRepository();

/**
 * Create a video call for a group
 * POST /api/twilio/call
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

        // Create the video call
        const callResult = await twilioService.createGroupCall(group, new Date(scheduledTime));
        
        res.status(201).json({
            message: 'Video call created successfully',
            call: callResult
        });
        
    } catch (error) {
        console.error('Error creating video call:', error);
        res.status(500).json({ error: 'Failed to create video call' });
    }
});

/**
 * Get call status
 * GET /api/twilio/call/:roomSid
 */
router.get('/call/:roomSid', async (req, res) => {
    try {
        const { roomSid } = req.params;
        
        if (!roomSid) {
            return res.status(400).json({ error: 'Room SID is required' });
        }

        const callStatus = await twilioService.getCallStatus(roomSid);
        
        res.json({
            message: 'Call status retrieved successfully',
            call: callStatus
        });
        
    } catch (error) {
        console.error('Error getting call status:', error);
        res.status(500).json({ error: 'Failed to get call status' });
    }
});

/**
 * End a video call
 * DELETE /api/twilio/call/:roomSid
 */
router.delete('/call/:roomSid', async (req, res) => {
    try {
        const { roomSid } = req.params;
        
        if (!roomSid) {
            return res.status(400).json({ error: 'Room SID is required' });
        }

        const endResult = await twilioService.endCall(roomSid);
        
        res.json({
            message: 'Call ended successfully',
            result: endResult
        });
        
    } catch (error) {
        console.error('Error ending call:', error);
        res.status(500).json({ error: 'Failed to end call' });
    }
});

/**
 * Add a participant to a call
 * POST /api/twilio/call/:roomSid/participants
 */
router.post('/call/:roomSid/participants', async (req, res) => {
    try {
        const { roomSid } = req.params;
        const { error, value } = validateAddParticipant(req.body);
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { userId } = value;
        
        // Get user details
        const user = await userRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add participant to call
        const participant = await twilioService.addParticipant(roomSid, user);
        
        res.status(201).json({
            message: 'Participant added successfully',
            participant
        });
        
    } catch (error) {
        console.error('Error adding participant:', error);
        res.status(500).json({ error: 'Failed to add participant' });
    }
});

/**
 * Remove a participant from a call
 * DELETE /api/twilio/call/:roomSid/participants/:participantSid
 */
router.delete('/call/:roomSid/participants/:participantSid', async (req, res) => {
    try {
        const { roomSid, participantSid } = req.params;
        
        if (!roomSid || !participantSid) {
            return res.status(400).json({ error: 'Room SID and Participant SID are required' });
        }
        
        // Remove participant from call
        const result = await twilioService.removeParticipant(roomSid, participantSid);
        
        res.json({
            message: 'Participant removed successfully',
            result
        });
        
    } catch (error) {
        console.error('Error removing participant:', error);
        res.status(500).json({ error: 'Failed to remove participant' });
    }
});

/**
 * Get call analytics
 * GET /api/twilio/analytics/:roomSid
 */
router.get('/analytics/:roomSid', async (req, res) => {
    try {
        const { roomSid } = req.params;
        
        if (!roomSid) {
            return res.status(400).json({ error: 'Room SID is required' });
        }

        const callStatus = await twilioService.getCallStatus(roomSid);
        
        // Basic analytics based on call status
        const analytics = {
            roomSid,
            duration: callStatus.dateUpdated ? 
                new Date(callStatus.dateUpdated) - new Date(callStatus.dateCreated) : 0,
            participantCount: callStatus.participantCount,
            maxParticipants: callStatus.maxParticipants,
            status: callStatus.status,
            participants: callStatus.participants
        };
        
        res.json({
            message: 'Call analytics retrieved successfully',
            analytics
        });
        
    } catch (error) {
        console.error('Error getting call analytics:', error);
        res.status(500).json({ error: 'Failed to get call analytics' });
    }
});

module.exports = router;
