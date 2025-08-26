const { Timezone } = require('../constants/timezone');
const { Cadence } = require('../constants/cadenceType');

const Joi = require('joi');

const validator = (schema) => (payload) => schema.validate(payload, { abortEarly: false });

const userPostSchema = Joi.object({
    givenName:      Joi.string().alphanum().min(1).max(30).required(),
    familyName:     Joi.string().alphanum().min(1).max(30).required(),
    phoneNumber:    Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    timezone:       Joi.string().valid(...Object.values(Timezone)).default(Timezone.UTC)
});

const userUpdateSchema = Joi.object({
    givenName:      Joi.string().alphanum().min(1).max(30),
    familyName:     Joi.string().alphanum().min(1).max(30),
    phoneNumber:    Joi.string().length(10).pattern(/^[0-9]+$/),
    timezone:       Joi.string().valid(...Object.values(Timezone)),
    groups:         Joi.array().items(Joi.number())
});

const groupPostSchema = Joi.object({
    name:           Joi.string().min(1).max(50).required(),
    users:          Joi.array().items(Joi.number()).required(),
    cadence:        Joi.string().valid(...Object.values(Cadence)).required(),
    frequency:      Joi.number().min(1).max(14).required(),
    duration:       Joi.number().min(1).max(60).required(), // 1-60 minutes
    enabled:        Joi.boolean().default(true)
});

const groupUpdateSchema = Joi.object({
    name:           Joi.string().min(1).max(50),
    users:          Joi.array().items(Joi.number()),
    cadence:        Joi.string().valid(...Object.values(Cadence)),
    frequency:      Joi.number().min(1).max(14),
    duration:       Joi.number().min(1).max(60), // 1-60 minutes
    enabled:        Joi.boolean()
});

// Simple validation functions - database lookups will be handled by repositories
const validateGetUser = (id) => {
    const numId = parseInt(id);
    if (isNaN(numId) || numId <= 0) {
        return { error: "Invalid user ID." };
    }
    return { value: numId };
}

const validateGetGroup = (id) => {
    const numId = parseInt(id);
    if (isNaN(numId) || numId <= 0) {
        return { error: "Invalid group ID." };
    }
    return { value: numId };
}

exports.validatePostUser = validator(userPostSchema);
exports.validateUpdateUser = validator(userUpdateSchema);
exports.validateGetUser = validateGetUser;
exports.validatePostGroup = validator(groupPostSchema);
exports.validateUpdateGroup = validator(groupUpdateSchema);
exports.validateGetGroup = validateGetGroup;