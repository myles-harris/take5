const { Cadence } = require('../utils/constants/cadenceType');

class SchedulingService {
    /**
     * Calculate the next call time for a group based on its cadence and frequency
     * @param {Object} group - Group object with cadence, frequency, and last call info
     * @param {Date} currentTime - Current time (defaults to now)
     * @returns {Date} Next scheduled call time
     */
    static calculateNextCallTime(group, currentTime = new Date()) {
        const { cadence, frequency } = group;
        
        // Get the last call time from roll call or use current time as fallback
        const lastCallTime = this.getLastCallTime(group) || currentTime;
        
        switch (cadence) {
            case Cadence.DAILY:
                return this.calculateDailyNextCall(lastCallTime, currentTime);
            case Cadence.WEEKLY:
                return this.calculateWeeklyNextCall(lastCallTime, frequency, currentTime);
            case Cadence.MONTHLY:
                return this.calculateMonthlyNextCall(lastCallTime, frequency, currentTime);
            default:
                throw new Error(`Unsupported cadence: ${cadence}`);
        }
    }

    /**
     * Calculate next call time for daily cadence (always 1 call per day)
     * @param {Date} lastCallTime - Last call time
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call time
     */
    static calculateDailyNextCall(lastCallTime, currentTime) {
        const nextCallTime = new Date(lastCallTime);
        
        // Move to next day
        nextCallTime.setDate(nextCallTime.getDate() + 1);
        
        // If the calculated time is in the past, find the next available day
        while (nextCallTime <= currentTime) {
            nextCallTime.setDate(nextCallTime.getDate() + 1);
        }
        
        // Randomize the time within business hours (9 AM to 8 PM)
        const randomHour = 9 + Math.floor(Math.random() * 11); // 9 AM to 8 PM
        const randomMinute = Math.floor(Math.random() * 60);
        nextCallTime.setHours(randomHour, randomMinute, 0, 0);
        
        return nextCallTime;
    }

    /**
     * Calculate next call time for weekly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per week (max 7)
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call time
     */
    static calculateWeeklyNextCall(lastCallTime, frequency, currentTime) {
        // Ensure frequency doesn't exceed 7 (one call per day max)
        const safeFrequency = Math.min(frequency, 7);
        
        // Get the next available call day from the weekly schedule
        const nextCallDay = this.getNextWeeklyCallDay(lastCallTime, safeFrequency, currentTime);
        
        // Randomize the time within business hours
        const randomHour = 9 + Math.floor(Math.random() * 11); // 9 AM to 8 PM
        const randomMinute = Math.floor(Math.random() * 60);
        nextCallDay.setHours(randomHour, randomMinute, 0, 0);
        
        return nextCallDay;
    }

    /**
     * Calculate next call time for monthly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per month (max 30)
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call time
     */
    static calculateMonthlyNextCall(lastCallTime, frequency, currentTime) {
        // Ensure frequency doesn't exceed 30 (one call per day max)
        const safeFrequency = Math.min(frequency, 30);
        
        // Get the next available call day from the monthly schedule
        const nextCallDay = this.getNextMonthlyCallDay(lastCallTime, safeFrequency, currentTime);
        
        // Randomize the time within business hours
        const randomHour = 10 + Math.floor(Math.random() * 8); // 10 AM to 6 PM
        const randomMinute = Math.floor(Math.random() * 60);
        nextCallDay.setHours(randomHour, randomMinute, 0, 0);
        
        return nextCallDay;
    }

    /**
     * Get the next call day for weekly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per week
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call day
     */
    static getNextWeeklyCallDay(lastCallTime, frequency, currentTime) {
        // Generate the next 7 days of call schedule
        const weeklySchedule = this.generateWeeklyCallDays(lastCallTime, frequency);
        
        // Find the first day that's in the future
        for (const callDay of weeklySchedule) {
            if (callDay > currentTime) {
                return callDay;
            }
        }
        
        // If all days are in the past, generate a new week starting from current time
        const newWeekStart = new Date(currentTime);
        newWeekStart.setDate(newWeekStart.getDate() + 1); // Start from tomorrow
        const newWeeklySchedule = this.generateWeeklyCallDays(newWeekStart, frequency);
        
        return newWeeklySchedule[0];
    }

    /**
     * Get the next call day for monthly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per month
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call day
     */
    static getNextMonthlyCallDay(lastCallTime, frequency, currentTime) {
        // Generate the next 30 days of call schedule
        const monthlySchedule = this.generateMonthlyCallDays(lastCallTime, frequency);
        
        // Find the first day that's in the future
        for (const callDay of monthlySchedule) {
            if (callDay > currentTime) {
                return callDay;
            }
        }
        
        // If all days are in the past, generate a new month starting from current time
        const newMonthStart = new Date(currentTime);
        newMonthStart.setDate(newMonthStart.getDate() + 1); // Start from tomorrow
        const newMonthlySchedule = this.generateMonthlyCallDays(newMonthStart, frequency);
        
        return newMonthlySchedule[0];
    }

    /**
     * Generate call days for a weekly period
     * @param {Date} startDate - Starting date
     * @param {number} frequency - Number of calls per week
     * @returns {Array} Array of call days
     */
    static generateWeeklyCallDays(startDate, frequency) {
        const callDays = [];
        const weekStart = new Date(startDate);
        
        // Generate random days within the next 7 days
        const availableDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            availableDays.push(day);
        }
        
        // Randomly select 'frequency' number of days
        const selectedDays = this.selectRandomDays(availableDays, frequency);
        
        return selectedDays.sort((a, b) => a - b);
    }

    /**
     * Generate call days for a monthly period
     * @param {Date} startDate - Starting date
     * @param {number} frequency - Number of calls per month
     * @returns {Array} Array of call days
     */
    static generateMonthlyCallDays(startDate, frequency) {
        const callDays = [];
        const monthStart = new Date(startDate);
        
        // Generate random days within the next 30 days
        const availableDays = [];
        for (let i = 0; i < 30; i++) {
            const day = new Date(monthStart);
            day.setDate(day.getDate() + i);
            availableDays.push(day);
        }
        
        // Randomly select 'frequency' number of days
        const selectedDays = this.selectRandomDays(availableDays, frequency);
        
        return selectedDays.sort((a, b) => a - b);
    }

    /**
     * Select random days from available days
     * @param {Array} availableDays - Array of available days
     * @param {number} count - Number of days to select
     * @returns {Array} Selected days
     */
    static selectRandomDays(availableDays, count) {
        const shuffled = [...availableDays].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, availableDays.length));
    }

    /**
     * Get the last call time from group's roll call
     * @param {Object} group - Group object with roll call data
     * @returns {Date|null} Last call time or null if no previous calls
     */
    static getLastCallTime(group) {
        if (!group.rollCall || Object.keys(group.rollCall).length === 0) {
            return null;
        }
        
        // Find the most recent call date
        const callDates = Object.keys(group.rollCall)
            .map(dateStr => new Date(dateStr))
            .filter(date => !isNaN(date.getTime()))
            .sort((a, b) => b - a); // Sort descending (most recent first)
        
        return callDates.length > 0 ? callDates[0] : null;
    }

    /**
     * Check if a group is due for a call
     * @param {Object} group - Group object
     * @param {Date} currentTime - Current time (defaults to now)
     * @returns {boolean} True if group is due for a call
     */
    static isGroupDueForCall(group, currentTime = new Date()) {
        const nextCallTime = this.calculateNextCallTime(group, currentTime);
        return nextCallTime <= currentTime;
    }

    /**
     * Get all groups that are due for calls
     * @param {Array} groups - Array of group objects
     * @param {Date} currentTime - Current time (defaults to now)
     * @returns {Array} Groups that are due for calls
     */
    static getGroupsDueForCalls(groups, currentTime = new Date()) {
        return groups.filter(group => {
            if (!group.enabled) return false;
            return this.isGroupDueForCall(group, currentTime);
        });
    }

    /**
     * Generate a schedule for the next N calls for a group
     * @param {Object} group - Group object
     * @param {number} numberOfCalls - Number of future calls to schedule
     * @param {Date} startTime - Starting time (defaults to now)
     * @returns {Array} Array of scheduled call times
     */
    static generateCallSchedule(group, numberOfCalls = 5, startTime = new Date()) {
        const schedule = [];
        let currentCallTime = this.calculateNextCallTime(group, startTime);
        
        for (let i = 0; i < numberOfCalls; i++) {
            schedule.push(new Date(currentCallTime));
            
            // Calculate next call time based on this call time
            const tempGroup = {
                ...group,
                rollCall: {
                    [currentCallTime.toISOString()]: []
                }
            };
            currentCallTime = this.calculateNextCallTime(tempGroup, currentCallTime);
        }
        
        return schedule;
    }

    /**
     * Validate if a call time is within acceptable business hours
     * @param {Date} callTime - Proposed call time
     * @param {string} timezone - User's timezone
     * @returns {boolean} True if call time is acceptable
     */
    static isCallTimeAcceptable(callTime, timezone = 'UTC') {
        // Convert to user's timezone (simplified - in production, use a proper timezone library)
        const hour = callTime.getHours();
        
        // Business hours: 9 AM to 8 PM local time
        return hour >= 9 && hour <= 20;
    }

    /**
     * Adjust call time to be within acceptable business hours
     * @param {Date} callTime - Original call time
     * @param {string} timezone - User's timezone
     * @returns {Date} Adjusted call time
     */
    static adjustCallTimeToBusinessHours(callTime, timezone = 'UTC') {
        const adjustedTime = new Date(callTime);
        const hour = adjustedTime.getHours();
        
        if (hour < 9) {
            // Move to 9 AM
            adjustedTime.setHours(9, 0, 0, 0);
        } else if (hour > 20) {
            // Move to 8 PM
            adjustedTime.setHours(20, 0, 0, 0);
        }
        
        return adjustedTime;
    }

    /**
     * Validate group frequency based on cadence
     * @param {string} cadence - Group cadence
     * @param {number} frequency - Group frequency
     * @returns {boolean} True if frequency is valid for cadence
     */
    static validateFrequency(cadence, frequency) {
        switch (cadence) {
            case Cadence.DAILY:
                return frequency === 1; // Daily cadence always has frequency of 1
            case Cadence.WEEKLY:
                return frequency >= 1 && frequency <= 7; // Max 7 calls per week (1 per day)
            case Cadence.MONTHLY:
                return frequency >= 1 && frequency <= 30; // Max 30 calls per month (1 per day)
            default:
                return false;
        }
    }
}

module.exports = { SchedulingService };

