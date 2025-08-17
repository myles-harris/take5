let { users } = require('../../db/fakeUsers');
let { groups } = require('../../db/fakeGroups');

const Joi = require('joi');
const { getElement } = require('./helpers');

const validator = (schema) => (payload) => schema.validate(payload, { abortEarly: false });

const userPostSchema = Joi.object({
    givenName:      Joi.string().alphanum().min(1).max(30).required(),
    familyName:     Joi.string().alphanum().min(1).max(30).required(),
    countryCode:    Joi.number().min(1).max(999).required(),
    phoneNumber:    Joi.string().length(10).pattern(/^[0-9]+$/).required()
});

const userUpdateSchema = Joi.object({
    givenName:      Joi.string().alphanum().min(1).max(30),
    familyName:     Joi.string().alphanum().min(1).max(30),
    countryCode:    Joi.number().min(1).max(999),
    phoneNumber:    Joi.string().length(10).pattern(/^[0-9]+$/),
    groups:         Joi.array().items(Joi.string())
});

const groupPostSchema = Joi.object({
    users:          Joi.array().items(Joi.string()).required(),
    cadence:        Joi.string().required(),
    frequency:      Joi.number().min(1).max(14).required()
});

const groupUpdateSchema = Joi.object({
    users:          Joi.array().items(Joi.string()),
    cadence:        Joi.string(),
    frequency:      Joi.number().min(1).max(14)
});

const validateGetUser = id => {
    const foundUser = getElement(id, users);
    if (foundUser) {
        return foundUser
    } else {
        return { error: "User not found." }
    }
}

const validateGetGroup = id => {
    const foundGroup = getElement(id, groups);
    if (foundGroup) {
        return foundGroup
    } else {
        return { error: "Group not found." }
    }
}

exports.validatePostUser = validator(userPostSchema);
exports.validateUpdateUser = validator(userUpdateSchema);
exports.validateGetUser = validateGetUser;
exports.validatePostGroup = validator(groupPostSchema);
exports.validateUpdateGroup = validator(groupUpdateSchema);
exports.validateGetGroup = validateGetGroup;