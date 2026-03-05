export default async function handler(req, res) {
  // Vercel Environment Variable se key nikalna
  const API_KEY = process.env.PEXELS_API_KEY;

  // Query parameters lena (URL se)
  const { query, page = 1, orientation = 'landscape' } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: "API Key not configured in Vercel" });
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&page=${page}&per_page=20&orientation=${orientation}`,
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    const data = await response.json();
    
    // Success response
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from Pexels" });
  }
}
