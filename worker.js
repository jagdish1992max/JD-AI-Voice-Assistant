export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "https://jagdish1992max.github.io",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "JD AI Worker is online" }),
        { headers: cors }
      );
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: cors }
      );
    }

    try {
      if (!env.GEMINI_API_KEY) {
        throw new Error("Gemini API secret is missing");
      }

      const body = await request.json();
      const message = String(body.message || "").trim();

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message is empty" }),
          { status: 400, headers: cors }
        );
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: message }]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: data.error?.message || "Gemini API failed" }),
          { status: response.status, headers: cors }
        );
      }

      const reply = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim() || "Mujhe jawab nahi mila.";

      return new Response(
        JSON.stringify({ reply }),
        { headers: cors }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message || "Server error" }),
        { status: 500, headers: cors }
      );
    }
  }
};
