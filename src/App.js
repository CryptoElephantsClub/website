import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Juniors, Welcome, Claim, Admin } from "./pages";
import { createUseStyles } from "react-jss";
import Account from "./components/Account";
import Footer from "./components/Footer";
import { useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  cover: {
    width: "100%",
    height: 300,
    objectFit: "cover",
    backgroundColor: "white",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    paddingTop: "2vh",
    paddingBottom: "5vh",
    width: "95%",
    textAlign: "center",
    alignSelf: "center",
    "@media screen and (min-width: 800px)": {
      width: "80%",
    },
    "@media screen and (min-width: 576px)": {
      paddingTop: "4vh",
      paddingBottom: "2vh",
    },
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    display: "flex",
    padding: 12,
    height: 64,
    boxShadow: "rgb(4 17 29 / 25%) 0px 0px 8px 0px",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& > div": {
      width: 32,
      height: 32,
      background: "url(./logo.png)",
      cursor: "pointer",
      backgroundSize: "cover",
      borderRadius: "50%",
    },
    "& > span": {
      color: "#12284b",
      fontWeight: "bolder",
      marginLeft: 4,
      marginTop: 4,
    },
  },
  space: {
    flexGrow: 1,
  },
  link: {
    color: "#508960",
    cursor: "pointer",
    transition: "color 0.3s",
    "&:hover": {
      color: "#62b871",
    },
  },
});

const Header = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <div className={classes.header}>
      <div onClick={() => navigate("/")} className={classes.logo}>
        <div />
        <span>CryptoElephantsClub</span>
      </div>
      <div className={classes.space} />
      <Account />
    </div>
  );
};

const App = () => {
  const classes = useStyles();
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
      <div className={classes.page}>
        <Header />

        <img
          className={classes.cover}
          src="cover.png"
          alt="preview of a 3d wallet"
        />
        <div className={classes.content}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/juniors" element={<Juniors />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
