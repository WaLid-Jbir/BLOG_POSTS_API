import jwt from "jsonwebtoken";

export const identifier = (req, res, next) => {
    let token;
    if(req.headers.client === "not-browser"){
        token = req.headers.authorization;
    } else {
        token = req.cookies["Authorization"];
    }

    if(!token){
        return res.status(403).json({
            success: false,
            message: "Unauthorized, You are not logged in!",
        });
    }

    try {
        const userToken = token.split(" ")[1];
        const jwtVerified = jwt.verify(userToken, process.env.JWT_SECRET);
        if (jwtVerified) {
            req.user = jwtVerified;
            next();
        }
        else {
            throw new Error("Invalid token!");
        }
    } catch (error) {
        console.error("❌ Error on identifier:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}