function sanitizeStructure(structure: Record<string, any[]>): string {
  return `
ESTRUCTURA DEL CÓDIGO:
- Funciones (${structure.functions.length}):
  ${structure.functions
    .map((f) => `  • ${f.name}${f.params || ""}`)
    .join("\n  ")}

- Clases (${structure.classes.length}):
  ${structure.classes.map((c) => `  • ${c}`).join("\n  ")}

- Componentes (${structure.components.length}):
  ${structure.components.map((c) => `  • ${c}`).join("\n  ")}

- Importaciones (${structure.imports.length}):
  ${structure.imports.slice(0, 5).join("\n  ")}

- Exportaciones (${structure.exports.length}):
  ${structure.exports.slice(0, 3).join("\n  ")}
  `.trim();
}

export async function getDescriptionFile(code: Record<string, any>) {
  const structure = sanitizeStructure(code);

  const res = await fetch(`${process.env.API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que genera descripciones de código fuente de forma breve, clara y útil. No inventes cosas, solo explica qué hace el código.",
        },
        {
          role: "user",
          content: `Dame una descripción breve y consisa de lo siguiente:\n\n${structure}`,
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error("Error generating description");

  const json = await res.json();
  return json.choices[0].message.content;
}
