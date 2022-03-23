import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
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
    <>
      <h1>Coming Soon!</h1>
      <span className={classes.link} onClick={() => navigate("/")}>
        Come back later 🚀
      </span>
    </>
  );
};

export default Juniors;
