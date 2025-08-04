import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";
import { sendResetPasswordMail, sendWelcomeEmail,sendVerificationCodeMail  } from "../services/mailSender.js";
import { validationTokenCache, resetPasswordCache, passwordTokenCache } from "../index.js";

export const Signup = async(req,res) =>{
  const {email, name, password} = req.body;
  const norm_email= validator.normalizeEmail(email,{gmail_remove_dots:false});

  try {
    
    if (!validator.isStrongPassword(password, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }])) {
      return res.json({ message: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, un número y un símbolo." });
    }
    const existingUser = await User.findOne({ email:norm_email }); 
    if (existingUser) {
      return res.json({success: false, message: "Este correo ya está registrado" });
    }
    if (!name || !email || !password) {
      return res.json({ success: false,message: "Todos los campos son obligatorios!" });
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
  const norm_email= validator.normalizeEmail(email,{gmail_remove_dots:false});
  
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
    const norm_email= validator.normalizeEmail(email,{gmail_remove_dots:false});
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
    console.log("ola")
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
      createdAt: req.session.createdAt,
      email: req.session.email}
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
  const norm_email= validator.normalizeEmail(email,{gmail_remove_dots:false});
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


// se envia un link para resetear
export const resetPassword = async (req, res) => {
  const {email}= req.body;
  const norm_email= validator.normalizeEmail(email,{gmail_remove_dots:false});
  try {
    const user = await User.findOne({ email:norm_email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    const token = Math.floor(100000 + Math.random() * 9000).toString();
    passwordTokenCache.set(norm_email, token);

    const tokenData = JSON.stringify({ email: norm_email, token });
    
    const iv = Buffer.from(process.env.TOKEN_IV, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.TOKEN_SECRET, 'hex'), iv);
    let encryptedToken = cipher.update(tokenData, 'utf8', 'hex');
    encryptedToken += cipher.final('hex');

    resetPasswordCache.set(encryptedToken,{ email: norm_email, token });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${encryptedToken}`;

    await sendResetPasswordMail(norm_email, resetLink, user.name);

    res.status(200).json({ success: true, message: "Código enviado al correo" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al enviar el correo" });
  }
}

//llega el token y la nueva contraseña
export const validateResetPassword = async (req, res) => {
  const {token}= req.params;
  const {newPassword, confirmPassword} = req.body;

  try{
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.TOKEN_SECRET, 'hex'), Buffer.from(process.env.TOKEN_IV, 'hex'));
    let decryptedToken = decipher.update(token, 'hex', 'utf8');
    decryptedToken += decipher.final('utf8');
    
    const code = JSON.parse(decryptedToken);
    if (!code || !code.email || !code.token) {
      return res.status(400).json({ message: "Token inválido" });
    }
    const passToken = passwordTokenCache.get(code.token);
    if (!passToken || passToken.email !== code.email) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }
    if (!validator.isStrongPassword(newPassword, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }])) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, un número y un símbolo." });
    }
    const email = passToken.email;
    const norm_email= validator.normalizeEmail(email,{gmail_remove_dots:false});
    const user = await User.findOne({ email: norm_email });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Contraseña actualizada correctamente" });
    passwordTokenCache.del(code.token);
    resetPasswordCache.del(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la contraseña, intentalo más tarde" });
    passwordTokenCache.del(code.token);
    resetPasswordCache.del(token);
  }
}