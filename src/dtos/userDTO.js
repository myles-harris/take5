const { Timezone } = require('../utils/constants/timezone');

class UserDTO {
    // required values to create new user
    givenName;           // str
    familyName;          // str
    phoneNumber;         // str
    timezone;            // enum (Timezone)
    
    // values assigned upon user verification
    id;                  // Number (immutable, assigned at registration)
    
    // user assigned values
    groups = [];         // list<Group>

    constructor(data) {
        this.givenName = data.givenName;
        this.familyName = data.familyName;
        this.phoneNumber = data.phoneNumber;
        this.timezone = data.timezone || Timezone.UTC;
        this.id = data.id || null;
        this.groups = data.groups || [];
    }
}

module.exports = { UserDTO };