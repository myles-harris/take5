const Timezone = Object.freeze({
    // Universal Time
    UTC: 'UTC',    // Coordinated Universal Time
    
    // US Time Zones
    EST: 'EST',    // Eastern Standard Time
    EDT: 'EDT',    // Eastern Daylight Time
    CST: 'CST',    // Central Standard Time
    CDT: 'CDT',    // Central Daylight Time
    MST: 'MST',    // Mountain Standard Time
    MDT: 'MDT',    // Mountain Daylight Time
    PST: 'PST',    // Pacific Standard Time
    PDT: 'PDT',    // Pacific Daylight Time
    AKST: 'AKST',  // Alaska Standard Time
    AKDT: 'AKDT',  // Alaska Daylight Time
    HST: 'HST',    // Hawaii Standard Time
    HAST: 'HAST',  // Hawaii-Aleutian Standard Time
    HADT: 'HADT'   // Hawaii-Aleutian Daylight Time
});

module.exports = { Timezone }; 