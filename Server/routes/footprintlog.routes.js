import { Router } from "express";
const router = Router();
import { authenticate } from "../middleware/auth.js";
import {
  createLog,
  previewEmissions,
  getUserLogs,
  getTotalEmissions,
  getLogById,
  updateLog,
  deleteLog,
  getEmissionsByActivityType,
  getEmissionsByCategory,
} from "../controllers/footprintlog.controller.js";

// All routes require authentication
router.use(authenticate);

router.post("/", createLog);
router.post("/preview", previewEmissions);
router.get("/", getUserLogs);
router.get("/total", getTotalEmissions);
router.get("/:id", getLogById);
router.put("/:id", updateLog);
router.delete("/:id", deleteLog);
router.get("/breakdown/activityType", getEmissionsByActivityType);
router.get("/breakdown/category", getEmissionsByCategory);

export default router;
