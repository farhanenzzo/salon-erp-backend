import jwt from "jsonwebtoken";

export const checkGrotechAdmin = (req, res, next) => {
    try {
        const token = req.cookies.grotechAdminToken || req.headers["x-grotech-admin-token"];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "GROTECH_ADMIN") {
            return res.status(403).json({ message: "Forbidden: Not a Super Admin" });
        }

        req.grotechAdminId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
