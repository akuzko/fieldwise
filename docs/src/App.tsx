import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import GettingStarted from './pages/GettingStarted';
import Examples from './pages/Examples';
import BasicFormExample from './pages/examples/BasicFormExample';
import SliceExample from './pages/examples/SliceExample';
import ValidationExample from './pages/examples/ValidationExample';
import MultiValidatorExample from './pages/examples/MultiValidatorExample';
import InputComponent from './pages/examples/InputComponent';
import './App.css';

function Sidebar() {
  const [examplesOpen, setExamplesOpen] = useState(true);

  return (
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
        <li className="nav-group">
          <button
            className="nav-group-toggle"
            onClick={() => setExamplesOpen(!examplesOpen)}
          >
            Examples {examplesOpen ? '▼' : '▶'}
          </button>
          {examplesOpen && (
            <ul className="nav-sublist">
              <li>
                <Link to="/examples/input-component">Input Component</Link>
              </li>
              <li>
                <Link to="/examples/basic-form">Basic Form</Link>
              </li>
              <li>
                <Link to="/examples/fine-grained-subscriptions">
                  Fine-grained Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/examples/validation">Form Validation</Link>
              </li>
              <li>
                <Link to="/examples/multiple-validators">
                  Multiple Validators
                </Link>
              </li>
            </ul>
          )}
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/examples" element={<Examples />} />
            <Route
              path="/examples/input-component"
              element={<InputComponent />}
            />
            <Route path="/examples/basic-form" element={<BasicFormExample />} />
            <Route
              path="/examples/fine-grained-subscriptions"
              element={<SliceExample />}
            />
            <Route
              path="/examples/validation"
              element={<ValidationExample />}
            />
            <Route
              path="/examples/multiple-validators"
              element={<MultiValidatorExample />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
