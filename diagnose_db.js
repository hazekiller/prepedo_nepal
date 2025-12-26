require('dotenv').config({ path: './prepedo_backend/.env' });
const { promisePool } = require('./prepedo_backend/config/database');

async function diagnose() {
    try {
        console.log('--- DIAGNOSIS START ---');

        // Check Drivers
        const [drivers] = await promisePool.query(
            `SELECT d.id, u.full_name, u.email, d.vehicle_type, d.is_online, d.is_approved 
       FROM drivers d 
       JOIN users u ON d.user_id = u.id`
        );
        console.log('DRIVERS:', drivers);

        // Check Bookings
        const [bookings] = await promisePool.query(
            `SELECT id, booking_number, user_id, vehicle_type, status, created_at 
       FROM bookings 
       WHERE status = 'pending'`
        );
        console.log('PENDING BOOKINGS:', bookings);

        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSIS ERROR:', err);
        process.exit(1);
    }
}

diagnose();
