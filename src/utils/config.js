import { readFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url"; // To convert to file:// URL

// Load the configuration file
export default async function loadConfig(configPath) {
  try {
    // Handle JSON config files
    if (configPath.endsWith(".json")) {
      const configContent = await readFile(configPath, "utf-8");
      return JSON.parse(configContent); // For JSON config files
    } else {
      // Handle JavaScript config files
      const fileURL = pathToFileURL(path.resolve(configPath)); // Convert path to file:// URL
      return await import(fileURL.href); // Use the .href for import
    }
  } catch (error) {
    console.error("Error loading configuration file:", error);
    process.exit(1);
  }
}
