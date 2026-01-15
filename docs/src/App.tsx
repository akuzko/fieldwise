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

function Sidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [examplesOpen, setExamplesOpen] = useState(true);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <nav className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <h1>Fieldwise</h1>
          <p className="tagline">Type-safe React forms</p>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" onClick={handleLinkClick}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/getting-started" onClick={handleLinkClick}>
              Getting Started
            </Link>
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
                  <Link
                    to="/examples/input-component"
                    onClick={handleLinkClick}
                  >
                    Input Component
                  </Link>
                </li>
                <li>
                  <Link to="/examples/basic-form" onClick={handleLinkClick}>
                    Basic Form
                  </Link>
                </li>
                <li>
                  <Link
                    to="/examples/fine-grained-subscriptions"
                    onClick={handleLinkClick}
                  >
                    Fine-grained Subscriptions
                  </Link>
                </li>
                <li>
                  <Link to="/examples/validation" onClick={handleLinkClick}>
                    Form Validation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/examples/multiple-validators"
                    onClick={handleLinkClick}
                  >
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
    </>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app">
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
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
