import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Juniors, Welcome } from "./pages";

const App = () => {
  const { enableWeb3, isAuthenticated, isWeb3Enabled, isWeb3EnableLoading } =
    useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) {
      if (typeof window.ethereum === "undefined") {
        enableWeb3({ provider: "walletconnect" });
      } else {
        enableWeb3();
      }
    }
  }, [isAuthenticated, isWeb3EnableLoading, isWeb3Enabled, enableWeb3]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/juniors" element={<Juniors />} />
      </Routes>
    </Router>
  );
};

export default App;
