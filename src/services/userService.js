const { users } = require('../db/fakeUsers')
const { validatePostUser, validateGetUser, validateUpdateUser } = require('../utils/helpers/validators')
const { validatePostGroup, validateGetGroup, validateUpdateGroup } = require('../utils/helpers/validators')
const { getElement, getIndex } = require('../utils/helpers/helpers')

function getUser(id) {
    const user = validateGetUser(id)
    // console.log(user.error)
    // console.log(user.value)
    return user
    // if (user.error) {
    //     return user.error
    // } else {
    //     return user.value
    // }
}

function createUser(data) {
    const user = validatePostUser(data)
    if (user.error) {
        return user.error
    } else {
        users.push(user.value)
        return user.value
    }
}

function updateUser(id, data) {
    let user = getUser(id);
    if (user.error) {
        return user.error
    } else {
        user = validateUpdateUser(data)
        if (user.error) {
            return user.error
        } else {
            Object.assign(users[id], data)
            return users[id]
        }
    }
}

function deleteUser(id) {
    const user = validateGetUser(id)
    if (user.error) {
        return user.error
    } else {
        return users.splice(getIndex(id, users), 1)
    }
}

exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;