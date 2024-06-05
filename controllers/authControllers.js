const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(409).json({ message: 'All fields are required' });
    const user = await User.findOne({ username }).lean().exec();
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid credentials" });
    const accessToken = jwt.sign({ username, name: user.name, profilePic: user.profilePic }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign({ username, name: user.name, profilePic: user.profilePic }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.json({ accessToken });
});

const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
    jwt.verify(cookies.jwt, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        const user = await User.findOne({ username: decoded.username }).exec();
        if (!user) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
            return res.status(500).json({ message: "Internal server error" });
        }
        const accessToken = jwt.sign({ username: decoded.username, name: user.name, profilePic: user.profilePic }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
        res.json({ accessToken });
    })
});

const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(203);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Logged Out' })
})
module.exports = { login, refresh, logout };
