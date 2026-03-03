export default async function handler(req, res) {
  // Query parameters se orientation aur baki cheezein nikalna
  const { query, page, orientation } = req.query;
  const API_KEY = process.env.PEXELS_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API Key is missing in Environment Variables" });
  }

  try {
    // Pexels API ko orientation parameter ke saath call karna
    // Isse Desktop ke liye horizontal aur Mobile ke liye vertical images milenge
    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=18&page=${page || 1}&orientation=${orientation || 'landscape'}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: API_KEY,
      },
    });

    const data = await response.json();
    
    // Security: Client ko sirf data bhej rahe hain, API KEY nahi
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to Pexels Server" });
  }
}
