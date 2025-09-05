const { pool } = require('./config');
const { GroupDTO } = require('../dtos/groupDTO');

class GroupRepository {
    async findAll() {
        try {
            const result = await pool.query(`
                SELECT 
                    g.id,
                    g.name,
                    g.cadence,
                    g.frequency,
                    g.duration,
                    g.enabled,
                    g.roll_call,
                    g.created_at,
                    g.updated_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', u.id,
                                'givenName', u.given_name,
                                'familyName', u.family_name,
                                'phoneNumber', u.phone_number,
                                'timezone', u.timezone
                            )
                        ) FILTER (WHERE u.id IS NOT NULL), 
                        '[]'
                    ) as users
                FROM groups g
                LEFT JOIN user_groups ug ON g.id = ug.group_id
                LEFT JOIN users u ON ug.user_id = u.id
                GROUP BY g.id, g.name, g.cadence, g.frequency, g.duration, g.enabled, g.roll_call, g.created_at, g.updated_at
                ORDER BY g.id
            `);
            
            return result.rows.map(row => new GroupDTO({
                id: row.id,
                name: row.name,
                cadence: row.cadence,
                frequency: row.frequency,
                duration: row.duration,
                enabled: row.enabled,
                rollCall: row.roll_call,
                users: row.users
            }));
        } catch (error) {
            console.error('Error finding all groups:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const result = await pool.query(`
                SELECT 
                    g.id,
                    g.name,
                    g.cadence,
                    g.frequency,
                    g.duration,
                    g.enabled,
                    g.roll_call,
                    g.created_at,
                    g.updated_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', u.id,
                                'givenName', u.given_name,
                                'familyName', u.family_name,
                                'phoneNumber', u.phone_number,
                                'timezone', u.timezone
                            )
                        ) FILTER (WHERE u.id IS NOT NULL), 
                        '[]'
                    ) as users
                FROM groups g
                LEFT JOIN user_groups ug ON g.id = ug.group_id
                LEFT JOIN users u ON ug.user_id = u.id
                WHERE g.id = $1
                GROUP BY g.id, g.name, g.cadence, g.frequency, g.duration, g.enabled, g.roll_call, g.created_at, g.updated_at
            `, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const row = result.rows[0];
            return new GroupDTO({
                id: row.id,
                name: row.name,
                cadence: row.cadence,
                frequency: row.frequency,
                duration: row.duration,
                enabled: row.enabled,
                rollCall: row.roll_call,
                users: row.users
            });
        } catch (error) {
            console.error('Error finding group by id:', error);
            throw error;
        }
    }

    async create(groupData) {
        try {
            const result = await pool.query(`
                INSERT INTO groups (name, cadence, frequency, duration, enabled)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, cadence, frequency, duration, enabled, roll_call, created_at, updated_at
            `, [groupData.name, groupData.cadence, groupData.frequency, groupData.duration, groupData.enabled]);
            
            const row = result.rows[0];
            const newGroup = new GroupDTO({
                id: row.id,
                name: row.name,
                cadence: row.cadence,
                frequency: row.frequency,
                duration: row.duration,
                enabled: row.enabled,
                rollCall: row.roll_call,
                users: []
            });
            
            // Add users to the group if provided
            if (groupData.users && groupData.users.length > 0) {
                for (const userId of groupData.users) {
                    await this.addUserToGroup(userId, row.id);
                }
                // Fetch the group again with users
                return await this.findById(row.id);
            }
            
            return newGroup;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    async update(id, groupData) {
        try {
            const result = await pool.query(`
                UPDATE groups 
                SET name = COALESCE($2, name),
                    cadence = COALESCE($3, cadence),
                    frequency = COALESCE($4, frequency),
                    duration = COALESCE($5, duration),
                    enabled = COALESCE($6, enabled)
                WHERE id = $1
                RETURNING id, name, cadence, frequency, duration, enabled, roll_call, created_at, updated_at
            `, [id, groupData.name, groupData.cadence, groupData.frequency, groupData.duration, groupData.enabled]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const row = result.rows[0];
            return new GroupDTO({
                id: row.id,
                name: row.name,
                cadence: row.cadence,
                frequency: row.frequency,
                duration: row.duration,
                enabled: row.enabled,
                rollCall: row.roll_call,
                users: [] // Will be populated when needed
            });
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    }

    async addUserToGroup(userId, groupId) {
        try {
            await pool.query(
                'INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT (user_id, group_id) DO NOTHING',
                [userId, groupId]
            );
            return true;
        } catch (error) {
            console.error('Error adding user to group:', error);
            throw error;
        }
    }

    async removeUserFromGroup(userId, groupId) {
        try {
            const result = await pool.query(
                'DELETE FROM user_groups WHERE user_id = $1 AND group_id = $2',
                [userId, groupId]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error('Error removing user from group:', error);
            throw error;
        }
    }

    async updateRollCall(groupId, date, users) {
        try {
            const result = await pool.query(`
                UPDATE groups 
                SET roll_call = jsonb_set(
                    COALESCE(roll_call, '{}'::jsonb),
                    $2,
                    $3::jsonb
                )
                WHERE id = $1
                RETURNING roll_call
            `, [groupId, `{${date}}`, JSON.stringify(users)]);
            
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error updating roll call:', error);
            throw error;
        }
    }
}

module.exports = { GroupRepository }; 