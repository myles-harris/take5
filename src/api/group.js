const express = require('express');
const app = express();

const { getElement, getIndex } = require('../utils/helpers/helpers')
const { getGroup, createGroup, updateGroup, deleteGroup } = require('../services/groupService');
const { groups } = require('../db/fakeGroups')

app.get('/group', (req, res, next) => {
    res.send(groups)
})

app.get('/group/:id', (req, res, next) => {
    const foundGroup = getGroup(req.params.id)
    if (foundGroup.error) {
        console.log(`ERROR GETTING single group: `, foundGroup.error);
        res.status(404).send(foundGroup.error)
    } else {
        console.log(`GETTING single group: `, foundGroup);
        res.status(200).send(foundGroup)
    }
})

app.post('/group', (req, res, next) => {
    const newGroup = createGroup(req.body)
    if (newGroup.error) {
        console.log(`ERROR POSTING new group: `, newGroup.error);
        res.status(400).send(newGroup.error)
    } else {
        console.log(`POSTING new group: `, newGroup.value);
        res.status(201).send(newGroup.value)
    }
})

app.put('/group/:id', (req, res, next) => {
    const updatedGroup = updateGroup(req.params.id, req.body)
    if (updatedGroup.error) {
        console.log(`ERROR PATCHING group: `, updatedGroup.error);
        res.status(404).send(updatedGroup.error)
    } else {
        console.log(`PATCHING group: `, updatedGroup.value);
        res.status(200).send(updatedGroup.value)
    }
})

app.delete('/group/:id', (req, res, next) => {
    const deletedGroup = deleteGroup(req.params.id)
    if (deletedGroup.error) {
        console.log(`ERROR DELETING group: `, deletedGroup.error);
        res.status(404).send(deletedGroup.error)
    } else {
        console.log(`DELETING group `, deletedGroup.value);
        res.status(204).end()
    }
})

module.exports = app;