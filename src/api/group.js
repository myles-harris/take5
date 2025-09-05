const express = require('express');
const app = express();

const { getGroup, createGroup, updateGroup, deleteGroup, getAllGroups } = require('../services/groupService');

app.get('/group', async (req, res, next) => {
    try {
        const result = await getAllGroups();
        if (result.error) {
            console.log(`ERROR getting all groups: `, result.error);
            res.status(500).send(result.error);
        } else {
            console.log(`GETTING all groups: `, result.value);
            res.send(result.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/group/:id', async (req, res, next) => {
    try {
        const foundGroup = await getGroup(req.params.id);
        if (foundGroup.error) {
            res.status(404).send(foundGroup.error);
        } else {
            res.status(200).send(foundGroup.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/group', async (req, res, next) => {
    try {
        const newGroup = await createGroup(req.body);
        if (newGroup.error) {
            res.status(400).send(newGroup.error);
        } else {
            res.status(201).send(newGroup.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.put('/group/:id', async (req, res, next) => {
    try {
        const updatedGroup = await updateGroup(req.params.id, req.body);
        if (updatedGroup.error) {
            res.status(404).send(updatedGroup.error);
        } else {
            res.status(200).send(updatedGroup.value);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

app.delete('/group/:id', async (req, res, next) => {
    try {
        const deletedGroup = await deleteGroup(req.params.id);
        if (deletedGroup.error) {
            res.status(404).send(deletedGroup.error);
        } else {
            res.status(204).end();
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = app;