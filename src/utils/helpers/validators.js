const Joi = require('joi');

// User validation schemas
const createUserSchema = Joi.object({
    givenName: Joi.string().min(1).max(50).required(),
    familyName: Joi.string().min(1).max(50).required(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).required(),
    timezone: Joi.string().valid('EST', 'CST', 'MST', 'PST', 'UTC').required()
});

const updateUserSchema = Joi.object({
    givenName: Joi.string().min(1).max(50),
    familyName: Joi.string().min(1).max(50),
    phoneNumber: Joi.string().pattern(/^\d{10}$/),
    timezone: Joi.string().valid('EST', 'CST', 'MST', 'PST', 'UTC')
});

const userIdSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

// Group validation schemas
const createGroupSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    users: Joi.array().items(Joi.number().integer().positive()).required(),
    cadence: Joi.string().valid('daily', 'weekly', 'monthly').required(),
    frequency: Joi.number().integer().min(1).max(30).required(),
    duration: Joi.number().integer().min(5).max(120).required(),
    enabled: Joi.boolean().required()
});

const updateGroupSchema = Joi.object({
    name: Joi.string().min(1).max(100),
    users: Joi.array().items(Joi.number().integer().positive()),
    cadence: Joi.string().valid('daily', 'weekly', 'monthly'),
    frequency: Joi.number().integer().min(1).max(30),
    duration: Joi.number().integer().min(5).max(120),
    enabled: Joi.boolean()
});

const groupIdSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

// Custom frequency validation for scheduling rules
const frequencyValidation = (value, helpers) => {
    const { cadence } = helpers.state.ancestors[0];
    
    if (cadence === 'daily' && value !== 1) {
        return helpers.error('frequency.daily');
    }
    
    if (cadence === 'weekly' && (value < 1 || value > 7)) {
        return helpers.error('frequency.weekly');
    }
    
    if (cadence === 'monthly' && (value < 1 || value > 30)) {
        return helpers.error('frequency.monthly');
    }
    
    return value;
};

// Enhanced group schema with frequency validation
const createGroupWithFrequencySchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    users: Joi.array().items(Joi.number().integer().positive()).required(),
    cadence: Joi.string().valid('daily', 'weekly', 'monthly').required(),
    frequency: Joi.number().integer().min(1).max(30).custom(frequencyValidation).required(),
    duration: Joi.number().integer().min(5).max(120).required(),
    enabled: Joi.boolean().required()
}).messages({
    'frequency.daily': 'Daily cadence requires frequency of exactly 1',
    'frequency.weekly': 'Weekly cadence requires frequency between 1 and 7',
    'frequency.monthly': 'Monthly cadence requires frequency between 1 and 30'
});

// Validation functions
const validateCreateUser = (payload) => createUserSchema.validate(payload);
const validateUpdateUser = (payload) => updateUserSchema.validate(payload);
const validateGetUser = (params) => userIdSchema.validate(params);
const validateCreateGroup = (payload) => createGroupWithFrequencySchema.validate(payload);
const validateUpdateGroup = (payload) => updateGroupSchema.validate(payload);
const validateGetGroup = (params) => groupIdSchema.validate(params);

// Chime API validation schemas
const createCallSchema = Joi.object({
    groupId: Joi.number().integer().positive().required(),
    scheduledTime: Joi.date().iso().required()
});

// Updated callId schema to support both old and new formats
const callIdSchema = Joi.object({
    callId: Joi.string().pattern(/^(take5-\d+-\d+|take5-video-\d+-\d+|[a-f0-9-]{36})$/).required()
});

const addParticipantSchema = Joi.object({
    callId: Joi.string().pattern(/^(take5-\d+-\d+|take5-video-\d+-\d+|[a-f0-9-]{36})$/).required(),
    userId: Joi.number().integer().positive().required()
});

const removeParticipantSchema = Joi.object({
    callId: Joi.string().pattern(/^(take5-\d+-\d+|take5-video-\d+-\d+|[a-f0-9-]{36})$/).required(),
    attendeeId: Joi.string().required()
});

const sendSMSSchema = Joi.object({
    phoneNumbers: Joi.array().items(Joi.string().pattern(/^\d{10}$/)).min(1).required(),
    message: Joi.string().min(1).max(1600).required()
});

const validateCreateCall = (payload) => createCallSchema.validate(payload);
const validateCallId = (params) => callIdSchema.validate(params);
const validateAddParticipant = (params) => addParticipantSchema.validate(params);
const validateRemoveParticipant = (params) => removeParticipantSchema.validate(params);
const validateSendSMS = (payload) => sendSMSSchema.validate(payload);

exports.validateCreateUser = validateCreateUser;
exports.validateUpdateUser = validateUpdateUser;
exports.validateGetUser = validateGetUser;
exports.validateCreateGroup = validateCreateGroup;
exports.validateUpdateGroup = validateUpdateGroup;
exports.validateGetGroup = validateGetGroup;
exports.validateCreateCall = validateCreateCall;
exports.validateCallId = validateCallId;
exports.validateAddParticipant = validateAddParticipant;
exports.validateRemoveParticipant = validateRemoveParticipant;
exports.validateSendSMS = validateSendSMS;

// Mobile validation schemas
const registerPushTokenSchema = Joi.object({
    userId: Joi.number().integer().positive().required(),
    pushToken: Joi.string().min(1).max(200).required()
});

const joinCallSchema = Joi.object({
    userId: Joi.number().integer().positive().required(),
    roomSid: Joi.string().min(1).max(50).required(),
    groupId: Joi.number().integer().positive().required()
});

// Validation functions
const validateRegisterPushToken = (data) => registerPushTokenSchema.validate(data);
const validateJoinCall = (data) => joinCallSchema.validate(data);

module.exports = {
    // Existing exports
    createUserSchema,
    updateUserSchema,
    userIdSchema,
    createGroupSchema,
    updateGroupSchema,
    groupIdSchema,
    createCallSchema,
    callIdSchema,
    addParticipantSchema,
    removeParticipantSchema,
    sendSMSSchema,
    validateCreateUser,
    validateUpdateUser,
    validateGetUser,
    validateCreateGroup,
    validateUpdateGroup,
    validateGetGroup,
    validateCreateCall,
    validateCallId,
    validateAddParticipant,
    validateRemoveParticipant,
    validateSendSMS,
    // New mobile exports
    validateRegisterPushToken,
    validateJoinCall
};
