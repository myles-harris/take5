const { users } = require('../db/fakeUsers')
const { validatePostUser, validateGetUser, validateUpdateUser } = require('../utils/helpers/validators')
const { getElement, getIndex } = require('../utils/helpers/helpers')
const { UserDTO } = require('../dtos/userDTO')

function getUser(id) {
    const user = validateGetUser(id)
    return user
}

function createUser(data) {
    const validation = validatePostUser(data)
    if (validation.error) {
        return { error: validation.error.details[0].message }
    }
    
    // Generate new ID (in a real app, this would be handled by the database)
    const newId = Math.max(...users.map(u => u.id), 0) + 1
    
    const userData = {
        ...validation.value,
        id: newId,
        groups: []
    }
    
    const newUser = new UserDTO(userData)
    users.push(newUser)
    return { value: newUser }
}

function updateUser(id, data) {
    let user = getUser(id);
    if (user.error) {
        return user
    }
    
    const validation = validateUpdateUser(data)
    if (validation.error) {
        return { error: validation.error.details[0].message }
    }
    
    // Update the user with new data
    Object.assign(user, validation.value)
    return { value: user }
}

function deleteUser(id) {
    const user = validateGetUser(id)
    if (user.error) {
        return user
    }
    
    const index = getIndex(id, users)
    if (index !== -1) {
        users.splice(index, 1)
        return { value: user }
    }
    return { error: "User not found." }
}

exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;