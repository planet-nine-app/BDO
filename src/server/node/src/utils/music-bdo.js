// Music BDO Generator - Create BDOs with embedded music players
// Designed for use with AdvanceKey and AdvanceShare via emojicodes

/**
 * Generates an SVG containing an embedded music player
 * @param {Object} musicData - Music track information
 * @param {string} musicData.embedUrl - URL to the music widget (e.g., mirlo, bandcamp, soundcloud)
 * @param {string} musicData.title - Track title
 * @param {string} musicData.artist - Artist name
 * @param {string} musicData.artworkUrl - Album/track artwork URL (optional)
 * @param {number} musicData.width - Player width (default: 800)
 * @param {number} musicData.height - Player height (default: 400)
 * @returns {string} SVG content with embedded player
 */
function generateMusicPlayerSVG(musicData) {
  const {
    embedUrl,
    title = 'Untitled Track',
    artist = 'Unknown Artist',
    artworkUrl = '',
    width = 800,
    height = 400,
    backgroundColor = '#1a1a1a',
    textColor = '#ffffff'
  } = musicData;

  // Calculate dimensions
  const artworkSize = height - 40;
  const playerX = artworkUrl ? artworkSize + 20 : 20;
  const playerWidth = width - playerX - 20;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Dark background -->
  <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="12"/>

  <!-- Track artwork (if provided) -->
  ${artworkUrl ? `
  <image href="${artworkUrl}" x="20" y="20" width="${artworkSize}" height="${artworkSize}" preserveAspectRatio="xMidYMid slice">
    <rect width="${artworkSize}" height="${artworkSize}" fill="#333" rx="8"/>
  </image>
  ` : ''}

  <!-- Track info -->
  <text x="${playerX}" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">
    ${escapeXml(title)}
  </text>
  <text x="${playerX}" y="70" font-family="Arial, sans-serif" font-size="18" fill="#999">
    ${escapeXml(artist)}
  </text>

  <!-- Embedded music player using foreignObject -->
  <foreignObject x="${playerX}" y="90" width="${playerWidth}" height="${height - 110}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
      <iframe
        src="${escapeXml(embedUrl)}"
        style="border: 0; width: 100%; height: 100%; border-radius: 8px;"
        allow="autoplay; fullscreen"
        allowfullscreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      ></iframe>
    </div>
  </foreignObject>

  <!-- Bottom bar with metadata -->
  <rect y="${height - 30}" width="${width}" height="30" fill="rgba(0,0,0,0.3)"/>
  <text x="${width / 2}" y="${height - 10}" font-family="Arial, sans-serif" font-size="12" fill="#666" text-anchor="middle">
    🎵 Shared via Planet Nine BDO Emojicode
  </text>
</svg>`;

  return svg;
}

/**
 * Generates a minimal SVG for mobile/compact view
 */
function generateCompactMusicPlayerSVG(musicData) {
  const {
    embedUrl,
    title = 'Untitled Track',
    artist = 'Unknown Artist',
    width = 400,
    height = 300
  } = musicData;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#1a1a1a" rx="8"/>

  <text x="${width / 2}" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff" text-anchor="middle">
    ${escapeXml(title)}
  </text>
  <text x="${width / 2}" y="55" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle">
    ${escapeXml(artist)}
  </text>

  <foreignObject x="20" y="70" width="${width - 40}" height="${height - 90}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
      <iframe
        src="${escapeXml(embedUrl)}"
        style="border: 0; width: 100%; height: 100%; border-radius: 8px;"
        allow="autoplay"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      ></iframe>
    </div>
  </foreignObject>
</svg>`;

  return svg;
}

/**
 * Creates a complete BDO structure for a music track
 */
function createMusicBDO(musicData, options = {}) {
  const {
    compact = false,
    includeMetadata = true
  } = options;

  const svgContent = compact
    ? generateCompactMusicPlayerSVG(musicData)
    : generateMusicPlayerSVG(musicData);

  const bdo = {
    type: 'music-player',
    svgContent,
    metadata: includeMetadata ? {
      title: musicData.title,
      artist: musicData.artist,
      embedUrl: musicData.embedUrl,
      artworkUrl: musicData.artworkUrl,
      platform: detectPlatform(musicData.embedUrl),
      createdAt: Date.now(),
      version: '1.0.0'
    } : undefined
  };

  return bdo;
}

/**
 * Helper to escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Detect music platform from embed URL
 */
function detectPlatform(embedUrl) {
  if (embedUrl.includes('mirlo.space')) return 'mirlo';
  if (embedUrl.includes('bandcamp.com')) return 'bandcamp';
  if (embedUrl.includes('soundcloud.com')) return 'soundcloud';
  if (embedUrl.includes('spotify.com')) return 'spotify';
  return 'unknown';
}

/**
 * Example usage for mirlo track
 */
function createMirloBDO(trackId, title, artist, options = {}) {
  return createMusicBDO({
    embedUrl: `https://mirlo.space/widget/track/${trackId}`,
    title,
    artist,
    ...options
  }, options);
}

export {
  generateMusicPlayerSVG,
  generateCompactMusicPlayerSVG,
  createMusicBDO,
  createMirloBDO,
  detectPlatform
};
