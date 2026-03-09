import "./App.jsx";
import AppRoutes from "./Router/AppRoutes.jsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;
