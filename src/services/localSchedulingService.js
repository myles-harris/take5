const { SchedulingService } = require('./schedulingService');
const TwilioService = require('./twilioService');
const { GroupRepository } = require('../db/groupRepository');
const { UserRepository } = require('../db/userRepository');

class LocalSchedulingService {
    constructor() {
        this.schedulingService = new SchedulingService();
        this.twilioService = new TwilioService();
        this.groupRepository = new GroupRepository();
        this.userRepository = new UserRepository();
        this.scheduledCalls = new Map(); // In-memory storage for scheduled calls
        this.isRunning = false;
    }

    /**
     * Start the local scheduling service
     */
    start() {
        if (this.isRunning) {
            console.log('Local scheduling service is already running');
            return;
        }

        this.isRunning = true;
        console.log('Starting local scheduling service...');
        
        // Check for scheduled calls every minute
        this.schedulerInterval = setInterval(() => {
            this.checkScheduledCalls();
        }, 60000); // Check every minute

        // Initial check
        this.checkScheduledCalls();
        
        console.log('Local scheduling service started successfully');
    }

    /**
     * Stop the local scheduling service
     */
    stop() {
        if (!this.isRunning) {
            console.log('Local scheduling service is not running');
            return;
        }

        this.isRunning = false;
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        
        console.log('Local scheduling service stopped');
    }

    /**
     * Check for calls that need to be executed
     */
    async checkScheduledCalls() {
        try {
            const now = new Date();
            const callsToExecute = [];

            // Find calls that should be executed now
            for (const [callId, callData] of this.scheduledCalls.entries()) {
                if (callData.scheduledTime <= now && callData.status === 'scheduled') {
                    callsToExecute.push({ callId, ...callData });
                }
            }

            // Execute calls
            for (const call of callsToExecute) {
                await this.executeScheduledCall(call);
            }

            // Schedule next calls for all active groups
            await this.scheduleNextCalls();

        } catch (error) {
            console.error('Error checking scheduled calls:', error);
        }
    }

    /**
     * Execute a scheduled call
     */
    async executeScheduledCall(callData) {
        try {
            console.log(`Executing scheduled call: ${callData.callId}`);
            
            // Update call status
            this.scheduledCalls.set(callData.callId, {
                ...callData,
                status: 'executing',
                executedAt: new Date()
            });

            // Get group details
            const group = await this.groupRepository.findById(callData.groupId);
            if (!group) {
                console.error(`Group not found for call: ${callData.callId}`);
                this.scheduledCalls.set(callData.callId, {
                    ...callData,
                    status: 'failed',
                    error: 'Group not found'
                });
                return;
            }

            // Create the video call
            const callResult = await this.twilioService.createGroupCall(group, new Date());
            
            // Update call status
            this.scheduledCalls.set(callData.callId, {
                ...callData,
                status: 'completed',
                executedAt: new Date(),
                callResult
            });

            console.log(`Call executed successfully: ${callData.callId}`);

        } catch (error) {
            console.error(`Error executing call ${callData.callId}:`, error);
            this.scheduledCalls.set(callData.callId, {
                ...callData,
                status: 'failed',
                error: error.message,
                executedAt: new Date()
            });
        }
    }

    /**
     * Schedule next calls for all active groups
     */
    async scheduleNextCalls() {
        try {
            const groups = await this.groupRepository.findAll();
            const activeGroups = groups.filter(group => group.enabled);

            for (const group of activeGroups) {
                await this.scheduleNextCallForGroup(group);
            }

        } catch (error) {
            console.error('Error scheduling next calls:', error);
        }
    }

    /**
     * Schedule the next call for a specific group
     */
    async scheduleNextCallForGroup(group) {
        try {
            // Check if there's already a scheduled call for this group
            const existingCall = Array.from(this.scheduledCalls.values())
                .find(call => call.groupId === group.id && call.status === 'scheduled');

            if (existingCall) {
                return; // Already scheduled
            }

            // Calculate next call time
            const nextCallTime = this.schedulingService.calculateNextCallTime(
                group.cadence,
                group.frequency,
                group.rollCall
            );

            if (!nextCallTime) {
                console.log(`No next call time calculated for group: ${group.name}`);
                return;
            }

            // Create scheduled call entry
            const callId = `scheduled-${group.id}-${Date.now()}`;
            const scheduledCall = {
                callId,
                groupId: group.id,
                groupName: group.name,
                scheduledTime: nextCallTime,
                status: 'scheduled',
                cadence: group.cadence,
                frequency: group.frequency,
                createdAt: new Date()
            };

            this.scheduledCalls.set(callId, scheduledCall);
            console.log(`Scheduled next call for group "${group.name}" at ${nextCallTime.toISOString()}`);

        } catch (error) {
            console.error(`Error scheduling call for group ${group.id}:`, error);
        }
    }

    /**
     * Manually schedule a call for a group
     */
    async scheduleCall(groupId, scheduledTime) {
        try {
            const group = await this.groupRepository.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }

            const callId = `manual-${groupId}-${Date.now()}`;
            const scheduledCall = {
                callId,
                groupId: group.id,
                groupName: group.name,
                scheduledTime: new Date(scheduledTime),
                status: 'scheduled',
                cadence: group.cadence,
                frequency: group.frequency,
                createdAt: new Date(),
                isManual: true
            };

            this.scheduledCalls.set(callId, scheduledCall);
            console.log(`Manually scheduled call for group "${group.name}" at ${scheduledTime}`);

            return {
                callId,
                message: 'Call scheduled successfully',
                scheduledTime: scheduledTime,
                groupName: group.name
            };

        } catch (error) {
            console.error('Error scheduling call:', error);
            throw error;
        }
    }

    /**
     * Get all scheduled calls
     */
    getScheduledCalls() {
        return Array.from(this.scheduledCalls.values());
    }

    /**
     * Get scheduled calls for a specific group
     */
    getScheduledCallsForGroup(groupId) {
        return Array.from(this.scheduledCalls.values())
            .filter(call => call.groupId === groupId);
    }

    /**
     * Cancel a scheduled call
     */
    cancelScheduledCall(callId) {
        const call = this.scheduledCalls.get(callId);
        if (!call) {
            throw new Error('Scheduled call not found');
        }

        if (call.status !== 'scheduled') {
            throw new Error('Cannot cancel call that is not in scheduled status');
        }

        this.scheduledCalls.set(callId, {
            ...call,
            status: 'cancelled',
            cancelledAt: new Date()
        });

        console.log(`Cancelled scheduled call: ${callId}`);
        return {
            callId,
            message: 'Call cancelled successfully'
        };
    }

    /**
     * Update roll call for a group after a call
     */
    async updateRollCall(groupId, callData) {
        try {
            const group = await this.groupRepository.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }

            // Update roll call with call information
            const updatedRollCall = {
                ...group.rollCall,
                [new Date().toISOString()]: {
                    callId: callData.callId,
                    participants: callData.participants,
                    duration: callData.duration,
                    status: callData.status
                }
            };

            await this.groupRepository.updateRollCall(groupId, updatedRollCall);
            console.log(`Updated roll call for group ${groupId}`);

        } catch (error) {
            console.error('Error updating roll call:', error);
            throw error;
        }
    }

    /**
     * Get scheduling statistics
     */
    getSchedulingStats() {
        const calls = Array.from(this.scheduledCalls.values());
        
        return {
            totalCalls: calls.length,
            scheduled: calls.filter(c => c.status === 'scheduled').length,
            executing: calls.filter(c => c.status === 'executing').length,
            completed: calls.filter(c => c.status === 'completed').length,
            failed: calls.filter(c => c.status === 'failed').length,
            cancelled: calls.filter(c => c.status === 'cancelled').length,
            isRunning: this.isRunning
        };
    }

    /**
     * Validate group scheduling configuration
     */
    validateGroupScheduling(group) {
        return this.schedulingService.validateFrequency(group.cadence, group.frequency);
    }

    /**
     * Get next call time for a group
     */
    getNextCallTime(group) {
        return this.schedulingService.calculateNextCallTime(
            group.cadence,
            group.frequency,
            group.rollCall
        );
    }
}

module.exports = LocalSchedulingService;
