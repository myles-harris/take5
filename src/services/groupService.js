const { groups } = require('../db/fakeGroups')
const { validatePostGroup, validateGetGroup, validateUpdateGroup } = require('../utils/helpers/validators')
const { getElement, getIndex } = require('../utils/helpers/helpers')

function getGroup(id) {
    const group = validateGetGroup(id)
    if (group.error) {
        return group.error
    } else {
        return group.value
    }
}

function createGroup(data) {
    const group = validatePostGroup(data)
    if (group.error) {
        return group.error
    } else {
        groups.push(group.value)
        return group.value
    }
}

function updateGroup(id, data) {
    let group = getGroup(id);
    if (group.error) {
        return group.error
    } else {
        group = validateUpdateGroup(data)
        if (group.error) {
            return group.error
        } else {
            Object.assign(groups[id], data)
            return groups[id]
        }
    }
}

function deleteGroup(id) {
    const group = validateGetGroup(id)
    if (group.error) {
        return group.error
    } else {
        return groups.splice(getIndex(id, groups), 1)
    }
}

exports.getGroup = getGroup;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;