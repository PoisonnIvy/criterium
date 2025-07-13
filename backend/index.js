import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db_config.js';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import {  Projects, Auth, BaseForm, 
          Assignments, Articles, 
          FormInstances, Services,
          WebArticles} from './routes/index.js';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




export const cache = new NodeCache({ 
  stdTTL: 3600, // 1 hora
  checkperiod: 600, // Limpiar cada 10 minutos
  maxKeys: 1000  }); 

export const validationTokenCache = new NodeCache({ 
  stdTTL: 3600, // 1 hora
  checkperiod: 600, // Limpiar cada 10 minutos
  maxKeys: 1000  }); 

export const baseformTokenCache = new NodeCache({ 
  stdTTL: 3600, // 1 hora
  checkperiod: 600,
  maxKeys: 1000  });

export const inviteCache = new NodeCache({ 
  stdTTL: 7 * 24 * 60 * 60, 
  checkperiod: 600, 
  maxKeys: 5000 });


const app = express();



app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST","PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json()); // allows to parse JSON data in the request body
app.use(express.urlencoded({ extended: true })); // allows to parse URL-encoded data in the request body

//configuracion de la session
app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DEV_MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 dia
    httpOnly: true,
    secure: false, // solo para desarrollo
    sameSite: "lax",
  },
}));

//RUTAS
app.use("/auth", Auth);
app.use("/proyecto", Projects);
app.use("/formulario", BaseForm);
app.use("/instancia", FormInstances);
app.use("/asignacion", Assignments);
app.use("/articulos", Articles);
app.use("/services", Services);
app.use("/websearch", WebArticles); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//conexion a la base de datos e iniciar el servidor
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});
})


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



