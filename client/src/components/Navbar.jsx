import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // for mobile menu
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/signin");
  };

  if (isDashboard && user) {
    // DASHBOARD SIDEBAR
    return (
      <div className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col p-4">
        <NavLink to="/dashboard" className="mb-4 p-2 rounded hover:bg-gray-700">
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/profile"
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          Profile
        </NavLink>
        <NavLink
          to="/dashboard/habittrack"
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          Habit Tracker
        </NavLink>
        {/* <NavLink
          to="/dashboard/expensetrack"
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          Expense Tracker
        </NavLink>
        <NavLink
          to="/dashboard/jobtrack"
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          Job Tracker
        </NavLink>
        <NavLink
          to="/dashboard/analytics"
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          Analytics
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          Settings
        </NavLink> */}
        <button
          onClick={handleLogout}
          className="mt-auto p-2 rounded bg-red-500 hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  // TOP NAVBAR FOR PUBLIC PAGES
  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between relative">
      <NavLink to="/" className="text-xl font-bold uppercase">
        OneApp
      </NavLink>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-x-6 text-lg">
        <NavLink
          to="#products"
          onClick={(e) => {
            e.preventDefault(); // prevent router navigation
            const section = document.querySelector("#products");
            if (section) section.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Products
        </NavLink>
        <NavLink
          to="#about"
          onClick={(e) => {
            e.preventDefault();
            const section = document.querySelector("#about");
            if (section) section.scrollIntoView({ behavior: "smooth" });
          }}
        >
          About
        </NavLink>

        <>
          <NavLink to="/signup" className="bg-green-500 px-3 py-1 rounded">
            Sign Up
          </NavLink>
          <NavLink to="/signin" className="bg-green-500 px-3 py-1 rounded">
            Sign In
          </NavLink>
        </>
      </div>

      {/* Mobile hamburger button */}
      <button className="md:hidden" onClick={() => setOpen((prev) => !prev)}>
        {open ? <AiOutlineClose size={28} /> : <AiOutlineMenu size={28} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-gray-800 flex flex-col items-start p-4 gap-2 md:hidden z-10">
          <NavLink onClick={() => setOpen(false)} to="/products">
            Products
          </NavLink>
          <NavLink onClick={() => setOpen(false)} to="/contact">
            Contact
          </NavLink>
          <NavLink onClick={() => setOpen(false)} to="/about">
            About
          </NavLink>
          {!user && (
            <>
              <NavLink
                onClick={() => setOpen(false)}
                to="/signup"
                className="bg-green-500 px-3 py-1 rounded"
              >
                Sign Up
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/signin"
                className="bg-green-500 px-3 py-1 rounded"
              >
                Sign In
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
