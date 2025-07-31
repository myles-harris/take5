const express = require('express');
const app = express();

const { getElement, getIndex } = require('../helpers')
const { getGroup, createGroup, updateGroup, deleteGroup } = require('../services/groupService');
const { groups } = require('../db/fakeGroups')

app.get('/group', (req, res, next) => {
    res.send(groups)
})

app.get('/group/:id', (req, res, next) => {
    const foundGroup = getGroup(req.params.id)
    if (foundGroup.error) {
        res.status(404).send(foundGroup.error)
    } else {
        res.status(200).send(foundGroup)
    }
})

app.post('/group', (req, res, next) => {
    const newGroup = createGroup(req.body)
    if (newGroup.error) {
        res.status(400).send(newGroup.error)
    } else {
        res.status(201).send(newGroup.value)
    }
})

app.put('/group/:id', (req, res, next) => {
    const updatedGroup = updateGroup(req.params.id, req.body)
    if (updatedGroup.error) {
        res.status(404).send(updatedGroup.error)
    } else {
        res.status(200).send(updatedGroup.value)
    }
})

app.delete('/group/:id', (req, res, next) => {
    const deletedGroup = deleteGroup(req.params.id)
    if (deletedGroup.error) {
        res.status(404).send(deletedGroup.value)
    } else {
        res.status(204).send(deletedGroup.value)
    }
})