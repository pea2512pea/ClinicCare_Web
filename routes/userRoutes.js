import express from "express";
import userController from "../controllers/userController";

const router = express.Router();

router.get("/", userController.renderUserHomePage);
router.get("/book-appointment", userController.renderBookAppointmentPage);
router.get("/appointments", userController.renderAppointmentsPage);
router.get("/profile", userController.renderProfilePage);
router.get("/appointments/:id", userController.renderAppointmentDetailsPage);

export default router;
