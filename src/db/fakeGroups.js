const { Cadence } = require('../utils/constants/cadenceType');

let groups = [
    {
        id: 1,
        name: "First Group",
        users: [1, 3], // References to user IDs
        cadence: Cadence.DAILY,
        frequency: 1,
        duration: 5, // minutes
        enabled: true,
        rollCall: {}
    },
    {
        id: 2,
        name: "Second Group",
        users: [2, 4], // References to user IDs
        cadence: Cadence.WEEKLY,
        frequency: 2,
        duration: 10, // minutes
        enabled: true,
        rollCall: {}
    }
]

module.exports = { groups };