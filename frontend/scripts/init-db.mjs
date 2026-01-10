/**
 * Database Initialization Script for Better Auth
 *
 * This script creates all required tables for Better Auth with email/password + JWT plugin.
 * Run with: node scripts/init-db.mjs
 */

import pg from 'pg';
import { readFileSync } from 'fs';

// Parse .env.local manually
function loadEnv(filepath) {
  try {
    const content = readFileSync(filepath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim();
          const value = trimmed.slice(eqIndex + 1).trim();
          process.env[key] = value;
        }
      }
    });
  } catch (e) {
    console.error('Could not read .env.local:', e.message);
  }
}

loadEnv('.env.local');

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set in .env.local');
  process.exit(1);
}

console.log('Connecting to database...');
console.log('URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const SCHEMA_SQL = `
-- =============================================
-- BETTER AUTH COMPLETE SCHEMA FOR POSTGRESQL
-- Required for: email/password + JWT plugin
-- =============================================

-- 1. User table (core)
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT NOT NULL,
    image TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Session table (core)
CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);

-- 3. Account table (for email/password credentials)
CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "providerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_provider ON "account"("providerId", "accountId");

-- 4. Verification table (email verification tokens)
CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);

-- 5. JWKS table (JWT plugin)
CREATE TABLE IF NOT EXISTS "jwks" (
    id TEXT PRIMARY KEY,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    alg TEXT,
    crv TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMP WITH TIME ZONE
);
`;

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log('\nConnected successfully!\n');

    // First, check existing tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('Existing tables in public schema:');
    if (tablesResult.rows.length === 0) {
      console.log('  (none)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    console.log('');

    // Run the schema creation
    console.log('Creating Better Auth tables...\n');
    await client.query(SCHEMA_SQL);

    // Verify tables were created
    const verifyResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'session', 'account', 'verification', 'jwks')
      ORDER BY table_name;
    `);

    console.log('Better Auth tables now present:');
    const expectedTables = ['user', 'session', 'account', 'verification', 'jwks'];
    const presentTables = verifyResult.rows.map(r => r.table_name);

    expectedTables.forEach(table => {
      const present = presentTables.includes(table);
      console.log(`  ${present ? '✓' : '✗'} ${table}`);
    });

    // Check jwks specifically
    const jwksCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'jwks' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('\njwks table columns:');
    jwksCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n✓ Database initialization complete!');
    console.log('\nYou can now restart the Next.js dev server.');

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.code) {
      console.error('PostgreSQL error code:', error.code);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
