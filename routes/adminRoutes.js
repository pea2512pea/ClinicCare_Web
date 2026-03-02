import express from "express";
import appointmentsController from "../controllers/appointmentsController.js";
import doctorController from "../controllers/doctorController.js";
import patientController from "../controllers/patientController.js";
import reportsController from "../controllers/reportsController.js";
import serviceController from "../controllers/serviceController.js";
import staffController from "../controllers/staffController.js";

const router = express.Router();

router.get("/", reportsController.renderDashboardPage);

router.get("/patients", patientController.renderPatientsPage);
router.get("/patients/:id", patientController.renderPatientDetailsPage);
router.get("/patients-add", patientController.renderAddPatientPage);
router.get("/patients-edit/:id", patientController.renderEditPatientPage);

router.get("/doctors", doctorController.renderDoctorsPage);
router.get("/doctors/:id", doctorController.renderDoctorDetailsPage);
router.get("/doctors-add", doctorController.renderAddDoctorPage);
router.get("/doctors-edit/:id", doctorController.renderEditDoctorPage);

router.get("/services", serviceController.renderServicesPage);
router.get("/services/:id", serviceController.renderServiceDetailsPage);
router.get("/services-add", serviceController.renderAddServicePage);
router.get("/services-edit/:id", serviceController.renderEditServicePage);

router.get("/appointments", appointmentsController.renderAppointmentsPage);
router.get(
  "/appointments/:id",
  appointmentsController.renderAppointmentDetailsPage,
);
router.get(
  "/appointments-add",
  appointmentsController.renderAddAppointmentPage,
);
router.get(
  "/appointments-edit/:id",
  appointmentsController.renderEditAppointmentPage,
);

router.get("/report1", reportsController.renderReport1Page);
router.get("/report2", reportsController.renderReport2Page);

router.get(
  "/todays-appointments",
  staffController.renderTodaysAppointmentsPage,
);

export default router;
