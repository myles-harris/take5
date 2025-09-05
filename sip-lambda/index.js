const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log('SIP Media Application Event:', JSON.stringify(event, null, 2));
    
    const { InvocationEventType, CallDetails } = event;
    
    switch (InvocationEventType) {
        case 'NEW_INBOUND_CALL':
            console.log('New inbound call received');
            return {
                SchemaVersion: '1.0',
                Actions: [
                    {
                        Type: 'PlayAudio',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            AudioSource: {
                                Type: 'S3',
                                BucketName: 'take5-audio-bucket', // You'll need to create this
                                Key: 'welcome-message.wav'
                            }
                        }
                    },
                    {
                        Type: 'Pause',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            DurationInSeconds: 30
                        }
                    },
                    {
                        Type: 'Hangup',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            SipResponseCode: '0'
                        }
                    }
                ]
            };
            
        case 'RINGING':
            console.log('Call is ringing');
            return {
                SchemaVersion: '1.0',
                Actions: []
            };
            
        case 'CALL_ANSWERED':
            console.log('Call was answered');
            return {
                SchemaVersion: '1.0',
                Actions: [
                    {
                        Type: 'Speak',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            Text: 'Hello! This is your Take5 check-in call. How are you doing today?',
                            Engine: 'neural',
                            LanguageCode: 'en-US',
                            VoiceId: 'Joanna'
                        }
                    },
                    {
                        Type: 'Pause',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            DurationInSeconds: 10
                        }
                    },
                    {
                        Type: 'Speak',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            Text: 'Thank you for your time. Have a great day!',
                            Engine: 'neural',
                            LanguageCode: 'en-US',
                            VoiceId: 'Joanna'
                        }
                    },
                    {
                        Type: 'Hangup',
                        Parameters: {
                            CallId: CallDetails.TransactionId,
                            SipResponseCode: '0'
                        }
                    }
                ]
            };
            
        case 'HANGUP':
            console.log('Call ended');
            return {
                SchemaVersion: '1.0',
                Actions: []
            };
            
        default:
            console.log('Unknown event type:', InvocationEventType);
            return {
                SchemaVersion: '1.0',
                Actions: []
            };
    }
};
