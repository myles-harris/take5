const { groups } = require('../db/fakeGroups')
const { validatePostGroup, validateGetGroup, validateUpdateGroup } = require('../utils/helpers/validators')
const { getElement, getIndex } = require('../utils/helpers/helpers')
const { GroupDTO } = require('../dtos/groupDTO')

function getGroup(id) {
    const group = validateGetGroup(id)
    return group
}

function createGroup(data) {
    const validation = validatePostGroup(data)
    if (validation.error) {
        return { error: validation.error.details[0].message }
    }
    
    // Generate new ID (in a real app, this would be handled by the database)
    const newId = Math.max(...groups.map(g => g.id), 0) + 1
    
    const groupData = {
        ...validation.value,
        id: newId,
        rollCall: {}
    }
    
    const newGroup = new GroupDTO(groupData)
    groups.push(newGroup)
    return { value: newGroup }
}

function updateGroup(id, data) {
    let group = getGroup(id);
    if (group.error) {
        return group
    }
    
    const validation = validateUpdateGroup(data)
    if (validation.error) {
        return { error: validation.error.details[0].message }
    }
    
    // Update the group with new data
    Object.assign(group, validation.value)
    return { value: group }
}

function deleteGroup(id) {
    const group = validateGetGroup(id)
    if (group.error) {
        return group
    }
    
    const index = getIndex(id, groups)
    if (index !== -1) {
        groups.splice(index, 1)
        return { value: group }
    }
    return { error: "Group not found." }
}

exports.getGroup = getGroup;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;