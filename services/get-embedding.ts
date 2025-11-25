export async function getEmbedding(text: string) {
  const res = await fetch(`${process.env.API_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: [text],
    }),
  });

  if (!res.ok) {
    throw new Error("Error generating embedding");
  }

  const data = await res.json();
  return data.data[0].embedding;
}
