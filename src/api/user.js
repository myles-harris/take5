const express = require('express');
const app = express();

const { getUser, createUser, updateUser, deleteUser, getAllUsers } = require('../services/userService');

app.get('/user', async (req, res, next) => {
    try {
        const result = await getAllUsers();
        if (result.error) {
            console.log(`ERROR getting all users: `, result.error);
            res.status(500).send(result.error);
        } else {
            console.log(`GETTING all users: `, result.value);
            res.send(result.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/user/:id', async (req, res, next) => {
    try {
        const foundUser = await getUser(req.params.id);
        if (foundUser.error) {
            console.log(`ERROR getting single user: `, foundUser.error);
            res.status(404).send(foundUser.error);
        } else {
            console.log(`GETTING single user: `, foundUser.value);
            res.status(200).send(foundUser.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/user', async (req, res, next) => {
    try {
        const newUser = await createUser(req.body);
        if (newUser.error) {
            res.status(400).send(newUser.error);
        } else {
            console.log(`POSTING new user: `, newUser.value);
            res.status(201).send(newUser.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.put('/user/:id', async (req, res, next) => {
    try {
        const updatedUser = await updateUser(req.params.id, req.body);
        if (updatedUser.error) {
            console.log(`ERROR updating user: `, updatedUser.error);
            res.status(404).send(updatedUser.error);
        } else {
            res.status(200).send(updatedUser.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.delete('/user/:id', async (req, res, next) => {
    try {
        const deletedUser = await deleteUser(req.params.id);
        if (deletedUser.error) {
            res.status(404).send(deletedUser.error);
        } else {
            console.log(`DELETING user`);
            res.status(204).end();
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = app;