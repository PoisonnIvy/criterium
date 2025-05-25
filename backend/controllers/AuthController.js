import User from "../models/User.js";
import { createSecretToken } from "../utils/secretToken.js";
import bcrypt from "bcrypt";
import validator from "validator";


export async function Signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const norm_email= validator.normalizeEmail(email);
    const existingUser = await User.findOne({ email:norm_email }); 
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    if (!name || !email || !password) {
      return res.json({ message: "All fields are required" });
    }
    if (!validator.isEmail(norm_email)) {
      return res.json({ message: "Enter a valid email" });
    }
    if (!validator.isStrongPassword(password, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }])) {
      return res.json({ message: "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol" });
    }


    const user = await User.create({ name, email:norm_email, password });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(201).json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
}

export async function Login(req, res, next) {
  try {
    const { email, password } = req.body;
    const norm_email= validator.normalizeEmail(email);
    if (!email || !password) {
      return res.json({ message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
      return res.json({ message: "Enter a valid email" });
    }
    const user = await User.findOne({ email:norm_email });
    if (!user) {
      return res.json({ message: 'Email not registered' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: 'Incorrect password' });
    }
    
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(201).json({ message: "User logged in successfully", success: true });
    next();
  } catch (error) {
    console.error(error);
  }
}