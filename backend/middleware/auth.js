import jwt from 'jsonwebtoken';

export function authenticateJWT(allowedRoles = []) {
    return (req, res, next) => {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ error: "Forbidden: insufficient role" });
            }
            req.user = decoded; 
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
    };
}
