# Music BDOs - Share Music with Emojicodes

## Overview

Music BDOs allow you to create shareable, playable music tracks using Planet Nine's emojicode system. Each music BDO contains an SVG with an embedded music player (Mirlo, Bandcamp, SoundCloud, Spotify, etc.) and automatically receives an 8-emoji shortcode for easy sharing.

## Key Features

- 🎵 **Embedded Players**: Support for multiple music platforms (Mirlo, Bandcamp, SoundCloud, Spotify)
- 😀 **Emojicode Sharing**: Each track gets a memorable 8-emoji code
- 📱 **AdvanceKey Integration**: Type emojicodes in iOS keyboard to share music
- 🔗 **AdvanceShare Ready**: Share music across Planet Nine apps
- 🎨 **SVG-Based**: Customizable player appearance with metadata
- 🔒 **Public BDOs**: Automatically shareable with anyone who has the emojicode

## Architecture

```
┌─────────────────────┐
│  Music Platform     │
│  (Mirlo, etc.)      │
└──────────┬──────────┘
           │ Embed URL
           ▼
┌─────────────────────┐
│  SVG Generator      │
│  (music-bdo.js)     │
└──────────┬──────────┘
           │ SVG with foreignObject
           ▼
┌─────────────────────┐
│  BDO Service        │
│  (Save + Emojicode) │
└──────────┬──────────┘
           │ Automatic assignment
           ▼
┌─────────────────────┐
│  Emojicode          │
│  🌍🔑💎🎵🎸🎹🎺🎻   │
└─────────────────────┘
```

## Quick Start

### 1. Create a Music BDO

```bash
cd bdo/examples
node create-music-bdo.js create
```

### 2. Use the Emojicode

The script outputs an emojicode like: `🌍🔑💎🎵🎸🎹🎺🎻`

### 3. Share via AdvanceKey

- Open AdvanceKey on iOS
- Type or paste the emojicode
- AdvanceKey renders the music player
- Share in messages, notes, or any app

## Creating Music BDOs Programmatically

### Mirlo Track

```javascript
import { createMirloBDO } from './src/utils/music-bdo.js';

const musicBDO = createMirloBDO(
  '12216',              // Track ID from mirlo.space/widget/track/12216
  'Track Title',
  'Artist Name',
  {
    artworkUrl: 'https://example.com/artwork.jpg',
    width: 800,
    height: 400
  }
);

// Save to BDO service (auto-assigns emojicode)
const response = await bdoService.putBDO(userUUID, musicBDO, hash, pubKey);
```

### Bandcamp Track

```javascript
import { createMusicBDO } from './src/utils/music-bdo.js';

const musicBDO = createMusicBDO({
  embedUrl: 'https://bandcamp.com/EmbeddedPlayer/track=1234567890',
  title: 'My Track',
  artist: 'My Band',
  artworkUrl: 'https://example.com/cover.jpg',
  width: 700,
  height: 300
});
```

### SoundCloud Track

```javascript
const musicBDO = createMusicBDO({
  embedUrl: 'https://w.soundcloud.com/player/?url=...',
  title: 'SoundCloud Track',
  artist: 'Artist',
  width: 600,
  height: 250
}, { compact: true });  // Use compact layout
```

## SVG Structure

Music BDOs generate SVG content with:

### Standard Layout (800x400)

```svg
<svg width="800" height="400">
  <!-- Dark background with rounded corners -->
  <rect fill="#1a1a1a" rx="12"/>

  <!-- Album artwork (if provided) -->
  <image href="artwork.jpg" x="20" y="20"/>

  <!-- Track title and artist -->
  <text>Track Title</text>
  <text>Artist Name</text>

  <!-- Embedded player via foreignObject -->
  <foreignObject>
    <iframe src="https://mirlo.space/widget/track/12216"/>
  </foreignObject>

  <!-- Footer with emojicode indicator -->
  <text>🎵 Shared via Planet Nine BDO Emojicode</text>
</svg>
```

### Compact Layout (400x300)

Optimized for mobile/smaller displays:
- No artwork
- Centered title/artist
- Full-width player

## BDO Structure

```javascript
{
  "type": "music-player",
  "svgContent": "<svg>...</svg>",
  "metadata": {
    "title": "Track Title",
    "artist": "Artist Name",
    "embedUrl": "https://mirlo.space/widget/track/12216",
    "artworkUrl": "https://example.com/art.jpg",
    "platform": "mirlo",
    "createdAt": 1697040000000,
    "version": "1.0.0"
  }
}
```

## Retrieval Methods

### 1. Direct Emojicode Endpoint

```bash
GET /emoji/🌍🔑💎🎵🎸🎹🎺🎻

Response:
{
  "emojicode": "🌍🔑💎🎵🎸🎹🎺🎻",
  "pubKey": "02a1b2c3...",
  "bdo": {
    "type": "music-player",
    "svgContent": "<svg>...</svg>",
    "metadata": { ... }
  },
  "createdAt": 1697040000000
}
```

### 2. Query Parameter

```bash
GET /user/:uuid/bdo?timestamp=...&hash=...&signature=...&emojicode=🌍🔑💎🎵🎸🎹🎺🎻
```

### 3. Reverse Lookup

```bash
GET /pubkey/02a1b2c3.../emojicode

Response:
{
  "pubKey": "02a1b2c3...",
  "emojicode": "🌍🔑💎🎵🎸🎹🎺🎻",
  "createdAt": 1697040000000
}
```

## Integration with AdvanceKey

### Detecting Music Emojicodes

AdvanceKey can detect music BDOs by:

1. **Emojicode Pattern**: Look for 8-emoji sequences
2. **BDO Type Check**: Fetch BDO and check `type: "music-player"`
3. **Render SVG**: Display the SVG content inline

### Rendering Flow

```swift
// In AdvanceKey
1. User types emojicode: 🌍🔑💎🎵🎸🎹🎺🎻
2. AdvanceKey detects 8-emoji pattern
3. Fetch BDO: GET /emoji/{emojicode}
4. Check bdo.type === "music-player"
5. Render bdo.svgContent in WKWebView
6. User can play music inline
```

### Example Swift Integration

```swift
func handleEmojicode(_ emojicode: String) async {
    guard isValidEmojicode(emojicode) else { return }

    let bdoURL = "http://localhost:3003/emoji/\(emojicode.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed)!)"

    guard let url = URL(string: bdoURL) else { return }
    let (data, _) = try await URLSession.shared.data(from: url)

    let bdoResponse = try JSONDecoder().decode(BDOResponse.self, from: data)

    if bdoResponse.bdo.type == "music-player" {
        // Render SVG in web view
        let svgHTML = """
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0;">
            \(bdoResponse.bdo.svgContent)
        </body>
        </html>
        """
        webView.loadHTMLString(svgHTML, baseURL: nil)
    }
}
```

## Integration with AdvanceShare

### Sharing Music

```swift
// Share a music emojicode
let emojicode = "🌍🔑💎🎵🎸🎹🎺🎻"
let shareText = "Check out this track: \(emojicode)"

let activityVC = UIActivityViewController(
    activityItems: [shareText],
    applicationActivities: nil
)
```

### Receiving Music

When AdvanceShare receives an emojicode:
1. Detect 8-emoji pattern
2. Fetch BDO metadata
3. Show preview with title/artist
4. Offer to play inline or open in music app

## Supported Platforms

### Mirlo
- **Embed URL**: `https://mirlo.space/widget/track/{trackId}`
- **Features**: Open-source, artist-friendly
- **Recommended**: Yes

### Bandcamp
- **Embed URL**: `https://bandcamp.com/EmbeddedPlayer/track={trackId}`
- **Features**: Widely used, good embeds
- **Recommended**: Yes

### SoundCloud
- **Embed URL**: `https://w.soundcloud.com/player/?url=...`
- **Features**: Popular platform
- **Note**: May require API key

### Spotify
- **Embed URL**: `https://open.spotify.com/embed/track/{trackId}`
- **Features**: Largest catalog
- **Note**: Requires Spotify account for playback

## Security Considerations

### iframe Sandbox

All embedded players use strict sandboxing:

```html
<iframe
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
  allow="autoplay"
  src="...">
</iframe>
```

### Permissions

- `allow-same-origin`: Required for audio playback
- `allow-scripts`: Required for player controls
- `allow-popups`: For platform links
- `allow-forms`: For login flows

### Content Security

- All embed URLs are validated
- XML special characters are escaped
- No arbitrary JavaScript execution in SVG

## Customization Options

### Player Size

```javascript
{
  width: 800,   // Standard: 800, Compact: 400
  height: 400   // Standard: 400, Compact: 300
}
```

### Colors

```javascript
{
  backgroundColor: '#1a1a1a',  // Dark theme
  textColor: '#ffffff'         // White text
}
```

### Layout

```javascript
{
  compact: true  // Use compact layout for mobile
}
```

## Examples

### Create and Share

```javascript
// 1. Create music BDO
const musicBDO = createMirloBDO('12216', 'Great Song', 'Amazing Artist');

// 2. Save to BDO service (auto-assigns emojicode)
await bdoService.save(musicBDO, { public: true });

// 3. Get emojicode
const emojicode = await bdoService.getEmojicode(pubKey);
// Returns: 🌍🔑💎🎵🎸🎹🎺🎻

// 4. Share via AdvanceKey
// User types: 🌍🔑💎🎵🎸🎹🎺🎻
// Music plays inline!
```

### Retrieve and Play

```javascript
// User receives emojicode: 🌍🔑💎🎵🎸🎹🎺🎻

// Fetch BDO
const response = await fetch(`/emoji/${encodeURIComponent(emojicode)}`);
const data = await response.json();

// Render SVG
document.body.innerHTML = data.bdo.svgContent;

// Music is now playable!
```

## Best Practices

### 1. Always Include Metadata

```javascript
{
  title: 'Track Title',      // Required
  artist: 'Artist Name',     // Required
  embedUrl: '...',           // Required
  artworkUrl: '...',         // Recommended
  platform: 'mirlo'          // Auto-detected
}
```

### 2. Choose Appropriate Dimensions

- **Desktop/Web**: 800x400
- **Mobile**: 400x300 (compact mode)
- **Inline Messages**: 600x250

### 3. Test Across Platforms

- Verify iframe embeds work in target environment
- Test audio playback in iOS/Android
- Ensure sandbox permissions are sufficient

### 4. Provide Fallback

```javascript
// Include platform link in metadata
{
  metadata: {
    platformUrl: 'https://mirlo.space/artist/track',
    embedUrl: 'https://mirlo.space/widget/track/12216'
  }
}
```

## Troubleshooting

### Player Doesn't Load

- **Check embed URL**: Verify the URL is accessible
- **Check sandbox**: Ensure proper permissions
- **Check platform**: Some platforms require authentication

### Audio Doesn't Play

- **iOS**: Requires user interaction before autoplay
- **Sandbox**: Verify `allow-same-origin` is set
- **Platform**: Check if platform supports anonymous playback

### SVG Doesn't Render

- **foreignObject**: Ensure proper xmlns namespace
- **XML Escaping**: Verify all special characters are escaped
- **Dimensions**: Check width/height are valid numbers

## Future Enhancements

- [ ] Playlist support (multiple tracks)
- [ ] Audio visualization in SVG
- [ ] Download/save functionality
- [ ] Collaborative playlists via emojicodes
- [ ] Integration with Planet Nine music discovery
- [ ] Native audio player (no iframe dependency)

---

**Music BDOs** bring the power of Planet Nine's emojicode system to music sharing - making it as easy as sharing a few emoji! 🎵🌍🔑💎
