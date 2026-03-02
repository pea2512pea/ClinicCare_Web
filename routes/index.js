import doctorViews from "./doctorRoutes.js";
import userViews from "./userRoutes.js";
import adminViews from "./adminRoutes.js";
import dotenv from "dotenv";
dotenv.config();

export default (app) => {
  app.get("/", (req, res) => {
    res.render("user_login");
  });
  app.get("/login", (req, res) => {
    res.render("user_login");
  });
  app.get("/register", (req, res) => {
    res.render("user_register");
  });

  app.get("/portal", (req, res) => {
    res.render("portal");
  });

  app.use("/admin", adminViews);
  app.use("/doctor", doctorViews);
  app.use("/user", userViews);
};
