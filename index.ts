import fs from "node:fs/promises";
import path from "node:path";

import Parser from "tree-sitter";
import Typescript from "tree-sitter-typescript";
import JavaScript from "tree-sitter-javascript";
import { getDescriptionFile } from "./services/get-description-file.ts";
import { getEmbedding } from "./services/get-embedding.ts";
import { getStructureFile } from "./utils/get-structure-file.ts";

import { Index } from "@upstash/vector";

import { v4 as uuid } from "uuid";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
});

const PATH = "./cal.com";

const EXTENSIONS_AVAILABLE = {
  ".js": JavaScript,
  ".jsx": JavaScript,
  ".ts": Typescript.typescript,
  ".tsx": Typescript.tsx,
} as const;

export const init = async () => {
  const entries = (await fs.readdir(PATH, { recursive: true })).filter(
    (entry) => /\.(json|tsx|ts|js|jsx)$/.test(entry)
  );

  for await (const entry of entries) {
    const parser = new Parser();

    const ext = path.extname(entry);
    const lang = EXTENSIONS_AVAILABLE[ext as keyof typeof EXTENSIONS_AVAILABLE];

    parser.setLanguage(lang as unknown as Parser.Language);

    const BASE_PATH = path.resolve(`${process.cwd()}/cal.com/`, entry);

    try {
      const sourceCode = await fs.readFile(BASE_PATH, "utf-8");

      const tree = parser.parse(sourceCode);

      const structure = getStructureFile({ tree });

      const description = await getDescriptionFile(structure);

      console.log("se genero una descripcion para ", entry);

      const embeddings = await getEmbedding(description);

      console.log("se genero un embedding para ", entry);

      await index.upsert({
        id: uuid(),
        vector: embeddings,
        metadata: {
          url: entry,
          description,
        },
      });

      console.log("se guardo en upstash para ", entry);
    } catch (error) {
      console.log(error);
    }
  }
};

// await init();
