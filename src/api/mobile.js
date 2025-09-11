const express = require('express');
const PushNotificationService = require('../services/pushNotificationService');
const TwilioService = require('../services/twilioService');
const { UserRepository } = require('../db/userRepository');
const { GroupRepository } = require('../db/groupRepository');
const { validateRegisterPushToken, validateJoinCall } = require('../utils/helpers/validators');

const router = express.Router();
const pushNotificationService = new PushNotificationService();
const twilioService = new TwilioService();
const userRepository = new UserRepository();
const groupRepository = new GroupRepository();

// Register push token for a user
router.post('/push-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    const validation = validateRegisterPushToken({ userId, pushToken });
    
    if (validation.error) {
      return res.status(400).json({ error: validation.error.details[0].message });
    }

    const result = await pushNotificationService.registerPushToken(userId, pushToken);
    res.status(200).json({ message: 'Push token registered successfully', result });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// Unregister push token for a user
router.delete('/push-token/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pushNotificationService.unregisterPushToken(userId);
    res.status(200).json({ message: 'Push token unregistered successfully', result });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    res.status(500).json({ error: 'Failed to unregister push token' });
  }
});

// Auto-join call endpoint for mobile apps
router.post('/join-call', async (req, res) => {
  try {
    const { userId, roomSid, groupId } = req.body;
    const validation = validateJoinCall({ userId, roomSid, groupId });
    
    if (validation.error) {
      return res.status(400).json({ error: validation.error.details[0].message });
    }

    // Get user and group information
    const user = await userRepository.findById(userId);
    const group = await groupRepository.findById(groupId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is in the group
    const userInGroup = group.users.some(u => u.id === userId);
    if (!userInGroup) {
      return res.status(403).json({ error: 'User is not a member of this group' });
    }

    // Get call status from Twilio
    const callStatus = await twilioService.getCallStatus(roomSid);
    
    if (!callStatus || callStatus.status !== 'in-progress') {
      return res.status(400).json({ error: 'Call is not active' });
    }

    // Generate access token for the user
    const accessToken = await twilioService.generateUserAccessToken(user, roomSid);
    
    res.status(200).json({
      message: 'Call join information retrieved',
      callInfo: {
        roomSid,
        groupId,
        groupName: group.name,
        userId,
        userName: `${user.givenName} ${user.familyName}`,
        accessToken,
        joinUrl: `https://take5-video.herokuapp.com/join/${roomSid}?token=${accessToken}`,
        status: 'ready_to_join'
      }
    });
    
  } catch (error) {
    console.error('Error joining call:', error);
    res.status(500).json({ error: 'Failed to join call' });
  }
});

// Get active calls for a user
router.get('/active-calls/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all groups the user belongs to
    const userGroups = user.groups || [];
    
    // Get active calls for each group
    const activeCalls = [];
    for (const group of userGroups) {
      try {
        const callStatus = await twilioService.getCallStatus(group.roomSid);
        if (callStatus && callStatus.status === 'in-progress') {
          activeCalls.push({
            groupId: group.id,
            groupName: group.name,
            roomSid: group.roomSid,
            status: callStatus.status,
            startTime: callStatus.startTime,
            duration: group.duration
          });
        }
      } catch (error) {
        console.error(`Error checking call status for group ${group.id}:`, error);
      }
    }

    res.status(200).json({
      message: 'Active calls retrieved',
      activeCalls,
      count: activeCalls.length
    });
    
  } catch (error) {
    console.error('Error getting active calls:', error);
    res.status(500).json({ error: 'Failed to get active calls' });
  }
});

// End call for a user
router.post('/end-call', async (req, res) => {
  try {
    const { userId, roomSid } = req.body;
    
    if (!roomSid) {
      return res.status(400).json({ error: 'Room SID is required' });
    }

    const result = await twilioService.endCall(roomSid);
    
    res.status(200).json({
      message: 'Call ended successfully',
      result
    });
    
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

module.exports = router;
