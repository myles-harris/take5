const express = require('express');
const app = express();

/**
 * TODO:
 * make 'getElementById' function in /helpers
 * make 'getIndexById' function in /helpers
 * make 'createUser' function in /helpers
 * make 'updateUser' function in /helpers
 * validators??
 */

// import helper functions
const { getElementById, getIndexById, createUser, updateUser } = require('../helpers')
// import db?
const { users } = require('../../db/fakeUsers')

app.get('/user', (req, res, next) => {
    res.send(users)
})

app.get('/user/:id', (req, res, next) => {
    const foundUser = getElementById(req.params.id, users)
    if (foundUser) {
        res.send(foundUser)
    } else {
        res.status(404).send('User not found!')
    }
})

app.post('/user', (req, res, next) => {
    const newUser = createUser(req.query)
    if (newUser) {
        users.push(newUser)
        res.status(201).send()
    } else {
        res.status(400).send()
    }
})

app.put('/user/:id', (req, res, next) => {
    const userIdx = getIndexById(req.params.id, users)
    if (userIdx !== -1) {
        updateUser(req.params.id, req.query, users)
        res.send(users[userIdx])
    } else {
        res.status(404).send('User not found!')
    }
})

app.delete('/user/:id', (req, res, next) => {
    const userIdx = getIndexById(req.params.id, users)
    if (userIdx !== -1) {
        users.splice(userIdx, 1)
        res.status(204).send()
    } else {
        res.status(404).send()
    }
})