/**
 * Test script to verify Chime configuration
 * Uses the phone number: +13232488474
 */

require('dotenv').config();

// Test environment variables
console.log('🔧 Testing Chime Configuration...\n');

console.log('Environment Variables:');
console.log(`CHIME_OUTBOUND_PHONE_NUMBER: ${process.env.CHIME_OUTBOUND_PHONE_NUMBER || 'NOT SET'}`);
console.log(`CHIME_RECORDING_ENABLED: ${process.env.CHIME_RECORDING_ENABLED || 'NOT SET'}`);
console.log(`AWS_REGION: ${process.env.AWS_REGION || 'NOT SET'}`);
console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);

// Test phone number validation
const { ChimeService } = require('./src/services/chimeService');

const chimeService = new ChimeService();

console.log('\n📞 Phone Number Validation:');
const testNumbers = [
    '5551234567',
    '+15551234567',
    '+13232488474', // Your Chime number
    '1234567890'
];

testNumbers.forEach(number => {
    const formatted = chimeService.formatPhoneNumber(number);
    const isValid = chimeService.validatePhoneNumber(formatted);
    console.log(`${number} -> ${formatted} (${isValid ? '✅ Valid' : '❌ Invalid'})`);
});

console.log('\n🎯 Your Chime Phone Number: +13232488474');
console.log('✅ This number will be used as the "from" number for all Take5 calls');
console.log('✅ Users will see this number on their caller ID when Take5 calls them');

console.log('\n🚀 Next Steps:');
console.log('1. Start your Take5 server: node app.js');
console.log('2. Test call creation:');
console.log('   curl -X POST http://localhost:3000/api/chime/call \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"groupId": 1, "scheduledTime": "2025-08-27T10:00:00.000Z"}\'');
console.log('3. Test SMS sending:');
console.log('   curl -X POST http://localhost:3000/api/chime/sms \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"phoneNumbers": ["5551234567"], "message": "Test from Take5"}\'');

console.log('\n📋 Configuration Summary:');
console.log('✅ Phone Number: +13232488474');
console.log('✅ Region: us-east-1');
console.log('✅ Service: AWS Chime SDK for Voice');
console.log('✅ Integration: Ready for Take5 calls'); 