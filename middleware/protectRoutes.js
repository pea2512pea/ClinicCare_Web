import axios from "axios";

async function protectAdminRoute(req, res, next) {
    console.log("Protect Admin Route Middleware");
  if (!req.cookies) {
    return res.redirect("/");
  }
  const token = req.cookies.token || null;

  if (!token) {
    return res.redirect("/");
  }

  try {
    const response = await axios.get("/auth/", {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });
    const { role } = response.data;
    if (role !== "admin") {
      res.clearCookie("token");
      return res.redirect("/");
    }

    next();
  } catch (err) {
    console.error(err);
    res.clearCookie("token");
    return res.redirect("/");
  }
}

async function protectDoctorRoute(req, res, next) {
    console.log("Protect Doctor Route Middleware");
  if (!req.cookies) {
    return res.redirect("/");
  }
  const token = req.cookies.token || null;

  if (!token) {
    return res.redirect("/");
  }

  try {
    const response = await axios.get("/auth/", {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });
    const { role } = response.data;
    if (role !== "doctor") {
      res.clearCookie("token");
      return res.redirect("/");
    }
    next();
  } catch (err) {
    console.error(err);
    res.clearCookie("token");
    return res.redirect("/");
  }
}

async function protectUserRoute(req, res, next) {
    console.log("Protect User Route Middleware");
    console.log(req.cookies);
    
  if (!req.cookies) {
    console.log("No cookies found");
    return res.redirect("/");
  }
  const token = req.cookies.token || null;

  if (!token) {
    console.log("No token found in cookies");
    return res.redirect("/");
  }

  try {
    // on server need req.cookies
    const response = await axios.get("/auth",
        {
            withCredentials: true,
            headers: {
                Cookie: `token=${token}`,
            },
        }

    );

    const { role } = response.data;
    if (role !== "patient") {
        console.log(`User role is ${role}, not patient`);
      res.clearCookie("token");
      return res.redirect("/");
    }
    next();
  } catch (err) {
    console.log("Error");
    console.error(err);
    res.clearCookie("token");
    return res.redirect("/");
  }
}

async function protectUnauthenticatedRoute(req, res, next) {
    console.log("Protect Unauthenticated Route Middleware");
  if (!req.cookies) {
    return next();
  }
  const token = req.cookies.token || null;
  if (token) {
    try {
      // send cookie with request to check if token is valid and get user role
      const response = await axios.get("/auth/", {
        withCredentials: true,
        headers: {
          Cookie: `token=${token}`,
        },
      });
      const { role } = response.data;
      if (role === "admin") {
        return res.redirect("/admin");
      } else if (role === "doctor") {
        return res.redirect("/doctor");
      } else if (role === "patient") {
        return res.redirect("/patient");
      }
    } catch (err) {
      console.error(err);
      res.clearCookie("token");
      return next();
    }
  } else {
    return next();
  }
}

export {
  protectAdminRoute,
  protectDoctorRoute,
  protectUnauthenticatedRoute,
  protectUserRoute,
};
