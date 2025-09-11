const twilio = require('twilio');
const PushNotificationService = require('./pushNotificationService');
const RoomCleanupService = require('./roomCleanupService');

class TwilioService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.apiKeySid = process.env.TWILIO_API_KEY_SID;
        this.apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
        
        this.isConfigured = !!this.accountSid && !!this.authToken;
        this.hasApiKeys = !!this.apiKeySid && !!this.apiKeySecret;
        this.pushNotificationService = new PushNotificationService();
        this.roomCleanupService = new RoomCleanupService();
        
        if (this.isConfigured) {
            this.client = twilio(this.accountSid, this.authToken);
        }
        
        console.log('TwilioService initialized:', {
            isConfigured: this.isConfigured,
            hasAccountSid: !!this.accountSid,
            hasAuthToken: !!this.authToken,
            hasApiKeys: this.hasApiKeys
        });
    }

    /**
     * Create a video call for a group using Twilio Video
     * @param {Object} group - Group object with users
     * @param {Date} scheduledTime - When the call should be scheduled
     * @returns {Object} Call details
     */
    async createGroupCall(group, scheduledTime) {
        try {
            console.log(`Creating Twilio video call for group: ${group.name} (ID: ${group.id})`);
            
            const callId = `take5-video-${group.id}-${Date.now()}`;
            
            // Check if Twilio is configured
            if (!this.isConfigured) {
                console.log('Simulating Twilio video call creation:', callId);
                return this.simulateVideoCallCreation(group, callId, scheduledTime);
            }

            // Create a Twilio Video Room
            const room = await this.createVideoRoom(callId, group);
            
            // Generate access tokens for each user (if API keys are available)
            let participants = [];
            if (this.hasApiKeys) {
                participants = await this.createParticipants(group, room.sid);
            } else {
                console.log('API keys not available - creating basic participant info');
                participants = group.users.map(user => ({
                    userId: user.id,
                    phoneNumber: user.phoneNumber,
                    identity: `user-${user.id}-${user.phoneNumber}`,
                    message: 'Access token requires API keys'
                }));
            }
            
            // Register room for automatic cleanup
            this.roomCleanupService.registerRoom(room.sid, scheduledTime, group.duration, group.id);
            
            // Send push notifications to group members
            const pushResults = await this.pushNotificationService.sendCallNotification(group, {
                roomSid: room.sid,
                roomName: room.uniqueName,
                joinUrl: `http://localhost:3000/join.html?roomSid=${room.sid}&token=${participants[0]?.accessToken || ''}&scheduledTime=${scheduledTime.toISOString()}`,
                scheduledTime: scheduledTime.toISOString()
            });
            
            return {
                callId,
                status: 'created',
                groupId: group.id,
                groupName: group.name,
                participants: group.users.length,
                scheduledTime: scheduledTime.toISOString(),
                duration: group.duration,
                phoneNumbers: group.users.map(user => user.phoneNumber),
                roomSid: room.sid,
                roomName: room.uniqueName,
                participants: participants,
                joinUrl: `http://localhost:3000/join.html?roomSid=${room.sid}&token=${participants[0]?.accessToken || ''}&scheduledTime=${scheduledTime.toISOString()}`,
                message: this.hasApiKeys ? 'Video call created with access tokens' : 'Video room created - access tokens require API keys',
                smsResults: { sent: 0, failed: 0, message: 'SMS disabled - video call only' },
                pushResults: pushResults
            };
            
        } catch (error) {
            console.error('Error creating Twilio video call:', error);
            throw error;
        }
    }

    /**
     * Create a Twilio Video Room
     * @param {string} callId - Unique call identifier
     * @param {Object} group - Group object
     * @returns {Object} Room details
     */
    async createVideoRoom(callId, group) {
        try {
            if (!this.isConfigured) {
                return {
                    sid: `RM${callId}`,
                    uniqueName: callId,
                    status: 'in-progress'
                };
            }

            const room = await this.client.video.rooms.create({
                uniqueName: callId,
                type: 'group',
                recordParticipantsOnConnect: false
            });

            console.log('Twilio video room created:', room.sid);
            return room;
        } catch (error) {
            console.error('Error creating video room:', error);
            throw error;
        }
    }

    /**
     * Create participants with access tokens
     * @param {Object} group - Group object with users
     * @param {string} roomSid - Twilio Video Room SID
     * @returns {Array} Array of participant objects with access tokens
     */
    async createParticipants(group, roomSid) {
        try {
            const participants = [];

            for (const user of group.users) {
                const accessToken = twilio.jwt.AccessToken;
                const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
                    room: roomSid
                });

                const token = new accessToken(
                    this.accountSid,
                    this.apiKeySid || this.accountSid,
                    this.apiKeySecret || this.authToken,
                    { identity: `user-${user.id}-${user.phoneNumber}` }
                );

                token.addGrant(videoGrant);
                token.ttl = 3600; // 1 hour

                participants.push({
                    userId: user.id,
                    phoneNumber: user.phoneNumber,
                    identity: `user-${user.id}-${user.phoneNumber}`,
                    accessToken: token.toJwt(),
                    joinUrl: `http://localhost:3000/join.html?roomSid=${roomSid}&token=${token.toJwt()}&scheduledTime=${new Date().toISOString()}`
                });
            }

            console.log(`Created ${participants.length} participant access tokens`);
            return participants;

        } catch (error) {
            console.error('Error creating participants:', error);
            throw error;
        }
    }

    /**
     * Generate access token for a user to join a specific room
     * @param {Object} user - User object
     * @param {string} roomSid - Twilio Video Room SID
     * @returns {string} JWT access token
     */
    async generateUserAccessToken(user, roomSid) {
        try {
            if (!this.isConfigured || !this.hasApiKeys) {
                console.log('Simulating access token generation');
                return `simulated_token_${user.id}_${roomSid}`;
            }

            const accessToken = twilio.jwt.AccessToken;
            const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
                room: roomSid
            });

            const token = new accessToken(
                this.accountSid,
                this.apiKeySid,
                this.apiKeySecret,
                { identity: `user-${user.id}-${user.phoneNumber}` }
            );

            token.addGrant(videoGrant);
            token.ttl = 3600; // 1 hour

            return token.toJwt();
        } catch (error) {
            console.error('Error generating user access token:', error);
            throw error;
        }
    }

    /**
     * Get call status
     * @param {string} roomSid - Twilio Video Room SID
     * @returns {Object} Call status
     */
    async getCallStatus(roomSid) {
        try {
            if (!this.isConfigured) {
                return this.simulateCallStatus(roomSid);
            }

            const room = await this.client.video.rooms(roomSid).fetch();
            return {
                roomSid: room.sid,
                status: room.status,
                dateCreated: room.dateCreated,
                dateUpdated: room.dateUpdated
            };
        } catch (error) {
            console.error('Error getting call status:', error);
            throw error;
        }
    }

    /**
     * End a call
     * @param {string} roomSid - Twilio Video Room SID
     * @returns {Object} End call result
     */
    async endCall(roomSid) {
        try {
            if (!this.isConfigured) {
                return { success: true, message: 'Simulated call ended' };
            }

            await this.client.video.rooms(roomSid).update({ status: 'completed' });
            return { success: true, message: 'Call ended successfully' };
        } catch (error) {
            console.error('Error ending call:', error);
            throw error;
        }
    }

    /**
     * Add participant to call
     * @param {string} roomSid - Twilio Video Room SID
     * @param {string} identity - Participant identity
     * @returns {Object} Add participant result
     */
    async addParticipant(roomSid, identity) {
        try {
            if (!this.isConfigured) {
                return { success: true, message: 'Simulated participant added' };
            }

            const participant = await this.client.video.rooms(roomSid).participants.create({
                identity: identity
            });

            return { success: true, participant };
        } catch (error) {
            console.error('Error adding participant:', error);
            throw error;
        }
    }

    /**
     * Remove participant from call
     * @param {string} roomSid - Twilio Video Room SID
     * @param {string} identity - Participant identity
     * @returns {Object} Remove participant result
     */
    async removeParticipant(roomSid, identity) {
        try {
            if (!this.isConfigured) {
                return { success: true, message: 'Simulated participant removed' };
            }

            await this.client.video.rooms(roomSid).participants(identity).remove();
            return { success: true, message: 'Participant removed successfully' };
        } catch (error) {
            console.error('Error removing participant:', error);
            throw error;
        }
    }

    /**
     * Get call analytics
     * @param {string} roomSid - Twilio Video Room SID
     * @returns {Object} Call analytics
     */
    async getCallAnalytics(roomSid) {
        try {
            if (!this.isConfigured) {
                return this.simulateCallAnalytics(roomSid);
            }

            const room = await this.client.video.rooms(roomSid).fetch();
            const participants = await this.client.video.rooms(roomSid).participants.list();

            return {
                roomSid: room.sid,
                duration: Math.floor((new Date() - new Date(room.dateCreated)) / 1000),
                participants: participants.length,
                status: room.status,
                dateCreated: room.dateCreated,
                dateUpdated: room.dateUpdated
            };
        } catch (error) {
            console.error('Error getting call analytics:', error);
            throw error;
        }
    }

    /**
     * Simulate video call creation for testing
     */
    simulateVideoCallCreation(group, callId, scheduledTime) {
        console.log('Simulating Twilio video call creation');
        
        return {
            callId,
            status: 'created',
            groupId: group.id,
            groupName: group.name,
            participants: group.users.length,
            scheduledTime: scheduledTime.toISOString(),
            duration: group.duration,
            phoneNumbers: group.users.map(user => user.phoneNumber),
            roomSid: `RM${callId}`,
            roomName: callId,
            participants: group.users.map(user => ({
                userId: user.id,
                phoneNumber: user.phoneNumber,
                identity: `user-${user.id}-${user.phoneNumber}`,
                accessToken: `simulated_token_${user.id}`,
                joinUrl: `https://take5-video.herokuapp.com/join/RM${callId}?token=simulated_token_${user.id}`
            })),
            joinUrl: `https://take5-video.herokuapp.com/join/RM${callId}`,
            message: 'Simulated video call created',
            smsResults: { sent: 0, failed: 0, message: 'SMS disabled - video call only' },
            pushResults: { sent: group.users.length, failed: 0, message: 'Simulated push notifications sent', simulated: true }
        };
    }

    /**
     * Simulate call status
     */
    simulateCallStatus(roomSid) {
        return {
            roomSid,
            status: 'in-progress',
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString()
        };
    }

    /**
     * Simulate call analytics
     */
    simulateCallAnalytics(roomSid) {
        return {
            roomSid,
            duration: 300, // 5 minutes
            participants: 1,
            status: 'completed',
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString()
        };
    }
}

module.exports = TwilioService;
