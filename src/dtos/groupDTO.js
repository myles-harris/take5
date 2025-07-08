class groupDTO {
    // required values to create new group
    users;
    cadence;
    frequency;

    // optional
    nickname = "";   // str
    enabled = true;

    // assigned later
    rollCall = [];   // list<Date, list<userDTO>>

    constructor(data) {
        this.users = data.users;
        this.cadence = data.cadence;
        this.frequency = data.frequency;
    }
}