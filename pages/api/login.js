import { getAuthUrl } from "../../lib/spotify";

export default function handler(req, res) {
  const url = getAuthUrl();
  res.redirect(url);
}
