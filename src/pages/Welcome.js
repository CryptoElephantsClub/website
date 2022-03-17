import { Button } from "antd";
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

const Welcome = () => {
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
        alt="preview of a 3d wallet"
      />
      <div className={classes.content}>
        <h1>Welcome to the CryptoElephantsClub!</h1>
        <p>
          Crypto Elephants Club is the mission of saving the elephants through
          community activism and new technology.The Crypto Elephants Club is a
          collection of 5,000 (+1) unique Crypto Elephants Club NFTs.
        </p>
        <Button
          style={{
            maxWidth: 240,
            alignSelf: "center",
            marginTop: 8,
            marginBottom: 16,
          }}
          type="primary"
          href="https://opensea.io/collection/cryptoelephantsclub?tab=activity"
        >
          View Collection at OpenSea
        </Button>
        <h2>CryptoElephantsJunior</h2>
        <p>
          Two adult elephants allow you to receive a Junior 👀 .. Every elephant
          can only have one child. If you plan to buy an elephant at OpenSea
          please{" "}
          <span
            className={classes.link}
            onClick={() => {
              navigate("/juniors");
            }}
          >
            check the elephant ID
          </span>{" "}
          to see if the elephant can be used to get a child. This is not real
          breeding. <br />
          <br />❗ The attributes of the elephant that you will receive are not
          related to it's "parents". ❗
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Welcome;
