const { pool } = require('./config');
const { UserDTO } = require('../dtos/userDTO');

class UserRepository {
    async findAll() {
        try {
            const result = await pool.query(`
                SELECT 
                    u.id,
                    u.given_name,
                    u.family_name,
                    u.phone_number,
                    u.timezone,
                    u.created_at,
                    u.updated_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', g.id,
                                'name', g.name,
                                'cadence', g.cadence,
                                'frequency', g.frequency,
                                'duration', g.duration,
                                'enabled', g.enabled,
                                'roll_call', g.roll_call
                            )
                        ) FILTER (WHERE g.id IS NOT NULL), 
                        '[]'
                    ) as groups
                FROM users u
                LEFT JOIN user_groups ug ON u.id = ug.user_id
                LEFT JOIN groups g ON ug.group_id = g.id
                GROUP BY u.id, u.given_name, u.family_name, u.phone_number, u.timezone, u.created_at, u.updated_at
                ORDER BY u.id
            `);
            
            return result.rows.map(row => new UserDTO({
                id: row.id,
                givenName: row.given_name,
                familyName: row.family_name,
                phoneNumber: row.phone_number,
                timezone: row.timezone,
                groups: row.groups
            }));
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const result = await pool.query(`
                SELECT 
                    u.id,
                    u.given_name,
                    u.family_name,
                    u.phone_number,
                    u.timezone,
                    u.created_at,
                    u.updated_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', g.id,
                                'name', g.name,
                                'cadence', g.cadence,
                                'frequency', g.frequency,
                                'duration', g.duration,
                                'enabled', g.enabled,
                                'roll_call', g.roll_call
                            )
                        ) FILTER (WHERE g.id IS NOT NULL), 
                        '[]'
                    ) as groups
                FROM users u
                LEFT JOIN user_groups ug ON u.id = ug.user_id
                LEFT JOIN groups g ON ug.group_id = g.id
                WHERE u.id = $1
                GROUP BY u.id, u.given_name, u.family_name, u.phone_number, u.timezone, u.created_at, u.updated_at
            `, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const row = result.rows[0];
            return new UserDTO({
                id: row.id,
                givenName: row.given_name,
                familyName: row.family_name,
                phoneNumber: row.phone_number,
                timezone: row.timezone,
                groups: row.groups
            });
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    async findByPhoneNumber(phoneNumber) {
        try {
            const result = await pool.query(`
                SELECT 
                    u.id,
                    u.given_name,
                    u.family_name,
                    u.phone_number,
                    u.timezone,
                    u.created_at,
                    u.updated_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', g.id,
                                'name', g.name,
                                'cadence', g.cadence,
                                'frequency', g.frequency,
                                'duration', g.duration,
                                'enabled', g.enabled,
                                'roll_call', g.roll_call
                            )
                        ) FILTER (WHERE g.id IS NOT NULL), 
                        '[]'
                    ) as groups
                FROM users u
                LEFT JOIN user_groups ug ON u.id = ug.user_id
                LEFT JOIN groups g ON ug.group_id = g.id
                WHERE u.phone_number = $1
                GROUP BY u.id, u.given_name, u.family_name, u.phone_number, u.timezone, u.created_at, u.updated_at
            `, [phoneNumber]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const row = result.rows[0];
            return new UserDTO({
                id: row.id,
                givenName: row.given_name,
                familyName: row.family_name,
                phoneNumber: row.phone_number,
                timezone: row.timezone,
                groups: row.groups
            });
        } catch (error) {
            console.error('Error finding user by phone number:', error);
            throw error;
        }
    }

    async create(userData) {
        try {
            const result = await pool.query(`
                INSERT INTO users (given_name, family_name, phone_number, timezone)
                VALUES ($1, $2, $3, $4)
                RETURNING id, given_name, family_name, phone_number, timezone, created_at, updated_at
            `, [userData.givenName, userData.familyName, userData.phoneNumber, userData.timezone]);
            
            const row = result.rows[0];
            return new UserDTO({
                id: row.id,
                givenName: row.given_name,
                familyName: row.family_name,
                phoneNumber: row.phone_number,
                timezone: row.timezone,
                groups: []
            });
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async update(id, userData) {
        try {
            const result = await pool.query(`
                UPDATE users 
                SET given_name = COALESCE($2, given_name),
                    family_name = COALESCE($3, family_name),
                    phone_number = COALESCE($4, phone_number),
                    timezone = COALESCE($5, timezone)
                WHERE id = $1
                RETURNING id, given_name, family_name, phone_number, timezone, created_at, updated_at
            `, [id, userData.givenName, userData.familyName, userData.phoneNumber, userData.timezone]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const row = result.rows[0];
            return new UserDTO({
                id: row.id,
                givenName: row.given_name,
                familyName: row.family_name,
                phoneNumber: row.phone_number,
                timezone: row.timezone,
                groups: [] // Will be populated when needed
            });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
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
}

module.exports = { UserRepository }; 