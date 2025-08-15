export default function handler(req, res) {
  const info = {
    ok: true,
    now: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  };
  res.status(200).json(info);
}
