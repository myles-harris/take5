class userDTO {
    // required values to create new user
    name;           // str
    familyName;     // str
    countryCode;    // int
    phoneNumber;    // int
    // values assigned upon user verification
    id = -1;             // int
    // user assigned values
    groups = [];         // list<groupDTO>

    constructor(data) {
        this.name = data.name;
        this.familyName = data.familyName;
        this.countryCode = data.countryCode;
        this.phoneNumber = data.phoneNumber;
    }
}