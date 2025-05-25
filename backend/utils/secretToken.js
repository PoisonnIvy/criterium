import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();


export function createSecretToken(id) {
  return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: '1d',
  });
}