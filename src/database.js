import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = join(__dirname, 'processedChallenges.json');
const DISCORD_USERS = join(__dirname, 'discordUsers.json');

export function getProcessedChallenges(id) {
  let processedChallenges = new Map();
  if (existsSync(DATA_FILE)) {
    const data = readFileSync(DATA_FILE, 'utf8');
    processedChallenges = new Map(JSON.parse(data));
  }
  return processedChallenges.get(id);
}

export function setProcessedChallenges(id, challenge) {
  let processedChallenges = new Map();
  if (existsSync(DATA_FILE)) {
    const data = readFileSync(DATA_FILE, 'utf8');
    processedChallenges = new Map(JSON.parse(data));
  }
  processedChallenges.set(id, challenge);
  const data = JSON.stringify(Array.from(processedChallenges.entries()), null, 2);
  writeFileSync(DATA_FILE, data);
}

export function getDiscordUsers() {
  let discordUsers = {};
  if (existsSync(DISCORD_USERS)) {
    const data = readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  return discordUsers;
}

export function setDiscordUsers(user) {
  let discordUsers = {};
  if (existsSync(DISCORD_USERS)) {
    const data = readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  discordUsers[user] = true;
  const data = JSON.stringify(discordUsers, null, 2);
  writeFileSync(DATA_FILE, data);
}
export function checkDiscordUserExists(user) {
  let discordUsers = {};
  if (existsSync(DISCORD_USERS)) {
    const data = readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  return discordUsers[user] ? true : false;
}