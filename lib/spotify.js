const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const SCOPES = [
  "user-read-recently-played",
  "user-top-read",
  "user-read-email",
  "user-read-private",
].join(" ");

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const creds = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json(); // { access_token, refresh_token, expires_in }
}

export async function getRecentlyPlayed(accessToken, limit = 20) {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  const data = await res.json();

  // Deduplicate by track id (recently played can have duplicates)
  const seen = new Set();
  const tracks = [];
  for (const item of data.items) {
    const t = item.track;
    if (!seen.has(t.id)) {
      seen.add(t.id);
      tracks.push({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        albumArt: t.album.images[0]?.url || null,
        album: t.album.name,
        spotifyLink: t.external_urls.spotify,
      });
    }
  }

  return tracks;
}
