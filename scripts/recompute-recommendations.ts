import { recomputeAllRecommendations } from "../services/matching";

recomputeAllRecommendations().then(() => {
  console.log("Recommendations recomputed.");
  process.exit(0);
});
