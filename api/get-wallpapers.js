export default async function handler(req, res) {
    // 1. Parameters nikalna (Query, Orientation, Page)
    // Default values: query='4k wallpaper', per_page=40
    const { 
        query = '4k wallpaper', 
        orientation = 'landscape', 
        page = 1 
    } = req.query;

    const API_KEY = process.env.PEXELS_API_KEY;

    // 2. Security Check: Agar API Key nahi hai toh error dein
    if (!API_KEY) {
        return res.status(500).json({ error: "Pexels API Key is missing in Vercel settings" });
    }

    try {
        // 3. Pexels API ko call karna (Smart Parameters ke saath)
        const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=40&page=${page}&orientation=${orientation}`;

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: API_KEY,
            },
        });

        // 4. Data check karna
        if (!response.ok) {
            throw new Error(`Pexels API responded with ${response.status}`);
        }

        const data = await response.json();
        
        // 5. Success Response
        res.status(200).json(data);
    } catch (error) {
        console.error("API Route Error:", error);
        res.status(500).json({ error: "Failed to fetch wallpapers from Pexels" });
    }
}
