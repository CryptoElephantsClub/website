import { useState } from "react";
import { Alert, Breadcrumb, Input, Button, message } from "antd";
import { createUseStyles } from "react-jss";
import { HomeOutlined } from "@ant-design/icons";
import axios from "axios";

const useStyles = createUseStyles({
  check: {
    maxWidth: 300,
  },
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    marginTop: 12,
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
  },
});

const Juniors = () => {
  const classes = useStyles();
  const [elephantId, setElephantId] = useState("");
  const [lastCheckedId, setLastCheckedId] = useState("");
  const [isUsed, setIsUsed] = useState();

  let type = "warning";
  let title = "Attention";
  let description =
    "You need 2 adult elephants to request a junior and the adult elephants can only have one child. If you plan to buy an adult elephant at OpenSea to use it for a request, you need to check first if the elephant was already used. The elephant ID is the NFT name displayed at OpenSea (# + Number between 1-5000)";

  if (typeof isUsed !== "undefined") {
    if (isUsed) {
      type = "error";
      title = `Elephant #${lastCheckedId} already used`;
      description =
        "You can not use this elephant to request a junior. The elephant is already a parent.";
    } else {
      type = "success";
      title = `Elephant #${lastCheckedId} ready to use`;
      description = "You can use this elephant to request a junior!";
    }
  }

  const checkParent = async () => {
    if (elephantId === "") {
      return;
    }

    const intId = Number(elephantId);

    if (!Number.isInteger(intId) || intId < 0 || intId > 5000) {
      message.info(
        "The elephant Id is a number between 0 and 5000. You also see it as NFT name at OpenSea."
      );
      return;
    }

    try {
      const response = await axios.get(
        "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/check/parent/" +
          elephantId
      );
      setIsUsed(response.data);
      setLastCheckedId(intId);
    } catch (error) {
      console.warn(error);
      message.warn(
        "The cryptoelephants backend is currently not available. Please try again later."
      );
    }
  };

  return (
    <div className={classes.page}>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Claim</Breadcrumb.Item>
      </Breadcrumb>
      <h1>Juniors</h1>

      <div className={classes.input}>
        <Input
          onPressEnter={checkParent}
          className={classes.check}
          value={elephantId}
          onChange={(event) => setElephantId(event.currentTarget.value)}
          prefix="#"
          placeholder="Elephant ID"
        />
        <Button onClick={checkParent} type="primary">
          Check elephant
        </Button>
      </div>

      <Alert message={title} description={description} type={type} showIcon />
    </div>
  );
};

export default Juniors;
