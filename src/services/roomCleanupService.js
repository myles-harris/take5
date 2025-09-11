const twilio = require('twilio');

class RoomCleanupService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.client = null;
        
        if (this.accountSid && this.authToken) {
            this.client = twilio(this.accountSid, this.authToken);
        }
        
        this.activeRooms = new Map(); // roomSid -> { endTime, groupId }
        this.cleanupInterval = null;
    }

    /**
     * Register a room for automatic cleanup
     * @param {string} roomSid - Twilio room SID
     * @param {Date} scheduledTime - When the call was scheduled to start
     * @param {number} duration - Call duration in minutes
     * @param {number} groupId - Group ID for logging
     */
    registerRoom(roomSid, scheduledTime, duration, groupId) {
        const endTime = new Date(scheduledTime.getTime() + (duration * 60 * 1000));
        
        this.activeRooms.set(roomSid, {
            endTime,
            groupId,
            scheduledTime
        });

        console.log(`Registered room ${roomSid} for cleanup at ${endTime.toISOString()}`);
        
        // Start cleanup service if not already running
        if (!this.cleanupInterval) {
            this.startCleanupService();
        }
    }

    /**
     * Start the cleanup service that runs every minute
     */
    startCleanupService() {
        console.log('Starting room cleanup service...');
        
        this.cleanupInterval = setInterval(async () => {
            await this.cleanupExpiredRooms();
        }, 60000); // Check every minute
    }

    /**
     * Stop the cleanup service
     */
    stopCleanupService() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('Room cleanup service stopped');
        }
    }

    /**
     * Check for and clean up expired rooms
     */
    async cleanupExpiredRooms() {
        const now = new Date();
        const expiredRooms = [];

        for (const [roomSid, roomInfo] of this.activeRooms.entries()) {
            if (now >= roomInfo.endTime) {
                expiredRooms.push({ roomSid, ...roomInfo });
            }
        }

        for (const room of expiredRooms) {
            try {
                console.log(`Cleaning up expired room: ${room.roomSid} (Group ${room.groupId})`);
                
                // Delete the room from Twilio
                if (this.client) {
                    await this.client.video.rooms(room.roomSid).update({ status: 'completed' });
                }
                
                // Remove from tracking
                this.activeRooms.delete(room.roomSid);
                
                console.log(`Successfully cleaned up room: ${room.roomSid}`);
            } catch (error) {
                console.error(`Error cleaning up room ${room.roomSid}:`, error);
            }
        }

        if (expiredRooms.length > 0) {
            console.log(`Cleaned up ${expiredRooms.length} expired rooms`);
        }

        // Stop cleanup service if no more rooms to track
        if (this.activeRooms.size === 0) {
            this.stopCleanupService();
        }
    }

    /**
     * Get status of all tracked rooms
     */
    getStatus() {
        const now = new Date();
        const status = [];

        for (const [roomSid, roomInfo] of this.activeRooms.entries()) {
            const timeRemaining = Math.max(0, roomInfo.endTime.getTime() - now.getTime());
            status.push({
                roomSid,
                groupId: roomInfo.groupId,
                scheduledTime: roomInfo.scheduledTime,
                endTime: roomInfo.endTime,
                timeRemainingMs: timeRemaining,
                timeRemainingMinutes: Math.floor(timeRemaining / (1000 * 60))
            });
        }

        return status;
    }
}

module.exports = RoomCleanupService;
