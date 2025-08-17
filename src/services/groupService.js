const { groups } = require('../db/fakeGroups')
const { validatePostGroup, validateGetGroup, validateUpdateGroup } = require('../utils/helpers/validators')
const { getElement, getIndex } = require('../utils/helpers/helpers')

function getGroup(id) {
    const group = validateGetGroup(id)
    return group
}

function createGroup(data) {
    const group = validatePostGroup(data)
    if (group.value) {
        groups.push(group.value)
    }
    return group
}

function updateGroup(id, data) {
    let group = getGroup(id);
    if (group.value) {
        group = validateUpdateGroup(data)
        if (group.value) {
            Object.assign(groups[id], data)
            return groups[id]
        }
    }
    return group
}

function deleteGroup(id) {
    const group = validateGetGroup(id)
    if (group.value) {
        return groups.splice(getIndex(id, groups), 1)
    }
    return group
}

exports.getGroup = getGroup;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;