const { Expo } = require('expo-server-sdk');

class PushNotificationService {
  constructor() {
    this.expo = new Expo();
    this.isConfigured = !!process.env.EXPO_ACCESS_TOKEN;
    
    console.log('PushNotificationService initialized:', {
      isConfigured: this.isConfigured,
      hasExpoToken: !!process.env.EXPO_ACCESS_TOKEN
    });
  }

  async sendCallNotification(group, callData) {
    try {
      console.log(`Sending push notification for group: ${group.name} (ID: ${group.id})`);

      if (!this.isConfigured) {
        console.log('Simulating push notification (Expo not configured)');
        return this.simulateNotification(group, callData);
      }

      // Get push tokens for all users in the group
      const pushTokens = await this.getPushTokensForGroup(group);
      
      if (pushTokens.length === 0) {
        console.log('No push tokens found for group members');
        return { sent: 0, failed: 0, message: 'No push tokens available' };
      }

      // Create notification messages
      const messages = pushTokens.map(pushToken => ({
        to: pushToken,
        sound: 'default',
        title: 'Take5 Video Call Starting',
        body: `Your ${group.name} call is starting now!`,
        data: {
          type: 'video_call',
          groupId: group.id,
          groupName: group.name,
          roomSid: callData.roomSid,
          roomName: callData.roomName,
          joinUrl: callData.joinUrl,
          scheduledTime: callData.scheduledTime,
          duration: group.duration
        },
        priority: 'high',
        channelId: 'video_calls'
      }));

      // Send notifications in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      // Log results
      const results = this.processNotificationResults(tickets);
      console.log(`Push notifications sent: ${results.sent} successful, ${results.failed} failed`);

      return results;

    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  async getPushTokensForGroup(group) {
    try {
      // In a real implementation, you'd fetch push tokens from your database
      // For now, we'll simulate this
      const pushTokens = [];
      
      for (const user of group.users) {
        // Simulate push token retrieval
        // In production, you'd query your database for the user's push token
        const pushToken = await this.getUserPushToken(user.id);
        if (pushToken) {
          pushTokens.push(pushToken);
        }
      }

      return pushTokens;
    } catch (error) {
      console.error('Error getting push tokens for group:', error);
      return [];
    }
  }

  async getUserPushToken(userId) {
    try {
      // In production, this would query your database
      // For now, we'll simulate push tokens
      console.log(`Getting push token for user ${userId}`);
      
      // Simulate Expo push token format
      return `ExponentPushToken[${userId}_${Date.now()}]`;
    } catch (error) {
      console.error('Error getting user push token:', error);
      return null;
    }
  }

  processNotificationResults(tickets) {
    let sent = 0;
    let failed = 0;

    for (const ticket of tickets) {
      if (ticket.status === 'ok') {
        sent++;
      } else {
        failed++;
        console.error('Push notification failed:', ticket.message);
      }
    }

    return { sent, failed, message: `Sent ${sent} notifications, ${failed} failed` };
  }

  simulateNotification(group, callData) {
    console.log('=== SIMULATED PUSH NOTIFICATION ===');
    console.log(`Group: ${group.name}`);
    console.log(`Room SID: ${callData.roomSid}`);
    console.log(`Join URL: ${callData.joinUrl}`);
    console.log(`Scheduled Time: ${callData.scheduledTime}`);
    console.log('=====================================');

    return {
      sent: group.users.length,
      failed: 0,
      message: 'Simulated push notifications sent',
      simulated: true
    };
  }

  // Method to register a user's push token
  async registerPushToken(userId, pushToken) {
    try {
      console.log(`Registering push token for user ${userId}: ${pushToken}`);
      
      // In production, you'd save this to your database
      // For now, we'll just log it
      
      return { success: true, message: 'Push token registered successfully' };
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  // Method to unregister a user's push token
  async unregisterPushToken(userId) {
    try {
      console.log(`Unregistering push token for user ${userId}`);
      
      // In production, you'd remove this from your database
      
      return { success: true, message: 'Push token unregistered successfully' };
    } catch (error) {
      console.error('Error unregistering push token:', error);
      throw error;
    }
  }
}

module.exports = PushNotificationService;
