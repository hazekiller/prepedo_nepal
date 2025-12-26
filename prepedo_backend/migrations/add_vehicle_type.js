// Migration script to add vehicle_type column to vehicles table
const { promisePool } = require('../config/database');

async function migrate() {
    const connection = await promisePool.getConnection();

    try {
        console.log('🔄 Starting migration: Add vehicle_type to vehicles table...');

        // Check if column already exists
        const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'vehicles' 
        AND COLUMN_NAME = 'vehicle_type'
    `);

        if (columns.length > 0) {
            console.log('✅ Column vehicle_type already exists in vehicles table');
            return;
        }

        // Add the vehicle_type column
        await connection.query(`
      ALTER TABLE vehicles 
      ADD COLUMN vehicle_type ENUM('bike', 'car', 'taxi') NOT NULL 
      AFTER driver_id
    `);
        console.log('✅ Added vehicle_type column');

        // Add index
        await connection.query(`
      ALTER TABLE vehicles 
      ADD INDEX idx_vehicle_type (vehicle_type)
    `);
        console.log('✅ Added index on vehicle_type');

        // Update existing vehicles based on driver's vehicle_type
        const [result] = await connection.query(`
      UPDATE vehicles v 
      JOIN drivers d ON v.driver_id = d.id 
      SET v.vehicle_type = d.vehicle_type
    `);
        console.log(`✅ Updated ${result.affectedRows} existing vehicles with vehicle_type`);

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        connection.release();
        process.exit(0);
    }
}

migrate();
