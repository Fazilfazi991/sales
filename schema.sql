-- Neon Database Schema for SALEX

-- Leads Table
CREATE TABLE leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    industry TEXT,
    country TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    source TEXT,
    campaign TEXT,
    date_received DATE,
    priority TEXT,
    notes TEXT,
    follow_up_date DATE,
    status TEXT,
    incentive TEXT,
    closing_amount NUMERIC
);

-- Meetings Table
CREATE TABLE meetings (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    type TEXT,
    status TEXT,
    notes TEXT
);

-- Audits Table
CREATE TABLE audits (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
    requested_date DATE,
    completed_date DATE,
    status TEXT,
    type TEXT
);

-- Daily Activity / Attendance Table
CREATE TABLE daily_activity (
    date DATE PRIMARY KEY,
    leads_contacted INTEGER DEFAULT 0,
    calls INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    meetings_booked INTEGER DEFAULT 0,
    followups_done INTEGER DEFAULT 0
);

-- Login Sessions Table
CREATE TABLE login_sessions (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    date DATE,
    login_time TIMESTAMP,
    logout_time TIMESTAMP,
    hours_worked NUMERIC
);

-- Targets Table
CREATE TABLE targets (
    id SERIAL PRIMARY KEY,
    daily_calls INTEGER,
    daily_leads INTEGER,
    weekly_meetings INTEGER,
    monthly_meetings INTEGER,
    monthly_wins INTEGER
);

-- Rep Profile Table
CREATE TABLE rep_profile (
    id SERIAL PRIMARY KEY,
    name TEXT,
    photo TEXT
);
