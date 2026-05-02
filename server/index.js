const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Leads API ---
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY date_received DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  const lead = req.body;
  try {
    const query = `
      INSERT INTO leads (id, name, company, industry, country, phone, whatsapp, email, source, campaign, date_received, priority, notes, follow_up_date, status, incentive, closing_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        name = $2, company = $3, industry = $4, country = $5, phone = $6, whatsapp = $7, email = $8, source = $9, campaign = $10, 
        date_received = $11, priority = $12, notes = $13, follow_up_date = $14, status = $15, incentive = $16, closing_amount = $17
      RETURNING *;
    `;
    const values = [
      lead.id, lead.name, lead.company, lead.industry, lead.country, lead.phone, lead.whatsapp, lead.email, lead.source, lead.campaign, 
      lead.dateReceived, lead.priority, lead.notes, lead.followUpDate, lead.status, lead.incentive, lead.closingAmount || 0
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Meetings API ---
app.get('/api/meetings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meetings ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meetings', async (req, res) => {
  const meeting = req.body;
  try {
    const query = `
      INSERT INTO meetings (id, lead_id, date, type, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        lead_id = $2, date = $3, type = $4, status = $5, notes = $6
      RETURNING *;
    `;
    const values = [meeting.id, meeting.leadId, meeting.date, meeting.type, meeting.status, meeting.notes];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Audits API ---
app.get('/api/audits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audits ORDER BY requested_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audits', async (req, res) => {
  const audit = req.body;
  try {
    const query = `
      INSERT INTO audits (id, lead_id, requested_date, completed_date, status, type)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        lead_id = $2, requested_date = $3, completed_date = $4, status = $5, type = $6
      RETURNING *;
    `;
    const values = [audit.id, audit.leadId, audit.requestedDate, audit.completedDate, audit.status, audit.type];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Activity API ---
app.get('/api/activity', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_activity ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activity', async (req, res) => {
  const { date, ...stats } = req.body;
  try {
    const query = `
      INSERT INTO daily_activity (date, leads_contacted, calls, messages, meetings_booked, followups_done)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (date) DO UPDATE SET
        leads_contacted = $2, calls = $3, messages = $4, meetings_booked = $5, followups_done = $6
      RETURNING *;
    `;
    const values = [date, stats.leadsContacted, stats.calls, stats.messages, stats.meetingsBooked, stats.followupsDone];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Targets API ---
app.get('/api/targets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM targets LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/targets', async (req, res) => {
  const targets = req.body;
  try {
    // For simplicity, always update the first target row or create one
    const check = await pool.query('SELECT id FROM targets LIMIT 1');
    let query;
    let values;
    if (check.rows.length > 0) {
      query = 'UPDATE targets SET daily_calls = $1, daily_leads = $2, weekly_meetings = $3, monthly_meetings = $4, monthly_wins = $5 WHERE id = $6 RETURNING *';
      values = [targets.dailyCalls, targets.dailyLeads, targets.weeklyMeetings, targets.monthlyMeetings, targets.monthlyWins, check.rows[0].id];
    } else {
      query = 'INSERT INTO targets (daily_calls, daily_leads, weekly_meetings, monthly_meetings, monthly_wins) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      values = [targets.dailyCalls, targets.dailyLeads, targets.weeklyMeetings, targets.monthlyMeetings, targets.monthlyWins];
    }
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Profile API ---
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rep_profile LIMIT 1');
    res.json(result.rows[0] || { name: 'Sarah Jenkins', photo: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', async (req, res) => {
  const profile = req.body;
  try {
    const check = await pool.query('SELECT id FROM rep_profile LIMIT 1');
    let query;
    let values;
    if (check.rows.length > 0) {
      query = 'UPDATE rep_profile SET name = $1, photo = $2 WHERE id = $3 RETURNING *';
      values = [profile.name, profile.photo, check.rows[0].id];
    } else {
      query = 'INSERT INTO rep_profile (name, photo) VALUES ($1, $2) RETURNING *';
      values = [profile.name, profile.photo];
    }
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
