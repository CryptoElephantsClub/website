import { useEffect, useState, useCallback } from "react";

import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import {
  Alert,
  Breadcrumb,
  Space,
  Button,
  message,
  Tooltip,
  Spin,
  Table,
  Tag,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import axios from "axios";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  items: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  item: {
    width: "25vw",
    margin: 4,
    "@media screen and (min-width: 800px)": {
      width: "15vw",
    },
  },
  image: {
    cursor: "pointer",
    filter: "brightness(0.3)",
  },
  summary: {
    margin: 12,
    maxWidth: 680,
    alignSelf: "center",
  },
  actions: {
    padding: 8,
    "& button": {
      margin: 4,
    },
  },
  requests: {
    justifyContent: "center",
    flexDirection: "column",
  },
});

const Claim = () => {
  const { isAuthenticated, user } = useMoralis();
  const Web3API = useMoralisWeb3Api();
  const [elephants, setElephants] = useState([]);
  const [requestDone, setRequestDone] = useState(false);
  const [selected, setSelected] = useState([]);
  const [usedElephants, setUsedElephants] = useState([]);
  const [finishedFetching, setFinishedFetching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestRunning, setRequestRunning] = useState(false);
  const [fetchBlocked, setFetchBlocked] = useState(false);
  const classes = useStyles();

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/pending/requests",
        {
          headers: {
            "x-user-message": encodeURI(
              user.attributes.authData.moralisEth.data
            ),
            "x-user-signature": encodeURI(
              user.attributes.authData.moralisEth.signature
            ),
          },
        }
      );
      setPendingRequests(response.data);
    } catch (error) {
      console.warn(error);
      message.warn("CryptoElephants backend is currently not available.");
    }
  }, [user]);

  const fetchUsedElephants = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/used/parents"
      );
      setUsedElephants(response.data);
      setFinishedFetching(true);
    } catch (error) {
      console.warn(error);
      message.warn("CryptoElephants backend is currently not available.");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !requestDone) {
      const fetchNFTs = async () => {
        setFetchBlocked(true);
        const options = {
          chain: "matic",
          address: user.attributes.ethAddress,
          token_address: "0xFE063cF67B1f05F7EaFe351e9a67a290f74dDA9B",
        };
        let nfts = await Web3API.account.getNFTsForContract(options);
        if (nfts.total > 0) {
          nfts = nfts.result.map((nft) => ({
            ...nft,
            metadata: JSON.parse(nft.metadata),
          }));
          for (const nft of nfts) {
            if (!nft.metadata) {
              nft.metadata = (await axios.get(nft.token_uri)).data;
            }

            let location = nft.metadata.image;
            location = location.replace(
              "ipfs://",
              "https://cloudflare-ipfs.com/ipfs/"
            );
            nft.metadata.image = location;
          }
          setElephants(nfts);
        }

        fetchUsedElephants();
        fetchPendingRequests();
        setRequestDone(true);
      };

      if (!fetchBlocked) {
        fetchNFTs();
      }
    }
  }, [
    fetchBlocked,
    isAuthenticated,
    Web3API,
    user,
    requestDone,
    fetchUsedElephants,
    fetchPendingRequests,
  ]);

  if (!isAuthenticated) {
    return (
      <>
        <Alert
          style={{
            maxWidth: 600,
            alignSelf: "center",
          }}
          message="Access only for CryptoElephantsClub holders"
          description="Please use the wallet icon in the upper right corner to login with your wallet"
          type="warning"
          showIcon
        />
      </>
    );
  }

  const toggleSelection = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((elephant) => elephant !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const selectAll = () => {
    const elephantIds = elephants.map((elephant) => elephant.metadata.name);
    setSelected(
      elephantIds.filter((elephantId) => !usedElephants.includes(elephantId))
    );
  };

  const deselectAll = () => {
    setSelected([]);
  };

  const sendRequest = async () => {
    try {
      setRequestRunning(true);
      await axios.post(
        "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/juniors/request",
        {
          parents: selected.length % 2 === 1 ? selected.slice(1) : selected,
        },
        {
          headers: {
            "x-user-message": encodeURI(
              user.attributes.authData.moralisEth.data
            ),
            "x-user-signature": encodeURI(
              user.attributes.authData.moralisEth.signature
            ),
          },
        }
      );
    } catch (error) {
      console.log(error);
      message.warn("Your request failed.");
    } finally {
      fetchUsedElephants();
      fetchPendingRequests();
      deselectAll();
      setRequestRunning(false);
    }
  };

  const columns = [
    {
      title: "Wallet",
      dataIndex: "wallet",
      key: "wallet",
      ellipsis: true,
    },
    {
      title: "Parents",
      dataIndex: "parents",
      key: "parents",
      render: (parents) => (
        <>
          {parents.map((parent) => (
            <Tag color="geekblue" key={parent}>
              {parent}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Juniors",
      dataIndex: "juniors",
      key: "juniors",
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (done) => {
        if (done) {
          return <Tag color="green">Done</Tag>;
        } else {
          return <Tag color="yellow">Pending</Tag>;
        }
      },
    },
  ];

  const dataSource = [];

  for (let pendingRequest of pendingRequests) {
    dataSource.push({
      key: dataSource.length,
      wallet: pendingRequest.wallet,
      parents: pendingRequest.parents,
      state: pendingRequest.fulfulled,
      juniors: Math.floor(pendingRequest.parents.length / 2),
    });
  }

  return (
    <>
      <div
        className={classes.requests}
        style={
          pendingRequests.length > 0 ? { display: "flex" } : { display: "none" }
        }
      >
        <h1>Your request overview</h1>
        <Table dataSource={dataSource} columns={columns} />
      </div>
      <h1>Choose your elephants</h1>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Claim</Breadcrumb.Item>
      </Breadcrumb>
      <Alert
        message={`You've selected ${
          selected.length
        } elephants which will result in a request for ${Math.floor(
          selected.length / 2
        )} junior elephants. When the number of elephants is odd, one elephant will be randomly deselected`}
        type="success"
        className={classes.summary}
        action={
          <Space>
            <Button
              disabled={selected.length < 2 || requestRunning}
              size="small"
              type="primary"
              onClick={sendRequest}
              loading={requestRunning}
            >
              Submit
            </Button>
          </Space>
        }
      />
      <div className={classes.actions}>
        <Button onClick={selectAll}>Select all</Button>
        <Button onClick={deselectAll}>Deselect all</Button>
      </div>

      <div className={classes.items}>
        {finishedFetching ? (
          elephants.map((elephant) => {
            const { image, name } = elephant.metadata;

            if (usedElephants.includes(name)) {
              return (
                <Tooltip
                  key={name}
                  title={`Elephant ${name} was already used to request juniors`}
                >
                  <div className={classes.item}>
                    <img
                      width="100%"
                      className={classes.image}
                      style={{
                        filter:
                          "grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(0.8)",
                        cursor: "unset",
                      }}
                      src={image}
                      alt={name}
                    />
                  </div>
                </Tooltip>
              );
            } else {
              return (
                <div className={classes.item} key={name}>
                  <img
                    width="100%"
                    className={classes.image}
                    style={
                      selected.includes(name)
                        ? { filter: "brightness(1)" }
                        : { filter: "brightness(0.3)" }
                    }
                    onClick={() => toggleSelection(name)}
                    src={image}
                    alt={name}
                  />
                </div>
              );
            }
          })
        ) : (
          <Spin />
        )}
      </div>
    </>
  );
};

export default Claim;
