const express = require('express');
const app = express();

const { getElement, getIndex } = require('../utils/helpers/helpers')
const { getUser, createUser, updateUser, deleteUser } = require('../services/userService');
const { users } = require('../db/fakeUsers')

app.get('/user', (req, res, next) => {
    console.log(`GETTING all users: `, users);
    res.send(users)
})

app.get('/user/:id', (req, res, next) => {
    const foundUser = getUser(req.params.id)
    if (foundUser.error) {
        console.log(`ERROR getting single user: `, foundUser.error);
        res.status(404).send(foundUser.error)
    } else {
        console.log(`GETTING single user: `, foundUser);
        res.status(200).send(foundUser)
    }
})

app.post('/user', (req, res, next) => {
    const newUser = createUser(req.body)
    if (newUser.error) {
        console.log(`ERROR POSTING new user: `, newUser.error);
        res.status(400).send(newUser.error)
    } else {
        console.log(`POSTING new user: `, users);
        res.status(201).send(newUser.value)
    }
})

app.put('/user/:id', (req, res, next) => {
    const updatedUser = updateUser(req.params.id, req.body)
    if (updatedUser.error) {
        console.log(`PATCHING user: `, users);
        res.status(404).send(updatedUser.error)
    } else {
        console.log(`PATCHING user: `, users);
        res.status(200).send(updatedUser.value)
    }
})

app.delete('/user/:id', (req, res, next) => {
    const deletedUser = deleteUser(req.params.id)
    if (deletedUser.error) {
        console.log(`ERROR DELETING user: `, deletedUser.error);
        res.status(404).send(deletedUser.error)
    } else {
        console.log(`DELETING user`);
        res.status(204).end()
    }
})

module.exports = app;