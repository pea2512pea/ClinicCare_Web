import doctorViews from "./doctorRoutes.js";
import userViews from "./userRoutes.js";
import adminViews from "./adminRoutes.js";
import { protectAdminRoute, protectDoctorRoute, protectUnauthenticatedRoute, protectUserRoute } from "../middleware/protectRoutes.js";
import dotenv from "dotenv";
dotenv.config();

export default (app) => {
  app.get("/", protectUnauthenticatedRoute, (req, res) => {
    res.render("user_login");
  });
  app.get("/login", protectUnauthenticatedRoute, (req, res) => {
    res.render("user_login");
  });
  app.get("/register", protectUnauthenticatedRoute, (req, res) => {
    res.render("user_register", { BACKEND_URL: "Register" });
  });

  app.get("/portal", protectUnauthenticatedRoute, (req, res) => {
    res.render("portal");
  });

  app.use("/admin", protectAdminRoute, adminViews);
  app.use("/doctor", protectDoctorRoute, doctorViews);
  app.use("/user", protectUserRoute, userViews);
};
