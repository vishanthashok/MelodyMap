import { getRecentlyPlayed } from "../../lib/spotify";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const tracks = await getRecentlyPlayed(accessToken);
    return res.status(200).json({ tracks });
  } catch (err) {
    console.error("Spotify fetch error:", err);
    if (err.message.includes("401")) {
      return res.status(401).json({ error: "Spotify token expired. Please log in again." });
    }
    return res.status(500).json({ error: "Failed to fetch Spotify data" });
  }
}
