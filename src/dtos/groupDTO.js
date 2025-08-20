const { Cadence } = require('../utils/constants/cadenceType');

class GroupDTO {
    // required values to create new group
    name;               // str
    users;              // list<User>
    cadence;            // enum (Cadence)
    frequency;          // int ("X times per Cadence")
    duration;           // int (minutes)
    
    // optional
    enabled = true;     // boolean
    
    // assigned later
    id;                 // Number (immutable, assigned at creation)
    rollCall = {};      // Object{Date, list<User>}

    constructor(data) {
        this.name = data.name;
        this.users = data.users || [];
        this.cadence = data.cadence;
        this.frequency = data.frequency;
        this.duration = data.duration;
        this.enabled = data.enabled !== undefined ? data.enabled : true;
        this.id = data.id || null;
        this.rollCall = data.rollCall || {};
    }
}

module.exports = { GroupDTO };