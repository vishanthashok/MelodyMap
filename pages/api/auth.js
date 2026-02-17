import { exchangeCodeForToken } from "../../lib/spotify";

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    // In production, store tokens securely (e.g., encrypted cookie or session)
    // For this demo we pass via query param (use encrypted cookies in production)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return res.redirect(
      `${baseUrl}/playlist?access_token=${encodeURIComponent(
        tokens.access_token
      )}`
    );
  } catch (err) {
    console.error("Auth error:", err);
    return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
  }
}
