import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compileTrainingLevels } from "../src/parser/compile-curriculum";
import { TrainingLevelsDataSchema } from "../src/types/curriculum";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rootDir = path.resolve(__dirname, "..");
  const docsDir = path.join(rootDir, "docs");
  const dataDir = path.join(rootDir, "src", "data");

  console.log("📚 Compiling Training Levels Markdown content...");
  const trainingData = compileTrainingLevels(docsDir);

  // Validate with Zod
  console.log("🔍 Validating compiled dataset against Zod schema...");
  const validation = TrainingLevelsDataSchema.safeParse(trainingData);

  if (!validation.success) {
    console.error("❌ Schema validation failed:");
    console.error(JSON.stringify(validation.error.format(), null, 2));
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const jsonContent = JSON.stringify(trainingData, null, 2);

  const primaryTarget = path.join(dataDir, "training-levels.json");
  const aliasTarget = path.join(dataDir, "training-content.json");

  fs.writeFileSync(primaryTarget, jsonContent, "utf-8");
  fs.writeFileSync(aliasTarget, jsonContent, "utf-8");

  const totalBehaviors = trainingData.levels.reduce(
    (sum, l) => sum + l.behaviors.length,
    0
  );
  const totalSteps = trainingData.levels.reduce(
    (sum, l) => sum + l.behaviors.reduce((bSum, b) => bSum + b.steps.length, 0),
    0
  );

  console.log("✅ Successfully compiled content:");
  console.log(`   - Foundations: ${trainingData.foundations.length} sections`);
  console.log(`   - Levels: ${trainingData.levels.length}`);
  console.log(`   - Behaviors: ${totalBehaviors}`);
  console.log(`   - Steps: ${totalSteps}`);
  console.log(`   - Appendices: ${trainingData.appendices.length} items`);
  console.log(`💾 Written to:`);
  console.log(`   - ${primaryTarget}`);
  console.log(`   - ${aliasTarget}`);
}

main().catch((err) => {
  console.error("Fatal error during content compilation:", err);
  process.exit(1);
});
