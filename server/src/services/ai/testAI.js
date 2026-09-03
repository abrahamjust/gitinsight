import { connectMongo } from "../../config/database.js";
import { generateAnalytics } from "../analytics/analytics.service.js";
import { generateRepositoryExplanation } from "./aiExplanationService.js";

await connectMongo();

const repositoryId = "6a99052ab26193c70f2e4d52";

try {
    const result = await generateAnalytics(repositoryId);

    console.log("\nGenerating AI explanation...\n");

    const explanation = await generateRepositoryExplanation(
        result.aiContext
    );

    console.dir(explanation, { depth: null });
} catch (error) {
    console.error("AI test failed:");
    console.error(error);
}