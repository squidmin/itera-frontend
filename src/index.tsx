import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, CssBaseline} from '@mui/material';
import {store} from './app/store';
import {lightTheme, darkTheme} from './themes/theme'; // Adjust the import path as necessary
import App from './App';
import reportWebVitals from "./reportWebVitals";

import './index.css';
import './App.css'
import {Provider} from "react-redux";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const ThemedApp = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline/> {/* Provides a consistent baseline */}
      <Provider store={store}>
        <App toggleTheme={toggleTheme}/>
      </Provider>
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <ThemedApp/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
