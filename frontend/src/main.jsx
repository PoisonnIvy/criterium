import React from 'react'
import ReactDom from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: '#b56a65',
          solidHoverBg: '#a15954',
           color: 'white',
           
          disabled:{
            opacity: 0.6,
            cursor: 'not-allowed',
          },
        },
        secondary: {
          solidBg: '#4f2621',
          solidHoverBg: '#3d1f1b',
           color: 'white',
        },
        danger: {
          solidBg: '#a22b27',
          solidHoverBg: '#8b241f',
          color: 'white',
        },
        success: {
          solidBg: '#538e56',
          solidHoverBg: '#467a49',
          color: 'white',
        },
        outlined:{
          backgroundColor: 'transparent',
          border: '2px solid #b56a65',
          color: '#b56a65',
          hover: {
            border: '2px solid #b56a65',
            color: 'white',
          }
        },
        // Puedes personalizar más colores aquí
      },
    },
  },
  typography: {
    fontFamily: "Josefin Sans",
    span:{fontFamily: "Josefin Sans"},
    p: {
      fontFamily: "Josefin Sans"
    },
  },
  // Puedes agregar tipografía, breakpoints, etc.
});

const root = ReactDom.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CssVarsProvider theme={theme}>
        <App />
      </CssVarsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
