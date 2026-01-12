import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import GettingStarted from './pages/GettingStarted';
import Examples from './pages/Examples';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <h1>Fieldwise</h1>
            <p className="tagline">Type-safe React forms</p>
          </div>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/getting-started">Getting Started</Link>
            </li>
            <li>
              <Link to="/examples">Examples</Link>
            </li>
          </ul>
          <div className="github-link">
            <a
              href="https://github.com/akuzko/fieldwise"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub →
            </a>
          </div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/examples" element={<Examples />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
