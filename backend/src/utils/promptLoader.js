import { readFile } from "node:fs/promises";
import path from "node:path";

const promptCache = new Map();

const getRepoRoot = () => {
  const cwd = process.cwd();
  return path.basename(cwd).toLowerCase() === "backend" ? path.resolve(cwd, "..") : cwd;
};

export const loadPrompt = async (filename, fallback = "") => {
  if (promptCache.has(filename)) {
    return promptCache.get(filename);
  }

  const filePath = path.resolve(getRepoRoot(), filename);

  try {
    const content = await readFile(filePath, "utf8");
    promptCache.set(filename, content);
    return content;
  } catch {
    promptCache.set(filename, fallback);
    return fallback;
  }
};
