#!/usr/bin/env node

/**
 * Script to sync NEXT_PUBLIC_* environment variables from root .env to client/.env.local
 * Run this script whenever you update the root .env file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootEnvPath = path.resolve(__dirname, '../.env');
const clientEnvPath = path.resolve(__dirname, '../client/.env.local');

// Read root .env file
const rootEnv = dotenv.config({ path: rootEnvPath });

if (rootEnv.error) {
  console.error('Error reading root .env file:', rootEnv.error);
  process.exit(1);
}

// Extract NEXT_PUBLIC_* variables
const nextPublicEntries = Object.entries(rootEnv.parsed || {})
  .filter(([key]) => key.startsWith('NEXT_PUBLIC_'));

if (nextPublicEntries.length === 0) {
  console.warn('⚠️  No NEXT_PUBLIC_* variables found in root .env file');
  console.warn('   Frontend may not work correctly without NEXT_PUBLIC_API_URL');
}

const nextPublicVars = nextPublicEntries
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write to client/.env.local
try {
  const content = nextPublicVars ? nextPublicVars + '\n' : '';
  fs.writeFileSync(clientEnvPath, content, 'utf8');
  console.log('✅ Successfully synced NEXT_PUBLIC_* variables to client/.env.local');
  console.log(`   Found ${nextPublicEntries.length} variable(s)`);
  if (nextPublicEntries.length > 0) {
    console.log(`   Variables: ${nextPublicEntries.map(([key]) => key).join(', ')}`);
  }
} catch (error) {
  console.error('Error writing client/.env.local:', error);
  process.exit(1);
}

