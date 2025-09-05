const AWS = require('aws-sdk');

class ChimeService {
    constructor() {
        // Initialize AWS Chime SDK for Meetings (for video calls)
        this.chime = new AWS.ChimeSDKMeetings({
            region: 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        // Initialize SNS for SMS notifications
        this.sns = new AWS.SNS({
            region: 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        // Initialize CloudWatch for metrics
        this.cloudWatch = new AWS.CloudWatch({
            region: 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        this.outboundPhoneNumber = process.env.CHIME_OUTBOUND_PHONE_NUMBER || '+13232488474';
    }

    /**
     * Create a video call for a group that feels like an incoming FaceTime call
     * @param {Object} group - Group object with users
     * @param {Date} scheduledTime - When the call should be scheduled
     * @returns {Object} Call details
     */
    async createGroupCall(group, scheduledTime) {
        try {
            console.log(`Creating video call for group: ${group.name} (ID: ${group.id})`);
            
            const callId = `take5-video-${group.id}-${Date.now()}`;
            
            // Check if we have valid AWS credentials
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('Simulating video call creation:', callId);
                return this.simulateVideoCallCreation(group, callId, scheduledTime);
            }

            // Create a Chime meeting for the video call
            const meeting = await this.createChimeMeeting(callId, group);
            
            // Create attendees for each user
            const attendees = await this.createAttendees(meeting.Meeting.MeetingId, group.users);
            
            // Send "incoming video call" notifications to users
            await this.sendVideoCallNotifications(group.users, meeting, callId, scheduledTime);

            // Log metrics
            await this.logCallMetrics('VideoCallCreated', group.users.length);

            return {
                callId: callId,
                status: 'created',
                groupId: group.id,
                groupName: group.name,
                participants: group.users.length,
                scheduledTime: scheduledTime,
                duration: group.duration,
                phoneNumbers: group.users.map(user => this.formatPhoneNumber(user.phoneNumber)),
                meetingId: meeting.Meeting.MeetingId,
                attendees: attendees,
                joinUrl: `https://chime.aws/join/${meeting.Meeting.MeetingId}`,
                message: 'Video call created successfully - users will receive notifications to join'
            };

        } catch (error) {
            console.error('Error creating video call:', error.message);
            await this.logCallMetrics('VideoCallCreationFailed', 1);
            throw error;
        }
    }

    /**
     * Create a Chime meeting for the video call
     * @param {string} callId - Call identifier
     * @param {Object} group - Group details
     * @returns {Object} Meeting details
     */
    async createChimeMeeting(callId, group) {
        try {
            console.log('Creating Chime meeting for video call:', callId);
            
            const meeting = await this.chime.createMeeting({
                ClientRequestToken: require('uuid').v4(),
                MediaRegion: 'us-east-1',
                ExternalMeetingId: `take5-video-${group.id}-${Date.now()}`,
                MeetingFeatures: {
                    Video: {
                        MaxResolution: 'HD'
                    },
                    Audio: {
                        EchoReduction: 'AVAILABLE'
                    }
                }
            }).promise();

            console.log('Chime meeting created:', meeting.Meeting.MeetingId);
            return meeting;

        } catch (error) {
            console.error('Error creating Chime meeting:', error.message);
            throw error;
        }
    }

    /**
     * Create attendees for the meeting
     * @param {string} meetingId - Meeting ID
     * @param {Array} users - Users to add as attendees
     * @returns {Array} Attendee details
     */
    async createAttendees(meetingId, users) {
        try {
            console.log('Creating attendees for meeting:', meetingId);
            
            const attendees = [];
            
            for (const user of users) {
                const attendee = await this.chime.createAttendee({
                    MeetingId: meetingId,
                    ExternalUserId: `user-${user.id}-${user.phoneNumber}`
                }).promise();
                
                attendees.push({
                    attendeeId: attendee.Attendee.AttendeeId,
                    externalUserId: attendee.Attendee.ExternalUserId,
                    userId: user.id,
                    phoneNumber: this.formatPhoneNumber(user.phoneNumber)
                });
            }

            console.log('Created', attendees.length, 'attendees');
            return attendees;

        } catch (error) {
            console.error('Error creating attendees:', error.message);
            throw error;
        }
    }

    /**
     * Send video call notifications that feel like incoming FaceTime calls
     * @param {Array} users - Users to notify
     * @param {Object} meeting - Meeting details
     * @param {string} callId - Call ID
     * @param {Date} scheduledTime - Scheduled time
     */
    async sendVideoCallNotifications(users, meeting, callId, scheduledTime) {
        try {
            console.log('Sending video call notifications to', users.length, 'users');
            
            for (const user of users) {
                // Create a personalized join URL for each user
                const joinUrl = `https://chime.aws/join/${meeting.Meeting.MeetingId}`;
                
                // Send SMS notification that feels like an incoming video call
                const message = `📹 INCOMING VIDEO CALL from Take5!\n\n` +
                    `Your video check-in call is starting now.\n` +
                    `Tap to join: ${joinUrl}\n\n` +
                    `This is your Take5 video call - just like FaceTime!`;
                
                await this.sendSMSNotification([user], {
                    message: message,
                    callId: callId,
                    scheduledTime: scheduledTime
                });
            }

        } catch (error) {
            console.error('Error sending video call notifications:', error.message);
            throw error;
        }
    }

    /**
     * Simulate video call creation when AWS is not configured
     */
    simulateVideoCallCreation(group, callId, scheduledTime) {
        console.log('[SIMULATION] Video call would be created:', callId);
        console.log('[SIMULATION] Users would receive "incoming video call" notifications');
        
        return {
            callId: callId,
            status: 'created',
            groupId: group.id,
            groupName: group.name,
            participants: group.users.length,
            scheduledTime: scheduledTime,
            duration: group.duration,
            phoneNumbers: group.users.map(user => this.formatPhoneNumber(user.phoneNumber)),
            meetingId: `sim-meeting-${callId}`,
            attendees: group.users.map(user => ({
                attendeeId: `sim-attendee-${user.id}`,
                externalUserId: `user-${user.id}`,
                userId: user.id,
                phoneNumber: this.formatPhoneNumber(user.phoneNumber)
            })),
            joinUrl: `https://chime.aws/join/sim-meeting-${callId}`,
            message: 'Video call simulated successfully. In production, users would receive "incoming video call" notifications.'
        };
    }

    /**
     * Start a video call
     * @param {string} callId - The call ID
     * @returns {Object} Call status
     */
    async startCall(callId) {
        try {
            console.log('Starting video call:', callId);
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Starting video call:', callId);
                return {
                    callId: callId,
                    status: 'started',
                    startTime: new Date().toISOString(),
                    message: 'Video call started successfully (simulated)'
                };
            }

            // For Chime meetings, they start when attendees join
            return {
                callId: callId,
                status: 'started',
                startTime: new Date().toISOString(),
                message: 'Video call started successfully - attendees can now join'
            };

        } catch (error) {
            console.error('Error starting video call:', error.message);
            throw error;
        }
    }

    /**
     * End a video call
     * @param {string} callId - The call ID
     * @returns {Object} Call status
     */
    async endCall(callId) {
        try {
            console.log('Ending video call:', callId);
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Ending video call:', callId);
                return {
                    callId: callId,
                    status: 'ended',
                    endTime: new Date().toISOString(),
                    message: 'Video call ended successfully (simulated)'
                };
            }

            // End the Chime meeting
            await this.chime.deleteMeeting({
                MeetingId: callId
            }).promise();

            return {
                callId: callId,
                status: 'ended',
                endTime: new Date().toISOString(),
                message: 'Video call ended successfully'
            };

        } catch (error) {
            console.error('Error ending video call:', error.message);
            throw error;
        }
    }

    /**
     * Get video call status
     * @param {string} callId - The call ID
     * @returns {Object} Call status
     */
    async getCallStatus(callId) {
        try {
            console.log('Getting video call status:', callId);
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Getting video call status for:', callId);
                return {
                    callId: callId,
                    status: 'active',
                    participants: [],
                    startTime: new Date().toISOString(),
                    endTime: null,
                    duration: 0,
                    message: 'Video call status simulated. In production, this would check actual call status.'
                };
            }

            // Get meeting details
            const meeting = await this.chime.getMeeting({
                MeetingId: callId
            }).promise();

            return {
                callId: callId,
                status: 'active',
                participants: [],
                startTime: meeting.Meeting.CreatedTimestamp,
                endTime: null,
                duration: 0,
                meeting: meeting.Meeting,
                message: 'Video call status retrieved successfully'
            };

        } catch (error) {
            console.error('Error getting video call status:', error.message);
            throw error;
        }
    }

    /**
     * Add a participant to a video call
     * @param {string} callId - The call ID
     * @param {Object} user - User to add
     * @returns {Object} Updated call status
     */
    async addParticipant(callId, user) {
        try {
            console.log('Adding participant to video call:', callId, user.id);
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Adding participant to video call:', callId, user.id);
                return {
                    callId: callId,
                    status: 'participant_added',
                    participant: {
                        userId: user.id,
                        phoneNumber: this.formatPhoneNumber(user.phoneNumber)
                    },
                    message: 'Participant added successfully (simulated)'
                };
            }

            // Create attendee for the meeting
            const attendee = await this.chime.createAttendee({
                MeetingId: callId,
                ExternalUserId: `user-${user.id}-${user.phoneNumber}`
            }).promise();

            return {
                callId: callId,
                status: 'participant_added',
                participant: {
                    attendeeId: attendee.Attendee.AttendeeId,
                    externalUserId: attendee.Attendee.ExternalUserId,
                    userId: user.id,
                    phoneNumber: this.formatPhoneNumber(user.phoneNumber)
                },
                message: 'Participant added successfully'
            };

        } catch (error) {
            console.error('Error adding participant:', error.message);
            throw error;
        }
    }

    /**
     * Remove a participant from a video call
     * @param {string} callId - The call ID
     * @param {string} participantId - Participant ID to remove
     * @returns {Object} Updated call status
     */
    async removeParticipant(callId, participantId) {
        try {
            console.log('Removing participant from video call:', callId, participantId);
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Removing participant from video call:', callId, participantId);
                return {
                    callId: callId,
                    status: 'participant_removed',
                    participantId: participantId,
                    message: 'Participant removed successfully (simulated)'
                };
            }

            // Remove attendee from the meeting
            await this.chime.deleteAttendee({
                MeetingId: callId,
                AttendeeId: participantId
            }).promise();

            return {
                callId: callId,
                status: 'participant_removed',
                participantId: participantId,
                message: 'Participant removed successfully'
            };

        } catch (error) {
            console.error('Error removing participant:', error.message);
            throw error;
        }
    }

    /**
     * Send SMS notification about video call
     * @param {Array} users - Users to notify
     * @param {Object} callDetails - Call details
     * @returns {Object} SMS results
     */
    async sendSMSNotification(users, callDetails) {
        try {
            console.log('Sending SMS to', users.length, 'participants');
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] SMS would be sent to:', users.map(u => this.formatPhoneNumber(u.phoneNumber)));
                console.log('[SIMULATION] Message:', callDetails.message || 'Take5 Video Call: You will receive an incoming video call!');
                
                return {
                    sent: users.length,
                    failed: 0,
                    results: users.map(user => ({
                        MessageId: `sim-${Date.now()}-${this.formatPhoneNumber(user.phoneNumber)}`
                    })),
                    message: 'SMS simulated successfully. In production, this would send actual SMS messages.'
                };
            }

            const results = [];
            let sent = 0;
            let failed = 0;

            for (const user of users) {
                try {
                    const message = callDetails.message || `Take5 Video Call: You will receive an incoming video call at ${new Date(callDetails.scheduledTime).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST today!`;
                    
                    const params = {
                        Message: message,
                        PhoneNumber: this.formatPhoneNumber(user.phoneNumber)
                    };

                    const result = await this.sns.publish(params).promise();
                    results.push({ MessageId: result.MessageId });
                    sent++;
                } catch (error) {
                    console.error('Error sending SMS to', user.phoneNumber, ':', error.message);
                    results.push({ Error: error.message });
                    failed++;
                }
            }

            return {
                sent,
                failed,
                results,
                message: `SMS sent: ${sent} successful, ${failed} failed`
            };

        } catch (error) {
            console.error('Error sending SMS:', error.message);
            throw error;
        }
    }

    /**
     * Log call metrics to CloudWatch
     * @param {string} metricName - Name of the metric
     * @param {number} value - Metric value
     */
    async logCallMetrics(metricName, value) {
        try {
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Metrics logged:', metricName, '=', value, '(AWS not configured)');
                return;
            }

            const params = {
                Namespace: 'Take5/VideoCalls',
                MetricData: [
                    {
                        MetricName: metricName,
                        Value: value,
                        Unit: 'Count',
                        Timestamp: new Date()
                    }
                ]
            };

            await this.cloudWatch.putMetricData(params).promise();
            console.log('Metrics logged:', metricName, '=', value);

        } catch (error) {
            console.error('Error logging metrics:', error.message);
        }
    }

    /**
     * Validate phone number format
     * @param {string} phoneNumber - Phone number to validate
     * @returns {boolean} Is valid
     */
    validatePhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Check if it's a valid US phone number (10 digits)
        return digits.length === 10;
    }

    /**
     * Format phone number to E.164 format
     * @param {string} phoneNumber - Phone number to format
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Add +1 prefix for US numbers
        if (digits.length === 10) {
            return `+1${digits}`;
        }
        
        return phoneNumber;
    }

    /**
     * Get call analytics
     * @param {string} callId - The call ID
     * @returns {Object} Call analytics
     */
    async getCallAnalytics(callId) {
        try {
            console.log('Getting video call analytics:', callId);
            
            if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA') === false) {
                console.log('[SIMULATION] Getting video call analytics for:', callId);
                return {
                    callId: callId,
                    duration: 0,
                    participants: 0,
                    startTime: null,
                    endTime: null,
                    message: 'Call analytics simulated. In production, this would retrieve actual analytics.'
                };
            }

            // Get meeting details
            const meeting = await this.chime.getMeeting({
                MeetingId: callId
            }).promise();

            return {
                callId: callId,
                duration: 0, // Would need to calculate from start/end times
                participants: 0, // Would need to count active attendees
                startTime: meeting.Meeting.CreatedTimestamp,
                endTime: null,
                meeting: meeting.Meeting,
                message: 'Call analytics retrieved successfully'
            };

        } catch (error) {
            console.error('Error getting call analytics:', error.message);
            throw error;
        }
    }
}

module.exports = ChimeService;
