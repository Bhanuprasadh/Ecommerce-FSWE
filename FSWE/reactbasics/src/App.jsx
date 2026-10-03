import { Routes, Route, Link } from "react-router-dom";

import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <div>

      <nav className="navbar navbar-dark bg-danger px-4">
        <h3 className="text-warning">My Website</h3>

        <div>
          <Link to="/" className="btn btn-light me-2">Home</Link>
          <Link to="/about" className="btn btn-light me-2">About</Link>
          <Link to="/contact" className="btn btn-light me-2">Contact</Link>
          <Link to="/login" className="btn btn-light me-2">Login</Link>
          <Link to="/register" className="btn btn-light">Register</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

    </div>
  );
}

export default App;
