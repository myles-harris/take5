const { validateCreateGroup, validateGetGroup, validateUpdateGroup } = require('../utils/helpers/validators')
const { GroupRepository } = require('../db/groupRepository')

const groupRepository = new GroupRepository();

async function getGroup(id) {
    try {
        const validation = validateGetGroup(id);
        if (validation.error) {
            return { error: validation.error };
        }
        
        const group = await groupRepository.findById(validation.value);
        if (!group) {
            return { error: "Group not found." };
        }
        return { value: group };
    } catch (error) {
        console.error('Error getting group:', error);
        return { error: "Database error occurred." };
    }
}

async function createGroup(data) {
    try {
        const validation = validateCreateGroup(data);
        if (validation.error) {
            return { error: validation.error.details[0].message };
        }
        
        const newGroup = await groupRepository.create(validation.value);
        return { value: newGroup };
    } catch (error) {
        console.error('Error creating group:', error);
        return { error: "Database error occurred." };
    }
}

async function updateGroup(id, data) {
    try {
        const idValidation = validateGetGroup(id);
        if (idValidation.error) {
            return { error: idValidation.error };
        }
        
        let group = await getGroup(id);
        if (group.error) {
            return group;
        }
        
        const validation = validateUpdateGroup(data);
        if (validation.error) {
            return { error: validation.error.details[0].message };
        }
        
        const updatedGroup = await groupRepository.update(idValidation.value, validation.value);
        if (!updatedGroup) {
            return { error: "Group not found." };
        }
        
        return { value: updatedGroup };
    } catch (error) {
        console.error('Error updating group:', error);
        return { error: "Database error occurred." };
    }
}

async function deleteGroup(id) {
    try {
        const validation = validateGetGroup(id);
        if (validation.error) {
            return { error: validation.error };
        }
        
        const group = await getGroup(id);
        if (group.error) {
            return group;
        }
        
        const deleted = await groupRepository.delete(validation.value);
        if (!deleted) {
            return { error: "Group not found." };
        }
        
        return { value: group.value };
    } catch (error) {
        console.error('Error deleting group:', error);
        return { error: "Database error occurred." };
    }
}

async function getAllGroups() {
    try {
        const groups = await groupRepository.findAll();
        return { value: groups };
    } catch (error) {
        console.error('Error getting all groups:', error);
        return { error: "Database error occurred." };
    }
}

async function addUserToGroup(userId, groupId) {
    try {
        await groupRepository.addUserToGroup(userId, groupId);
        return { value: true };
    } catch (error) {
        console.error('Error adding user to group:', error);
        return { error: "Database error occurred." };
    }
}

async function removeUserFromGroup(userId, groupId) {
    try {
        const removed = await groupRepository.removeUserFromGroup(userId, groupId);
        if (!removed) {
            return { error: "User not found in group." };
        }
        return { value: true };
    } catch (error) {
        console.error('Error removing user from group:', error);
        return { error: "Database error occurred." };
    }
}

exports.getGroup = getGroup;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
exports.getAllGroups = getAllGroups;
exports.addUserToGroup = addUserToGroup;
exports.removeUserFromGroup = removeUserFromGroup;