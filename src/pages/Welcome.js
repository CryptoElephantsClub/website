import { Button } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";
import { useMoralis } from "react-moralis";

const useStyles = createUseStyles({
  link: {
    color: "#508960",
    cursor: "pointer",
    transition: "color 0.3s",
    "&:hover": {
      color: "#62b871",
    },
  },
  button: {
    maxWidth: 240,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
});

const Welcome = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useMoralis();

  const adminAddress = "0x7ab51dfe5d2efbd7d01237a84f153fd578563e4f";

  return (
    <>
      <h1>Welcome to the CryptoElephantsClub!</h1>
      {isAuthenticated &&
        user.attributes.ethAddress.toLowerCase() === adminAddress && (
          <Button
            danger
            className={classes.button}
            onClick={() => navigate("/admin")}
          >
            Goto Admin Panel
          </Button>
        )}
      <p>
        Crypto Elephants Club is the mission of saving the elephants through
        community activism and new technology.The Crypto Elephants Club is a
        collection of 5,000 (+1) unique Crypto Elephants Club NFTs.
      </p>
      <Button
        className={classes.button}
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
      <Button
        className={classes.button}
        type="primary"
        onClick={() => {
          navigate("/claim");
        }}
      >
        Claim your Junior(s) now
      </Button>
    </>
  );
};

export default Welcome;
