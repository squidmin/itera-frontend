import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';

interface AppProps {
  toggleTheme: () => void;
}

const App: React.FC<AppProps> = ({toggleTheme}) => {
  return (
    <Router>
      <main style={{flexGrow: 1, padding: '20px'}}>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
        </Routes>
      </main>
    </Router>
  );
};

export default App;
