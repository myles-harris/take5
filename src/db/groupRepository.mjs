/**
 * GroupRepository for Lambda Function
 * 
 * This is a simplified version that provides mock data for testing
 * the Lambda function without requiring database connections.
 */

class GroupRepository {
    constructor() {
        // Mock data for testing
        this.mockGroups = [
            {
                id: 1,
                name: 'Daily Check-in',
                users: [
                    { id: 1, phoneNumber: '1111111111', timezone: 'EST' },
                    { id: 2, phoneNumber: '2222222222', timezone: 'PST' }
                ],
                cadence: 'daily',
                frequency: 1,
                duration: 5,
                enabled: true,
                rollCall: {}
            },
            {
                id: 2,
                name: 'Weekly Team Sync',
                users: [
                    { id: 1, phoneNumber: '1111111111', timezone: 'EST' },
                    { id: 3, phoneNumber: '3333333333', timezone: 'CST' }
                ],
                cadence: 'weekly',
                frequency: 3,
                duration: 15,
                enabled: true,
                rollCall: {
                    '2024-01-15T10:00:00.000Z': ['user1']
                }
            },
            {
                id: 3,
                name: 'Monthly Review',
                users: [
                    { id: 2, phoneNumber: '2222222222', timezone: 'PST' },
                    { id: 4, phoneNumber: '4444444444', timezone: 'MST' }
                ],
                cadence: 'monthly',
                frequency: 5,
                duration: 30,
                enabled: true,
                rollCall: {
                    '2024-01-01T14:00:00.000Z': ['user2']
                }
            }
        ];
    }

    /**
     * Find all groups
     * @returns {Promise<Array>} Array of groups
     */
    async findAll() {
        console.log('Mock GroupRepository: Finding all groups');
        return this.mockGroups;
    }

    /**
     * Find group by ID
     * @param {number} id - Group ID
     * @returns {Promise<Object|null>} Group object or null
     */
    async findById(id) {
        console.log(`Mock GroupRepository: Finding group by ID ${id}`);
        return this.mockGroups.find(group => group.id === id) || null;
    }

    /**
     * Create a new group
     * @param {Object} groupData - Group data
     * @returns {Promise<Object>} Created group
     */
    async create(groupData) {
        console.log('Mock GroupRepository: Creating new group');
        const newGroup = {
            id: this.mockGroups.length + 1,
            ...groupData,
            users: groupData.users || []
        };
        this.mockGroups.push(newGroup);
        return newGroup;
    }

    /**
     * Update a group
     * @param {number} id - Group ID
     * @param {Object} groupData - Updated group data
     * @returns {Promise<Object|null>} Updated group or null
     */
    async update(id, groupData) {
        console.log(`Mock GroupRepository: Updating group ${id}`);
        const index = this.mockGroups.findIndex(group => group.id === id);
        if (index === -1) return null;
        
        this.mockGroups[index] = { ...this.mockGroups[index], ...groupData };
        return this.mockGroups[index];
    }

    /**
     * Delete a group
     * @param {number} id - Group ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        console.log(`Mock GroupRepository: Deleting group ${id}`);
        const index = this.mockGroups.findIndex(group => group.id === id);
        if (index === -1) return false;
        
        this.mockGroups.splice(index, 1);
        return true;
    }

    /**
     * Add user to group
     * @param {number} groupId - Group ID
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async addUserToGroup(groupId, userId) {
        console.log(`Mock GroupRepository: Adding user ${userId} to group ${groupId}`);
        const group = this.mockGroups.find(g => g.id === groupId);
        if (!group) return false;
        
        // Mock user data
        const mockUser = {
            id: userId,
            phoneNumber: `${userId}000000000`,
            timezone: 'UTC'
        };
        
        if (!group.users.find(u => u.id === userId)) {
            group.users.push(mockUser);
        }
        
        return true;
    }

    /**
     * Remove user from group
     * @param {number} groupId - Group ID
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async removeUserFromGroup(groupId, userId) {
        console.log(`Mock GroupRepository: Removing user ${userId} from group ${groupId}`);
        const group = this.mockGroups.find(g => g.id === groupId);
        if (!group) return false;
        
        const userIndex = group.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;
        
        group.users.splice(userIndex, 1);
        return true;
    }

    /**
     * Update roll call for a group
     * @param {number} groupId - Group ID
     * @param {Object} rollCall - Roll call data
     * @returns {Promise<boolean>} Success status
     */
    async updateRollCall(groupId, rollCall) {
        console.log(`Mock GroupRepository: Updating roll call for group ${groupId}`);
        const group = this.mockGroups.find(g => g.id === groupId);
        if (!group) return false;
        
        group.rollCall = { ...group.rollCall, ...rollCall };
        return true;
    }
}

export { GroupRepository }; 