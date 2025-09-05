const { validateCreateUser, validateGetUser, validateUpdateUser } = require('../utils/helpers/validators')
const { UserRepository } = require('../db/userRepository')

const userRepository = new UserRepository();

async function getUser(id) {
    try {
        const validation = validateGetUser(id);
        if (validation.error) {
            return { error: validation.error };
        }
        
        const user = await userRepository.findById(validation.value);
        if (!user) {
            return { error: "User not found." };
        }
        return { value: user };
    } catch (error) {
        console.error('Error getting user:', error);
        return { error: "Database error occurred." };
    }
}

async function createUser(data) {
    try {
        const validation = validateCreateUser(data);
        if (validation.error) {
            return { error: validation.error.details[0].message };
        }
        
        // Check if user with phone number already exists
        const existingUser = await userRepository.findByPhoneNumber(validation.value.phoneNumber);
        if (existingUser) {
            return { error: "User with this phone number already exists." };
        }
        
        const newUser = await userRepository.create(validation.value);
        return { value: newUser };
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // Unique constraint violation
            return { error: "User with this phone number already exists." };
        }
        return { error: "Database error occurred." };
    }
}

async function updateUser(id, data) {
    try {
        const idValidation = validateGetUser(id);
        if (idValidation.error) {
            return { error: idValidation.error };
        }
        
        let user = await getUser(id);
        if (user.error) {
            return user;
        }
        
        const validation = validateUpdateUser(data);
        if (validation.error) {
            return { error: validation.error.details[0].message };
        }
        
        // Check if phone number is being updated and if it already exists
        if (validation.value.phoneNumber) {
            const existingUser = await userRepository.findByPhoneNumber(validation.value.phoneNumber);
            if (existingUser && existingUser.id !== idValidation.value) {
                return { error: "User with this phone number already exists." };
            }
        }
        
        const updatedUser = await userRepository.update(idValidation.value, validation.value);
        if (!updatedUser) {
            return { error: "User not found." };
        }
        
        return { value: updatedUser };
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.code === '23505') { // Unique constraint violation
            return { error: "User with this phone number already exists." };
        }
        return { error: "Database error occurred." };
    }
}

async function deleteUser(id) {
    try {
        const validation = validateGetUser(id);
        if (validation.error) {
            return { error: validation.error };
        }
        
        const user = await getUser(id);
        if (user.error) {
            return user;
        }
        
        const deleted = await userRepository.delete(validation.value);
        if (!deleted) {
            return { error: "User not found." };
        }
        
        return { value: user.value };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { error: "Database error occurred." };
    }
}

async function getAllUsers() {
    try {
        const users = await userRepository.findAll();
        return { value: users };
    } catch (error) {
        console.error('Error getting all users:', error);
        return { error: "Database error occurred." };
    }
}

exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;