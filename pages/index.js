import React from "react";
import { ethers } from "ethers";
import contractAbi from "./abi/NFT.json";
import {
  Button,
  Card,
  Container,
  Nav,
  Navbar,
  Form,
  Spinner,
} from "react-bootstrap";

const contractAddress = "0x263f866955fc3FD91E5967f9Aec4d1d8251222b5"; // Replace with your contract address
const SIGNING_DOMAIN_NAME = "LAZY-NFT";
const SIGNING_DOMAIN_VERSION = "1";
const chainId = 44787;
const domain = {
  name: SIGNING_DOMAIN_NAME,
  version: SIGNING_DOMAIN_VERSION,
  verifyingContract: contractAddress,
  chainId,
};

const types = {
  LazyNFTVoucher: [
    { name: "tokenId", type: "uint256" },
    { name: "price", type: "uint256" },
    { name: "uri", type: "string" },
    { name: "buyer", type: "address" },
  ],
};

function App() {
  const [walletAddress, setWalletAddress] = React.useState(null);
  const [spinner, setSpinner] = React.useState(false);

  const [voucher, setVoucher] = React.useState(null);
  async function createVoucher(tokenId, price, uri, buyer) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const voucher = { tokenId, price, uri, buyer };
    const signature = await signer._signTypedData(domain, types, voucher);

    return {
      ...voucher,
      signature,
    };
  }
  async function handleMintClick() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setSpinner(true);

      const voucher1 = await createVoucher(0, 0, "https://gateway.pinata.cloud/ipfs/QmaczyZ79XE7MJ37TEAdngNXtBTxouxpitaCLCiTQdwkih/0.json", address);
      setVoucher(voucher1);
      console.log(voucher1);
      console.log(JSON.stringify([
        voucher1.tokenId,
        voucher1.price,
        voucher1.uri,
        voucher1.buyer,
        voucher1.signature,
      ]))
      setSpinner(false);
    } catch (err) {
      console.error(err);
    }
  }

  const connectToWallet = async () => {
    try {
      await window.ethereum.enable();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      console.log("Wallet connected:", walletAddress);
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectFromWallet = async () => {
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
        accounts: [],
      });
      setWalletAddress(null);
      console.log("Wallet disconnected");
    } catch (error) {
      console.error(error);
    }
  };
  React.useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log("Wallet connected:", walletAddress);
      } else {
        console.log("Wallet not connected");
      }
    };
    checkWalletConnection();
  }, []);
  const mintNFT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      setSpinner(true);
      const voucherData = JSON.stringify([
        voucher.tokenId,
        voucher.price,
        voucher.uri,
        voucher.buyer,
        voucher.signature,
      ]);
      await contract.safeMint(
        [voucher.tokenId,voucher.price,voucher.uri,voucher.buyer,voucher.signature],{ from: walletAddress }
      );
      setSpinner(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">NFT Minter</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {!walletAddress ? (
              <>
                <Nav.Link href="#" onClick={connectToWallet}>
                  Connect
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link href="#" onClick={disconnectFromWallet}>
                  Disconnect
                </Nav.Link>
              </>
            )}
            <Nav.Link href="viewnft">View NFTs</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container>
        <Card style={{ width: "18rem" }} className="mx-auto mt-5">
          <Card.Img
            variant="top"
            src={`https://gateway.pinata.cloud/ipfs/QmV5LEUFVNqnbqg8PLv7Ma2H55ThsgvdmMhCGXRMiDYdVR/0.png`}
          />
          <Card.Body>
            <Form>
              {walletAddress && (
                <>
                  {spinner === false ? (
                    <Button variant="primary" onClick={handleMintClick}>
                      Mint Voucher
                    </Button>
                  ) : (
                    <Button variant="primary" disabled>
                      <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Loading...
                    </Button>
                  )}
                  {spinner === false ? (
                    <Button
                      variant="primary"
                      onClick={mintNFT}
                      disabled={voucher !== null ? false : true}
                    >
                      Mint NFT
                    </Button>
                  ) : (
                    <Button variant="primary" disabled>
                      <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Loading...
                    </Button>
                  )}
                </>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default App;
