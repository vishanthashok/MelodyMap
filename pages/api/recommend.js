import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { songs } = req.body;

  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    return res.status(400).json({ error: "Please provide a list of songs" });
  }

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({ error: "Claude API key not configured" });
  }

  const songList = songs
    .map((s) => `${s.name} - ${s.artist}`)
    .join("\n");

  const prompt = `Here is a list of songs the user has recently listened to:
${songList}

Please generate a list of 10-15 new song recommendations that match the style, vibe, and energy of these songs.

Rules:
- Return ONLY a valid JSON array, no other text, no markdown, no explanation
- Each object must have: "name" (string), "artist" (string), "reason" (1 short sentence why it matches the vibe)
- Do NOT include duplicates of the user's previous songs
- Only include real songs that exist on mainstream music platforms
- Match the energy, tempo, and emotional tone of the input songs

Format:
[
  {"name": "Song Name", "artist": "Artist Name", "reason": "Short vibe explanation"},
  ...
]`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText = message.content[0].text.trim();

    // Strip any accidental markdown fences
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let recommendations;
    try {
      recommendations = JSON.parse(jsonText);
    } catch {
      console.error("JSON parse error, raw response:", rawText);
      return res.status(502).json({
        error: "AI returned malformed response. Please try again.",
      });
    }

    // Add placeholder spotify search links
    const enriched = recommendations.map((song) => ({
      ...song,
      spotifyLink: `https://open.spotify.com/search/${encodeURIComponent(
        song.name + " " + song.artist
      )}`,
    }));

    return res.status(200).json({ recommendations: enriched });
  } catch (err) {
    console.error("Claude API error:", err);

    if (err.status === 429) {
      return res
        .status(429)
        .json({ error: "Rate limit reached. Please wait a moment and try again." });
    }
    if (err.status === 401) {
      return res.status(401).json({ error: "Invalid Claude API key" });
    }

    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
