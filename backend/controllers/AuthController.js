import User from "../models/user.js";
import bcrypt from "bcrypt";
import validator from "validator";


export async function Signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const norm_email= validator.normalizeEmail(email);
    const existingUser = await User.findOne({ email:norm_email }); 
    if (existingUser) {
      return res.json({ message: "Este correo ya está registrado" });
    }
    if (!name || !email || !password) {
      return res.json({ message: "Se necesitan todos los campos" });
    }
    if (!validator.isEmail(norm_email)) {
      return res.json({ message: "Correo inválido" });
    }
    // no strong pass while on dev
    /*if (!validator.isStrongPassword(password, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }])) {
      return res.json({ message: "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol" });
    }*/

    const user = await User.create({ name, email:norm_email, password });
    req.session.userId = user._id;
    req.session.username = user.name;
    req.session.email = user.email;
    res.status(201).json({ message: "Usuario registrado correctamente", success: true, user });
  } catch (error) {
    console.error(error);
  }
}

export async function Login(req, res) {
  try {
    const { email, password } = req.body;
    const norm_email= validator.normalizeEmail(email);
    if (!email || !password) {
      return res.json({ message: 'Se necesitan todos los campos' });
    }
    if (!validator.isEmail(email)) {
      return res.json({ message: "Correo inválido" });
    }
    const user = await User.findOne({ email:norm_email });
    if (!user) {
      return res.json({ message: 'Correo no registrado' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: 'Contraseña incorrecta' });
    }
    req.session.userId = user._id;
    req.session.username = user.name;
    req.session.email = user.email;
    res.status(201).json({ message: "", success: true });
    await User.findByIdAndUpdate(
      user._id,
      { lastLogin: new Date().toISOString() },
      { new: true }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function Logout(req, res) {
  try {
    req.session.destroy(err => {
      if (err) return res.status(500).send("No se pudo cerrar la sesión");
      res.clearCookie("sid");
      res.status(200).json({ message: "Sesión cerrada correctamente" , success: true} );
    });
  } catch (error) {
    console.error(error);
  }
}

export const checkAuth = (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({
      status: true, 
      user: req.session.username,
      message: "Usuario autenticado",
    });
  } else {
    return res.status(401).json({ status: false, message: "No hay sesión activa" });
  }
};