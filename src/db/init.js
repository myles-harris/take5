const fs = require('fs');
const path = require('path');
const { pool } = require('./config');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the entire schema as one statement
        await pool.query(schema);
        
        console.log('Database schema created successfully');
        
        // Check if we should seed with initial data
        const shouldSeed = process.env.SEED_DATABASE === 'true';
        if (shouldSeed) {
            await seedDatabase();
        }
        
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

async function seedDatabase() {
    try {
        console.log('Seeding database with initial data...');
        
        // Insert sample users
        const users = [
            { given_name: 'myles', family_name: 'harris', phone_number: '1111111111', timezone: 'EST' },
            { given_name: 'john', family_name: 'doe', phone_number: '2222222222', timezone: 'PST' },
            { given_name: 'huey', family_name: 'freeman', phone_number: '3333333333', timezone: 'CST' },
            { given_name: 'riley', family_name: 'freeman', phone_number: '4444444444', timezone: 'MST' }
        ];
        
        for (const user of users) {
            await pool.query(
                'INSERT INTO users (given_name, family_name, phone_number, timezone) VALUES ($1, $2, $3, $4) ON CONFLICT (phone_number) DO NOTHING',
                [user.given_name, user.family_name, user.phone_number, user.timezone]
            );
        }
        
        // Insert sample groups
        const groups = [
            { name: 'First Group', cadence: 'daily', frequency: 1, duration: 5 },
            { name: 'Second Group', cadence: 'weekly', frequency: 2, duration: 10 }
        ];
        
        for (const group of groups) {
            await pool.query(
                'INSERT INTO groups (name, cadence, frequency, duration) VALUES ($1, $2, $3, $4)',
                [group.name, group.cadence, group.frequency, group.duration]
            );
        }
        
        // Add users to groups (assuming user IDs 1,2,3,4 and group IDs 1,2)
        const userGroups = [
            { user_id: 1, group_id: 1 },
            { user_id: 3, group_id: 1 },
            { user_id: 2, group_id: 2 },
            { user_id: 4, group_id: 2 }
        ];
        
        for (const userGroup of userGroups) {
            await pool.query(
                'INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT (user_id, group_id) DO NOTHING',
                [userGroup.user_id, userGroup.group_id]
            );
        }
        
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database setup complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase, seedDatabase }; 