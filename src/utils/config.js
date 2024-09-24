import { readFile } from "fs/promises";

// Load the configuration file
export async function loadConfig(configPath) {
  try {
    if (configPath.endsWith(".json")) {
      const configContent = await readFile(configPath, "utf-8");
      return JSON.parse(configContent); // For JSON config files
    } else {
      return await import(path.resolve(configPath)); // For JavaScript files
    }
  } catch (error) {
    console.error("Error loading configuration file:", error);
    process.exit(1);
  }
}
