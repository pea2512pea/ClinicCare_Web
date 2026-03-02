import axios from "axios";

async function protectAdminRoute(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/');
    }

    try {
        await axios.get('/auth/', {
            withCredentials: true,
        });
        next();
    } catch (err) {
        console.error(err);
        res.clearCookie('token');
        return res.redirect('/');
    }
}

export default {
    protectAdminRoute,
};

