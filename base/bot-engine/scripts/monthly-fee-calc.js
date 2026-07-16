'use strict';
require('dotenv').config({ path: '../../templates/.env.level2.example' }); // Fallback for local testing
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.TRACKER_DB_URL,
  ssl: { rejectUnauthorized: false }
});

const COMMISSION_RATE = 0.03; // 3% fee

async function calculateMonthlyFees() {
  console.log(`[FeeCalc] Starting monthly fee calculation...`);
  
  // Get previous month range
  const now = new Date();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const monthString = `${startOfPrevMonth.getFullYear()}-${String(startOfPrevMonth.getMonth() + 1).padStart(2, '0')}`;
  
  try {
    const res = await pool.query(`
      SELECT 
        client_id, 
        COUNT(*) as total_bookings, 
        SUM(total_value) as total_revenue
      FROM booking_events
      WHERE status = 'confirmed' 
        AND created_at >= $1 
        AND created_at <= $2
      GROUP BY client_id
    `, [startOfPrevMonth.toISOString(), endOfPrevMonth.toISOString()]);
    
    for (const row of res.rows) {
      const clientId = row.client_id;
      const totalRevenue = parseFloat(row.total_revenue) || 0;
      const feeAmount = totalRevenue * COMMISSION_RATE;
      
      console.log(`[FeeCalc] Client: ${clientId} | Bookings: ${row.total_bookings} | Rev: $${totalRevenue} | Fee: $${feeAmount.toFixed(2)}`);
      
      // Insert into monthly_invoices (matching schema.sql)
      const startDateStr = startOfPrevMonth.toISOString().split('T')[0];
      const endDateStr = endOfPrevMonth.toISOString().split('T')[0];
      
      await pool.query(`
        INSERT INTO monthly_invoices (client_id, period_start, period_end, total_bookings, total_value, fee_amount, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        ON CONFLICT (client_id, period_start) DO NOTHING
      `, [clientId, startDateStr, endDateStr, parseInt(row.total_bookings), totalRevenue, feeAmount]);
    }
    
    console.log(`[FeeCalc] Completed calculation for ${res.rows.length} clients.`);
  } catch (err) {
    console.error(`[FeeCalc] Error:`, err);
  } finally {
    pool.end();
  }
}

calculateMonthlyFees();
