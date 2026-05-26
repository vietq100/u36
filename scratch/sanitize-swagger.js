import fs from "fs";
import path from "path";
import axios from "axios";

const SWAGGER_URL = "https://dev-leasing-api.sadec.co/swagger/v1/swagger.json";
const OUTPUT_FILE = "./swagger-cleaned.json";

function sanitizeName(name) {
  // Replace C# generic notation e.g. Name`1[[Type]] or Name`1[Type] or Name`1
  // replace backticks, brackets, pluses, dots, commas, spaces with underscores
  return name
    .replace(/`\d+/g, "")
    .replace(/\[/g, "_")
    .replace(/\]/g, "")
    .replace(/\+/g, "_")
    .replace(/\./g, "_")
    .replace(/,/g, "_")
    .replace(/\s+/g, "_")
    .replace(/__+/g, "_"); // remove double underscores
}

async function run() {
  try {
    console.log(`Fetching Swagger JSON from ${SWAGGER_URL}...`);
    const response = await axios.get(SWAGGER_URL);
    const data = response.data;

    console.log("Sanitizing schema keys in components.schemas...");
    if (data.components && data.components.schemas) {
      const oldSchemas = data.components.schemas;
      const newSchemas = {};
      
      for (const [key, value] of Object.entries(oldSchemas)) {
        const newKey = sanitizeName(key);
        newSchemas[newKey] = value;
      }
      
      data.components.schemas = newSchemas;
    }

    console.log("Updating references ($ref) in the entire document...");
    const stringified = JSON.stringify(data);
    
    // Replace all instances of "#/components/schemas/Name`1[Type]" with sanitized equivalents
    const refRegex = /"#\/components\/schemas\/([^"]+)"/g;
    const updatedStringified = stringified.replace(refRegex, (match, refPath) => {
      const sanitized = sanitizeName(refPath);
      return `\"#/components/schemas/${sanitized}\"`;
    });

    const finalData = JSON.parse(updatedStringified);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    console.log(`Successfully wrote sanitized swagger to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Error sanitizing Swagger JSON:", error.message);
    process.exit(1);
  }
}

run();
