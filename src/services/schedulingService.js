const { Cadence } = require('../utils/constants/cadenceType');

class SchedulingService {
    /**
     * Calculate the next call time for a group based on its cadence and frequency
     * @param {string} cadence - Cadence type (daily, weekly, monthly)
     * @param {number} frequency - Frequency of calls
     * @param {Object} rollCall - Roll call history
     * @param {Date} currentTime - Current time (defaults to now)
     * @returns {Date} Next scheduled call time
     */
    static calculateNextCallTime(cadence, frequency, rollCall = {}, currentTime = new Date()) {
        // Get the last call time from roll call or use current time as fallback
        const lastCallTime = this.getLastCallTime(rollCall) || currentTime;
        
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
        const nextCall = new Date(lastCallTime);
        nextCall.setDate(nextCall.getDate() + 1);
        nextCall.setHours(9, 0, 0, 0); // 9 AM
        
        // If the next call is in the past, move to tomorrow
        if (nextCall <= currentTime) {
            nextCall.setDate(nextCall.getDate() + 1);
        }
        
        return nextCall;
    }

    /**
     * Calculate next call time for weekly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per week
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call time
     */
    static calculateWeeklyNextCall(lastCallTime, frequency, currentTime) {
        const callDays = this.generateWeeklyCallDays(frequency);
        const nextCall = new Date(lastCallTime);
        
        // Find the next available call day
        let attempts = 0;
        while (attempts < 14) { // Prevent infinite loop
            nextCall.setDate(nextCall.getDate() + 1);
            const dayOfWeek = nextCall.getDay();
            
            if (callDays.includes(dayOfWeek)) {
                nextCall.setHours(9, 0, 0, 0); // 9 AM
                if (nextCall > currentTime) {
                    return nextCall;
                }
            }
            attempts++;
        }
        
        return null;
    }

    /**
     * Calculate next call time for monthly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per month
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call time
     */
    static calculateMonthlyNextCall(lastCallTime, frequency, currentTime) {
        const callDays = this.generateMonthlyCallDays(frequency);
        const nextCall = new Date(lastCallTime);
        
        // Find the next available call day
        let attempts = 0;
        while (attempts < 60) { // Prevent infinite loop
            nextCall.setDate(nextCall.getDate() + 1);
            const dayOfMonth = nextCall.getDate();
            
            if (callDays.includes(dayOfMonth)) {
                nextCall.setHours(9, 0, 0, 0); // 9 AM
                if (nextCall > currentTime) {
                    return nextCall;
                }
            }
            attempts++;
        }
        
        return null;
    }

    /**
     * Generate random days of the week for weekly calls
     * @param {number} frequency - Number of calls per week
     * @returns {Array} Array of day numbers (0-6, Sunday-Saturday)
     */
    static generateWeeklyCallDays(frequency) {
        const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
        return this.selectRandomDays(days, frequency);
    }

    /**
     * Generate random days of the month for monthly calls
     * @param {number} frequency - Number of calls per month
     * @returns {Array} Array of day numbers (1-30)
     */
    static generateMonthlyCallDays(frequency) {
        const days = Array.from({ length: 30 }, (_, i) => i + 1); // Days 1-30
        return this.selectRandomDays(days, frequency);
    }

    /**
     * Select random days from an array
     * @param {Array} days - Array of available days
     * @param {number} count - Number of days to select
     * @returns {Array} Array of selected days
     */
    static selectRandomDays(days, count) {
        const shuffled = [...days].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).sort((a, b) => a - b);
    }

    /**
     * Get the last call time from roll call history
     * @param {Object} rollCall - Roll call history
     * @returns {Date|null} Last call time or null
     */
    static getLastCallTime(rollCall) {
        if (!rollCall || typeof rollCall !== 'object') {
            return null;
        }
        
        const callTimes = Object.keys(rollCall)
            .filter(key => rollCall[key] && rollCall[key].status === 'completed')
            .map(key => new Date(key))
            .filter(date => !isNaN(date.getTime()))
            .sort((a, b) => b - a); // Sort descending (most recent first)
        
        return callTimes.length > 0 ? callTimes[0] : null;
    }

    /**
     * Validate frequency for a given cadence
     * @param {string} cadence - Cadence type
     * @param {number} frequency - Frequency value
     * @returns {Object} Validation result
     */
    static validateFrequency(cadence, frequency) {
        switch (cadence) {
            case Cadence.DAILY:
                return {
                    isValid: frequency === 1,
                    message: frequency === 1 ? 'Valid daily frequency' : 'Daily cadence must have frequency of 1'
                };
            case Cadence.WEEKLY:
                return {
                    isValid: frequency >= 1 && frequency <= 7,
                    message: frequency >= 1 && frequency <= 7 ? 'Valid weekly frequency' : 'Weekly frequency must be between 1 and 7'
                };
            case Cadence.MONTHLY:
                return {
                    isValid: frequency >= 1 && frequency <= 30,
                    message: frequency >= 1 && frequency <= 30 ? 'Valid monthly frequency' : 'Monthly frequency must be between 1 and 30'
                };
            default:
                return {
                    isValid: false,
                    message: 'Invalid cadence type'
                };
        }
    }

    /**
     * Check if a call time is acceptable (business hours, etc.)
     * @param {Date} callTime - Call time to check
     * @returns {boolean} Whether the time is acceptable
     */
    static isCallTimeAcceptable(callTime) {
        const hour = callTime.getHours();
        return hour >= 8 && hour <= 18; // 8 AM to 6 PM
    }

    /**
     * Adjust call time to business hours if needed
     * @param {Date} callTime - Call time to adjust
     * @returns {Date} Adjusted call time
     */
    static adjustCallTimeToBusinessHours(callTime) {
        const adjusted = new Date(callTime);
        const hour = adjusted.getHours();
        
        if (hour < 8) {
            adjusted.setHours(9, 0, 0, 0); // Move to 9 AM
        } else if (hour > 18) {
            adjusted.setHours(17, 0, 0, 0); // Move to 5 PM
        }
        
        return adjusted;
    }
}

module.exports = { SchedulingService };
