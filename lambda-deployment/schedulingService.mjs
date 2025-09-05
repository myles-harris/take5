import { Cadence } from './cadenceType.mjs';

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
        const callDays = this.generateWeeklyCallDays(lastCallTime, frequency);
        
        // Find the next call day that's after the current time
        for (const day of callDays) {
            if (day > currentTime) {
                return day;
            }
        }
        
        // If all days are in the past, move to next week
        const nextWeekStart = new Date(lastCallTime);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        return this.getNextWeeklyCallDay(nextWeekStart, frequency, currentTime);
    }

    /**
     * Get the next call day for monthly cadence
     * @param {Date} lastCallTime - Last call time
     * @param {number} frequency - Number of calls per month
     * @param {Date} currentTime - Current time
     * @returns {Date} Next call day
     */
    static getNextMonthlyCallDay(lastCallTime, frequency, currentTime) {
        const callDays = this.generateMonthlyCallDays(lastCallTime, frequency);
        
        // Find the next call day that's after the current time
        for (const day of callDays) {
            if (day > currentTime) {
                return day;
            }
        }
        
        // If all days are in the past, move to next month
        const nextMonthStart = new Date(lastCallTime);
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
        return this.getNextMonthlyCallDay(nextMonthStart, frequency, currentTime);
    }

    /**
     * Generate call days for weekly cadence
     * @param {Date} startDate - Starting date
     * @param {number} frequency - Number of calls per week
     * @returns {Date[]} Array of call days
     */
    static generateWeeklyCallDays(startDate, frequency) {
        const callDays = [];
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        
        // Select random days within the week
        const selectedDays = this.selectRandomDays(7, frequency);
        
        for (const dayIndex of selectedDays) {
            const callDay = new Date(weekStart);
            callDay.setDate(callDay.getDate() + dayIndex);
            callDays.push(callDay);
        }
        
        return callDays.sort((a, b) => a - b);
    }

    /**
     * Generate call days for monthly cadence
     * @param {Date} startDate - Starting date
     * @param {number} frequency - Number of calls per month
     * @returns {Date[]} Array of call days
     */
    static generateMonthlyCallDays(startDate, frequency) {
        const callDays = [];
        const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        
        // Select random days within the month
        const selectedDays = this.selectRandomDays(daysInMonth, frequency);
        
        for (const dayIndex of selectedDays) {
            const callDay = new Date(monthStart);
            callDay.setDate(dayIndex + 1);
            callDays.push(callDay);
        }
        
        return callDays.sort((a, b) => a - b);
    }

    /**
     * Select random days from a range
     * @param {number} totalDays - Total number of days to choose from
     * @param {number} count - Number of days to select
     * @returns {number[]} Array of selected day indices
     */
    static selectRandomDays(totalDays, count) {
        const days = Array.from({ length: totalDays }, (_, i) => i);
        const selected = [];
        
        for (let i = 0; i < count && days.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * days.length);
            selected.push(days.splice(randomIndex, 1)[0]);
        }
        
        return selected;
    }

    /**
     * Get the last call time from a group's roll call
     * @param {Object} group - Group object with rollCall property
     * @returns {Date|null} Last call time or null if no calls
     */
    static getLastCallTime(group) {
        if (!group.rollCall || Object.keys(group.rollCall).length === 0) {
            return null;
        }
        
        const callTimes = Object.keys(group.rollCall).map(time => new Date(time));
        return new Date(Math.max(...callTimes));
    }

    /**
     * Check if a call time is within acceptable business hours
     * @param {Date} callTime - Call time to check
     * @returns {boolean} True if within business hours
     */
    static isCallTimeAcceptable(callTime) {
        const hour = callTime.getHours();
        const dayOfWeek = callTime.getDay();
        
        // Weekend check
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return false;
        }
        
        // Business hours: 9 AM - 8 PM for daily/weekly, 10 AM - 6 PM for monthly
        return hour >= 9 && hour <= 20;
    }

    /**
     * Adjust call time to business hours if needed
     * @param {Date} callTime - Call time to adjust
     * @returns {Date} Adjusted call time
     */
    static adjustCallTimeToBusinessHours(callTime) {
        const adjusted = new Date(callTime);
        const hour = adjusted.getHours();
        
        if (hour < 9) {
            adjusted.setHours(9, 0, 0, 0);
        } else if (hour > 20) {
            adjusted.setHours(20, 0, 0, 0);
        }
        
        return adjusted;
    }

    /**
     * Validate frequency based on cadence
     * @param {string} cadence - Cadence type
     * @param {number} frequency - Frequency value
     * @returns {boolean} True if valid
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

    /**
     * Get groups that are due for calls
     * @param {Array} groups - Array of group objects
     * @param {Date} currentTime - Current time
     * @returns {Array} Groups due for calls
     */
    static getGroupsDueForCalls(groups, currentTime = new Date()) {
        return groups.filter(group => {
            if (!group.enabled) return false;
            
            const nextCallTime = this.calculateNextCallTime(group, currentTime);
            return nextCallTime <= currentTime;
        });
    }

    /**
     * Generate a call schedule for a group
     * @param {Object} group - Group object
     * @param {number} numberOfCalls - Number of calls to generate
     * @param {Date} startTime - Starting time
     * @returns {Date[]} Array of call times
     */
    static generateCallSchedule(group, numberOfCalls, startTime = new Date()) {
        const schedule = [];
        let currentTime = new Date(startTime);
        
        for (let i = 0; i < numberOfCalls; i++) {
            const nextCallTime = this.calculateNextCallTime(group, currentTime);
            schedule.push(nextCallTime);
            currentTime = new Date(nextCallTime);
        }
        
        return schedule;
    }
}

export { SchedulingService }; 