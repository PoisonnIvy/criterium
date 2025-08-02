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
           fontFamily: 'Josefin sans',
           
          disabled:{
            opacity: 0.6,
            cursor: 'not-allowed',
          },
        },
        secondary: {
          solidBg: '#4f2621',
          solidHoverBg: '#3d1f1b',
          color: '#ffffff',
        },
        danger: {
          solidBg: '#a22b27',
          solidHoverBg: '#8b241f',
          color: 'white',
          fontFamily: 'Josefin sans',
        },
        success: {
          solidBg: '#538e56',
          solidHoverBg: '#467a49',
          color: 'white',
        },
        outlined:{
          solidBg: '#c59d9d ',
          border: '3px solid #8b241f',
          color: '#ffffffff'
        },
      },
    },
  },
  typography: {
    fontFamily: "Josefin sans",
    span:{fontFamily: "Josefin sans"},
    p: {
      fontFamily: "Josefin sans"
    },
  },
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
