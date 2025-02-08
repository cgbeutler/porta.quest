import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './routes/Home/Home';
import Pipes from './routes/Pipes/Pipes';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import Hangman from './routes/Hangman/Hangman';
import SettingsProvider from './lib/SettingsProvider';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,

    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "/hangman",
        element: <Hangman />
      },
      {
        path: "/pipes",
        element: <Pipes />
      }
    ]
  }
])

const root = ReactDOM.createRoot( document.getElementById('root') as HTMLElement );
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
