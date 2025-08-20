const { Timezone } = require('../utils/constants/timezone');

let users = [
    {
        id: 1,
        givenName: 'myles',
        familyName: 'harris',
        phoneNumber: '1111111111',
        timezone: Timezone.EST,
        groups: []
    },
    {
        id: 2,
        givenName: 'john',
        familyName: 'doe',
        phoneNumber: '2222222222',
        timezone: Timezone.PST,
        groups: []
    },
    {
        id: 3,
        givenName: 'huey',
        familyName: 'freeman',
        phoneNumber: '3333333333',
        timezone: Timezone.CST,
        groups: []
    },
    {
        id: 4,
        givenName: 'riley',
        familyName: 'freeman',
        phoneNumber: '4444444444',
        timezone: Timezone.MST,
        groups: []
    }
]

module.exports = { users };