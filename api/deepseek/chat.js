import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  try {
    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error);

    return res.status(500).json({
      error: "DeepSeek API Error",
    });
  }
}