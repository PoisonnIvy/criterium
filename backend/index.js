import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db_config.js';
import cookieParser from 'cookie-parser';
import authRoute from './routes/AuthRoutes.js';
const app = express();
dotenv.config();

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json()); // allows to parse JSON data in the request body

app.use(cookieParser());

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
});

app.use("/", authRoute);

/* Ejemplo de como se importan las rutas
const espaciocomRoutes = require('./routes/espaciocomRoute');
const reservaespacioRoutes = require('./routes/reservaespacioRoute');
const fileRoutes = require('./routes/fileRoute');

*/

/* Ejemplo de como se usan las rutas
app.use('/api', espaciocomRoutes);
app.use('/api', reservaespacioRoutes);
app.use('/api', fileRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', sancionRoutes);
*/

/*
inyeccion nosql
{
    "email":{
        "$ne": null
    },
    "password": {
        "$ne": null
    }
}
esto va a retornar todos los usuarios que tengan email y password diferentes de null.    
*/



