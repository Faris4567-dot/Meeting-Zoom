import User from '../models/User.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/token.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already used' });
  const user = await User.create({ name, email, password });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  user.refreshToken = refresh;
  await user.save();
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, access, refresh });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  user.refreshToken = refresh;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, access, refresh });
});

export const refresh = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });
  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== token) return res.status(401).json({ message: 'Invalid refresh token' });
  const access = signAccessToken(user);
  res.json({ access });
});

export const logout = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'No userId' });
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  res.json({ message: 'Logged out' });
});
