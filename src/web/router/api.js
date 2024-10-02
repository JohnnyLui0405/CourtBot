import { Router } from 'express';
import jwt from 'jsonwebtoken';


const router = Router();

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    console.log(token);

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.userId = decoded.id;
        next();
    });
};

router.get('/test', async (req, res) => {
    res.send("OK");
});

router.post('/shorten', verifyToken, async (req, res) => {
    console.log(req.body.inputUrl);
    res.send({});
});

export default router;