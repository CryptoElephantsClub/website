import { useState, useEffect, useMemo } from "react";
import { Alert, message, Tag, Table, Spin, Button } from "antd";
import { useMoralis } from "react-moralis";
import axios from "axios";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  requests: {
    justifyContent: "center",
    flexDirection: "column",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    "& > button": {
      marginBottom: 12,
    },
    "& > button:last-child": {
      marginBottom: 0,
    },
  },
});

const Admin = () => {
  const { isAuthenticated, user, Moralis } = useMoralis();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestRunning, setRequestRunning] = useState(false);
  const [requestDone, setRequestDone] = useState(false);
  const [runningRequests, setRunningRequests] = useState([]);
  const classes = useStyles();

  const whitelist = useMemo(
    () => ["0x7ab51dfe5d2efbd7d01237a84f153fd578563e4f"],
    []
  );

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setRequestRunning(true);
        const response = await axios.get(
          "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/juniors/requests",
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
        message.warn(
          "CryptoElephants backend is currently not available. Please try again later"
        );
      } finally {
        setRequestDone(true);
        setRequestRunning(false);
      }
    };

    if (
      isAuthenticated &&
      !requestDone &&
      whitelist.includes(user.attributes.ethAddress.toLowerCase())
    ) {
      fetchPendingRequests();
    }
  }, [user, requestDone, isAuthenticated, whitelist]);

  if (
    !isAuthenticated ||
    !whitelist.includes(user.attributes.ethAddress.toLowerCase())
  ) {
    return (
      <>
        <Alert
          style={{
            maxWidth: 600,
            alignSelf: "center",
          }}
          message="Access only for CryptoElephantsClub admins"
          description="Please use the wallet icon in the upper right corner to login with an admin wallet"
          type="warning"
          showIcon
        />
      </>
    );
  }

  if (requestRunning) {
    return <Spin />;
  }

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
            <Tag key={`parent-${parent}`} color="geekblue">
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
      render: (juniors) => {
        if (typeof juniors === "number") {
          return juniors;
        } else {
          return juniors.map((junior) => (
            <Tag key={`junior-${junior.id}`} color="green">
              {junior.id}
            </Tag>
          ));
        }
      },
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (state, record) => {
        if (state) {
          return (
            <Tag key={`state-${record.id}`} color={state.color}>
              {state.text}
            </Tag>
          );
        }
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => {
        if (typeof record.juniors === "number") {
          return (
            <Button
              key={`button-${record.id}`}
              disabled={runningRequests.includes(record.id)}
              loading={runningRequests.includes(record.id)}
              onClick={async () => {
                setRunningRequests([...runningRequests, record.id]);
                try {
                  const response = await axios.post(
                    "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/assign/juniors",
                    {
                      juniorRequest: record.id,
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

                  setPendingRequests([
                    ...pendingRequests.filter(
                      (pendingRequest) => pendingRequest.id !== record.id
                    ),
                    response.data,
                  ]);
                } catch (error) {
                  message.warn(error);
                } finally {
                  setRunningRequests(
                    runningRequests.filter(
                      (runningRequest) => runningRequest !== record.id
                    )
                  );
                }
              }}
            >
              {runningRequests.includes(record.id) ? "" : "Send Juniors"}
            </Button>
          );
        } else {
          return (
            <div className={classes.buttons} key={`button-${record.id}`}>
              {record.juniors.map((junior) => (
                <Button
                  key={record.id + junior.token_id}
                  disabled={runningRequests.includes(
                    record.id + junior.token_id
                  )}
                  loading={runningRequests.includes(
                    record.id + junior.token_id
                  )}
                  onClick={async () => {
                    setRunningRequests([
                      ...runningRequests,
                      record.id + junior.token_id,
                    ]);
                    const options = {
                      type: "erc721",
                      receiver: record.wallet,
                      contractAddress: junior.token_address,
                      tokenId: Number(junior.token_id),
                    };
                    console.log("Start transaction");
                    console.log(options);

                    try {
                      const transaction = await Moralis.transfer(options);
                      const result = await transaction.wait();

                      console.log(result);

                      await axios.post(
                        "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/finished/transaction",
                        {
                          juniorRequest: record.id,
                          juniorId: junior.token_id,
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
                      if (error.code === -32603) {
                        message.info(
                          "You are not the owner of this token. This usally means that an earlier request finished in the background."
                        );

                        await axios.post(
                          "https://us-central1-cryptoelephantsclub.cloudfunctions.net/api/finished/transaction",
                          {
                            juniorRequest: record.id,
                            juniorId: junior.token_id,
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
                      } else {
                        message.warn(error.message);
                        message.info(
                          "A failed transaction may only failed because it needs more time. Just wait a litte bit longer and/or try again later."
                        );
                      }
                    } finally {
                      setRunningRequests(
                        runningRequests.filter(
                          (runningRequest) =>
                            runningRequest !== record.id + junior.token_id
                        )
                      );
                    }
                  }}
                >
                  {runningRequests.includes(record.id + junior.token_id)
                    ? ""
                    : `Send ${junior.id}`}
                </Button>
              ))}
            </div>
          );
        }
      },
    },
  ];

  const dataSource = [];

  for (let pendingRequest of pendingRequests) {
    let state = {
      color: "yellow",
      text: "Pending",
    };

    if (typeof pendingRequest.juniors !== "undefined") {
      if (pendingRequest.fulfulled) {
        state = {
          color: "green",
          text: "Done",
        };
      } else {
        state = {
          color: "blue",
          text: "In Progress",
        };
      }
    }

    dataSource.push({
      id: pendingRequest.id,
      key: dataSource.length,
      wallet: pendingRequest.wallet,
      parents: pendingRequest.parents,
      state: state,
      juniors:
        pendingRequest.juniors || Math.floor(pendingRequest.parents.length / 2),
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
    </>
  );
};

export default Admin;
