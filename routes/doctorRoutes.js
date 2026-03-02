import express from "express";
import staffController from "../controllers/staffController.js";
const router = express.Router();

router.get("/", staffController.renderDoctorHomePage);
router.get("/appointments/:id", staffController.renderDoctorAppointmentDetailsPage);

export default router;
