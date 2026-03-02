import axios from "axios";

async function protectAdminRoute(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/');
    }

    try {
        const response = await axios.get('/auth/', {
            withCredentials: true,
        });
        const { role } = response.data;
        if (role !== 'admin') {
            res.clearCookie('token');
            return res.redirect('/');
        }

        next();
    } catch (err) {
        console.error(err);
        res.clearCookie('token');
        return res.redirect('/');
    }
}

async function protectDoctorRoute(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/');
    }

    try {
        const response = await axios.get('/auth/', {
            withCredentials: true,
        });
        const { role } = response.data;
        if (role !== 'doctor') {
            res.clearCookie('token');
            return res.redirect('/');
        }
        next();
    } catch (err) {
        console.error(err);
        res.clearCookie('token');
        return res.redirect('/');
    }
}

async function protectUserRoute(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/');
    }

    try {
        const response = await axios.get('/auth/', {
            withCredentials: true,
        });
        const { role } = response.data;
        if (role !== 'user') {
            res.clearCookie('token');
            return res.redirect('/');
        }
        next();
    } catch (err) {
        console.error(err);
        res.clearCookie('token');
        return res.redirect('/');
    }
}

async function protectUnauthenticatedRoute(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        try {
            const response = await axios.get('/auth/', {
                withCredentials: true,
            });
            const { role } = response.data;
            if (role === 'admin') {
                return res.redirect('/admin');
            } else if (role === 'doctor') {
                return res.redirect('/doctor');
            } else if (role === 'user') {
                return res.redirect('/user');
            }
        } catch (err) {
            console.error(err);
            res.clearCookie('token');
            return next();
        }
    } else {
        return next();
    }
}

export {
    protectAdminRoute,
    protectDoctorRoute,
    protectUserRoute,
    protectUnauthenticatedRoute,
};

