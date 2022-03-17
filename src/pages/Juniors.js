import { createUseStyles } from "react-jss";
import Account from "../components/Account";
import Footer from "../components/Footer";
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

const Juniors = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <div className={classes.page}>
      <div className={classes.header}>
        <div onClick={() => navigate("/")} className={classes.logo}>
          <div />
          <span>CryptoElephantsClub</span>
        </div>
        <div className={classes.space} />
        <Account />
      </div>

      <img
        className={classes.cover}
        src="cover.png"
        alt="A cover full of elephants"
      />
      <div className={classes.content}>
        <h1>Coming Soon!</h1>
        <span className={classes.link} onClick={() => navigate("/")}>
          Come back later 🚀
        </span>
      </div>
      <Footer />
    </div>
  );
};

export default Juniors;
