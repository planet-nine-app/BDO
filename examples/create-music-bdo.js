#!/usr/bin/env node

/**
 * Example: Create a Music BDO with Emojicode
 *
 * This script demonstrates how to:
 * 1. Create a BDO containing a music player
 * 2. Automatically receive an emojicode
 * 3. Share the music via AdvanceKey/AdvanceShare using the emojicode
 */

import { createMirloBDO, createMusicBDO } from '../src/server/node/src/utils/music-bdo.js';
import sessionless from 'sessionless-node';
import fetch from 'node-fetch';

const BDO_SERVICE_URL = process.env.BDO_URL || 'http://localhost:3003';

// Example: Create a BDO for a Mirlo track
async function createAndShareMusicTrack() {
  console.log('🎵 Creating Music BDO with Emojicode...\n');

  // Step 1: Create BDO data with music player SVG
  const musicBDO = createMirloBDO(
    '12216',  // Mirlo track ID
    'Your Track Title',
    'Your Artist Name',
    {
      artworkUrl: 'https://example.com/artwork.jpg',  // Optional
      width: 800,
      height: 400
    }
  );

  console.log('📦 Generated BDO structure:');
  console.log('  - Type:', musicBDO.type);
  console.log('  - Platform:', musicBDO.metadata.platform);
  console.log('  - SVG Content:', musicBDO.svgContent.length, 'characters');
  console.log('');

  // Step 2: Generate sessionless keys
  let keys;
  const saveKeys = (k) => { keys = k; };
  const getKeys = () => keys;
  await sessionless.generateKeys(saveKeys, getKeys);

  console.log('🔑 Generated keys:');
  console.log('  - Public Key:', keys.pubKey.substring(0, 20) + '...');
  console.log('');

  // Step 3: Save BDO to BDO service (this will auto-assign emojicode)
  const timestamp = Date.now();
  const userUUID = sessionless.generateUUID();
  const hash = 'music-bdo-' + Date.now();

  // Create user first
  const createUserPayload = {
    timestamp,
    hash,
    pubKey: keys.pubKey,
    signature: sessionless.sign(`${timestamp}${hash}${keys.pubKey}`),
    bdo: musicBDO,
    public: true  // Make it public to get emojicode
  };

  console.log('📤 Saving BDO to service...');
  const createResponse = await fetch(`${BDO_SERVICE_URL}/user/create`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createUserPayload)
  });

  const userData = await createResponse.json();
  console.log('✅ User created:', userData.uuid);
  console.log('');

  // Step 4: Retrieve the emojicode
  console.log('🔍 Fetching emojicode...');
  const emojicodeResponse = await fetch(`${BDO_SERVICE_URL}/pubkey/${keys.pubKey}/emojicode`);

  if (emojicodeResponse.ok) {
    const emojicodeData = await emojicodeResponse.json();

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🎉 SUCCESS! Your music track has an emojicode:');
    console.log('');
    console.log('  📱 Emojicode:', emojicodeData.emojicode);
    console.log('  🔑 Public Key:', emojicodeData.pubKey.substring(0, 30) + '...');
    console.log('  🕐 Created:', new Date(emojicodeData.createdAt).toISOString());
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('📲 How to share:');
    console.log('');
    console.log('1. Via AdvanceKey:');
    console.log(`   - Type: ${emojicodeData.emojicode}`);
    console.log('   - AdvanceKey will detect and render the music player');
    console.log('');
    console.log('2. Via AdvanceShare:');
    console.log(`   - Share emojicode: ${emojicodeData.emojicode}`);
    console.log('   - Recipients can paste into any Planet Nine app');
    console.log('');
    console.log('3. Via URL:');
    console.log(`   - Direct: ${BDO_SERVICE_URL}/emoji/${encodeURIComponent(emojicodeData.emojicode)}`);
    console.log('');
    console.log('4. Via Query Param:');
    console.log(`   - GET /user/:uuid/bdo?emojicode=${encodeURIComponent(emojicodeData.emojicode)}`);
    console.log('');

    return {
      uuid: userData.uuid,
      emojicode: emojicodeData.emojicode,
      pubKey: keys.pubKey,
      bdo: musicBDO
    };
  } else {
    console.error('❌ Failed to retrieve emojicode:', emojicodeResponse.status);
    return null;
  }
}

// Example: Retrieve and display a music BDO by emojicode
async function playMusicByEmojicode(emojicode) {
  console.log(`\n🎵 Retrieving music track by emojicode: ${emojicode}\n`);

  const response = await fetch(`${BDO_SERVICE_URL}/emoji/${encodeURIComponent(emojicode)}`);

  if (response.ok) {
    const data = await response.json();

    console.log('✅ Track found:');
    console.log('  - Title:', data.bdo.metadata?.title || 'Unknown');
    console.log('  - Artist:', data.bdo.metadata?.artist || 'Unknown');
    console.log('  - Platform:', data.bdo.metadata?.platform || 'Unknown');
    console.log('  - Emojicode:', data.emojicode);
    console.log('');
    console.log('💾 SVG Content available - ready to render in AdvanceKey/AdvanceShare');

    return data;
  } else {
    console.error('❌ Track not found');
    return null;
  }
}

// Example: Alternative platforms
function exampleBandcampBDO() {
  return createMusicBDO({
    embedUrl: 'https://bandcamp.com/EmbeddedPlayer/track=1234567890',
    title: 'Bandcamp Track',
    artist: 'Some Artist',
    width: 700,
    height: 300
  });
}

function exampleSoundCloudBDO() {
  return createMusicBDO({
    embedUrl: 'https://w.soundcloud.com/player/?url=...',
    title: 'SoundCloud Track',
    artist: 'Some Artist',
    width: 600,
    height: 250
  }, { compact: true });
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args[0] === 'create') {
    createAndShareMusicTrack().catch(console.error);
  } else if (args[0] === 'play' && args[1]) {
    playMusicByEmojicode(args[1]).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node create-music-bdo.js create          # Create new music BDO');
    console.log('  node create-music-bdo.js play <emoji>    # Play existing music BDO');
  }
}

export { createAndShareMusicTrack, playMusicByEmojicode };
