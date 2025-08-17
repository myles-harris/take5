const { users } = require('../db/fakeUsers')
const { validatePostUser, validateGetUser, validateUpdateUser } = require('../utils/helpers/validators')
const { validatePostGroup, validateGetGroup, validateUpdateGroup } = require('../utils/helpers/validators')
const { getElement, getIndex } = require('../utils/helpers/helpers')

function getUser(id) {
    const user = validateGetUser(id)
    return user
}

function createUser(data) {
    const user = validatePostUser(data)
    if (user.value) {
        users.push(user.value)
    }
    return user
}

function updateUser(id, data) {
    let user = getUser(id);
    if (user.value) {
        user = validateUpdateUser(data)
        if (user.value) {
            Object.assign(users[id], data)
            return users[id]
        }
    }
    return user
}

function deleteUser(id) {
    const user = validateGetUser(id)
    if (user.value) {
        return users.splice(getIndex(id, users), 1)
    }
    return user
}

exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;