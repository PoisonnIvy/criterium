import User from "../models/user.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { sendWelcomeEmail } from "../services/mailSender.js";
import { validationTokenCache } from "../index.js";
import { sendVerificationCodeMail } from "../services/mailSender.js";

export const Signup = async(req,res) =>{
  const {email, name, password} = req.body;
  const norm_email= validator.normalizeEmail(email);

  try {
    
    if (!validator.isStrongPassword(password, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }])) {
      return res.json({ message: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, un número y un símbolo." });
    }
    const existingUser = await User.findOne({ email:norm_email }); 
    if (existingUser) {
      return res.json({success: false, message: "Este correo ya está registrado" });
    }
    if (!name || !email || !password) {
      return res.json({ success: false,message: "Se necesitan todos los campos" });
    }
    if (!validator.isEmail(norm_email)) {
      return res.json({success: false, message: "Correo inválido" });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    validationTokenCache.set(norm_email, code, 3600);
    
    const mailResult = await sendVerificationCodeMail(norm_email, code, name);

    if (!mailResult.success) {
      return res.status(500).json({ success: false, message: "No se pudo enviar el correo" });
    }
    res.json({ success: true, message: "Código enviado al correo" });
  } catch (error) {
    res.status(500).json({ success: false, message: "No se pudo enviar el correo" });
  }
}


export const Validate = async (req, res) => {
  const { name, email, password, code} = req.body;
  const norm_email= validator.normalizeEmail(email);
  
  const cachedCode = validationTokenCache.get(norm_email);
  if (!cachedCode) return res.status(400).json({ message: "El código expiró o es inválido" });
  if (cachedCode !== code) return res.status(400).json({ message: "Código incorrecto" });
  validationTokenCache.del(norm_email);

  try {
    await sendWelcomeEmail(norm_email, name)
    
    const user = await User.create({ name, email:norm_email, password });

    req.session.userId = user._id;
    req.session.username = user.name;
    req.session.email = user.email;
    req.session.lastLogin = user.createdAt,
    req.session.createdAt = user.createdAt,
    res.status(201).json({message: `Bienvenido! ${user.name}, has sido registrado correctamente`, 
                          success: true});

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "No se ha podido registrar al usuario", success: false });
  }
}


export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const norm_email= validator.normalizeEmail(email);
    if (!email || !password) {
      return res.json({ message: 'Se necesitan todos los campos' });
    }
    if (!validator.isEmail(norm_email)) {
      return res.status(400).json({ message: "Correo inválido" });
    }
    const user = await User.findOne({ email:norm_email });
    if (!user) {
      return res.status(400).json({ message: 'Correo no registrado' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ message: 'Contraseña incorrecta'});
    }
    req.session.userId = user._id;
    req.session.username = user.name;
    req.session.email = user.email;
    req.session.lastLogin=user.lastLogin;
    req.session.createdAt = user.createdAt,
    res.status(201).json({message: `Bienvenido! ${user.name}`, 
                          success: true});
    await User.findByIdAndUpdate(
      user._id,
      { lastLogin: new Date().toISOString() },
      { new: true }
    );
  } catch (error) {
    res.status(400)
    console.error(error);
  }
}

export const Logout = async (req, res) =>{
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
  try {
    if (req.session.userId) {
    return res.status(200).json({
      status: true, 
      user: {name:req.session.username,
      userId:req.session.userId,
      lastLogin:req.session.lastLogin,
      createdAt: req.session.createdAt}
    });
  } else {
    return res.status(401).json({ status: false});
  }
  } catch (error) {
    return res.status(500).json({status:false, message:"Ha ocurrido un error del lado del servidor", error:error})
  }
};

export const checkEmail = async (req, res) => {
  const {email} = req.params
  const norm_email= validator.normalizeEmail(email);
  try {
    const user = await User.findOne({ email:norm_email });
    if (user) {
      return res.status(200).json({ exists: true, message: "El correo ya está registrado" });
    } else {
      return res.status(200).json({ exists: false, message: "El correo no está registrado" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al verificar el correo" });
  }
}