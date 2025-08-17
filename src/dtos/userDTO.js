class userDTO {
    // required values to create new user
    givenName;           // str
    familyName;     // str
    countryCode;    // int
    phoneNumber;    // int
    // values assigned upon user verification
    id = '-1';             // str
    // user assigned values
    groups = [];         // list<groupDTO>

    constructor(data) {
        this.givenName = data.givenName;
        this.familyName = data.familyName;
        this.countryCode = data.countryCode;
        this.phoneNumber = data.phoneNumber;
    }
}