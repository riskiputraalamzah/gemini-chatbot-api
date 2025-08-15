export default function handler(req, res) {
  // Simple health check for Vercel function routing
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, now: new Date().toISOString() });
  }
  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: "Method Not Allowed" });
}
