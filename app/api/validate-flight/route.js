export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const response = await fetch("https://<project-ref>.functions.supabase.co/validate-flight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error calling Edge Function" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
