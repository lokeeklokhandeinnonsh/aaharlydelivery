
const { Pool } = require('pg');

const connectionString = "postgresql://postgres:innonsh%402026@db.qpccigzqvfszbbeirgjk.supabase.co:5432/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkFcmTokens() {
    const client = await pool.connect();
    try {
        console.log('--- Checking FCM Tokens in Users Table ---');
        const res = await client.query('SELECT id, mobile, fcm_token FROM users WHERE fcm_token IS NOT NULL');

        if (res.rows.length === 0) {
            console.log('❌ No users found with fcm_token.');
        } else {
            console.log(`✅ Found ${res.rows.length} users with fcm_token:`);
            res.rows.forEach(row => {
                console.log(`User ID: ${row.id} | Mobile: ${row.mobile} | Token: ${row.fcm_token.substring(0, 20)}...`);
            });
        }

        console.log('\n--- Checking Recent Delivery Status ---');
        const deliveryRes = await client.query(`
      SELECT ums.id, ums.delivery_status, u.mobile, u.fcm_token 
      FROM user_meal_schedule ums
      LEFT JOIN users u ON ums.user_id = u.id
      WHERE ums.meal_date >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY ums.meal_date DESC
      LIMIT 10
    `);

        deliveryRes.rows.forEach(row => {
            console.log(`Delivery: ${row.id} | Status: ${row.delivery_status} | User: ${row.mobile} | Token: ${row.fcm_token ? 'YES' : 'NO'}`);
        });

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

checkFcmTokens();
