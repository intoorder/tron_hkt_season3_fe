import "./style.css";
import { useState } from "react";
import { Zen } from "./components/Zen";
import axios from "axios";
import { apiConfig } from "./config";
import { codeUtils } from "./utils";
import { Button } from "./components/Button";
import { toast } from "react-toastify";
import { authUtils } from "./utils";

const MINIMUM_WITHDRAW_BALANCE = 100;

export const App = () => {
  const [hasLoggedIn, setLoggedIn] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isShowingHistory, setShowingHistory] = useState(false);
  const [zenData, setZenData] = useState(null);
  const [myDetails, setMyDetails] = useState({
    name: null,
    address: null,
    balance: 0,
    frozenBalance: 0,
    network: null,
    link: false,
  });

  const updateBalance = (balance) => {
    setTokenBalance(balance);
  }

  const signMessage = async () => {
    // CREATE SIGNATURE: TODO: REPLACE HELLOWORD WITH OUR SIGNATURE
    var str = "Welcome to NextBrainApp";
    // convert to hex format and remove the beginning "0x"
    var hexStrWithout0x = window.tronWeb.toHex(str).replace(/^0x/, "");
    // conert hex string to byte array
    var byteArray = window.tronWeb.utils.code.hexStr2byteArray(hexStrWithout0x);
    // keccak256 computing, then remove "0x"
    var strHash = window.tronWeb.sha3(byteArray).replace(/^0x/, "");
    // sign
    var signedStr = await window.tronWeb.trx.sign(strHash);
    var tail = signedStr.substring(128, 130);
    if (tail == "01") {
      signedStr = signedStr.substring(0, 128) + "1c";
    } else if (tail == "00") {
      signedStr = signedStr.substring(0, 128) + "1b";
    }

    const { data } = await axios.post(
      `${apiConfig.IO_BACKEND_API}/auth/login`,
      {
        wallet_address: window.tronWeb.defaultAddress.base58,
        signature: signedStr,
      }
    );
    if (data.data && data.data.token) {
      setLoggedIn(true);
      authUtils.setToken(data.data.token);
      setTokenBalance(parseInt(data.data.token_total, 10));
    }
  };

  const getBalance = async () => {
    //if wallet installed and logged , getting TRX token balance
    if (window.tronWeb && window.tronWeb.ready) {
      let walletBalances = await window.tronWeb.trx.getAccount(
        window.tronWeb.defaultAddress.base58
      );
      return walletBalances;
    } else {
      return 0;
    }
  };

  const connectWallet = async () => {
    if (window.tronWeb) {
      //checking if wallet injected
      if (window.tronWeb.ready) {
        let userBalance = await getBalance();
        let tempFrozenBalance = 0;

        if (!userBalance.balance) {
          userBalance.balance = 0;
        }
        //we have wallet and we are logged in
        toast("Please confirm on TronLink");
        setMyDetails({
          name: window.tronWeb.defaultAddress.name,
          address: window.tronWeb.defaultAddress.base58,
          balance: userBalance.balance / 1000000,
          frozenBalance: tempFrozenBalance / 1000000,
          network: window.tronWeb.fullNode.host,
          link: true,
        });

        await signMessage();
      } else {
        toast("Please unlock your wallet");
        setMyDetails({
          name: null,
          address: null,
          balance: 0,
          frozenBalance: 0,
          network: null,
          link: false,
        });
      }
    } else {
      toast("Wallet not found");
    }
  };

  const withdraw = async () => {
    toast("Withdrawing...");
    const { data } = await axios.post(
      `${apiConfig.IO_BACKEND_API}/withdraw`,
      {},
      authUtils.getHeader()
    );
    if (data.data?.withdrawal && data.data.withdrawal.amount) {
      toast(
        `You have withdrawed $${data.data.withdrawal.amount} $NBT successfully`
      );
      setShowingHistory(true);
      setTokenBalance(data.data.token_total);
    }
  };

  const startZen = async () => {
    const { data } = await axios.post(
      `${apiConfig.IO_BACKEND_API}/meditation/start`,
      {},
      authUtils.getHeader()
    );
    if (data?.data) {
      const duration = codeUtils.decode(data.data);
      setZenData({ duration });
    }
  };

  return (
    <div className="leading-normal tracking-normal text-blue-400">
      <video
        src="videos/ocean.mp4"
        type="video/mp4"
        autoPlay
        muted
        loop
        id="myVideo"
      />

      <div className="content h-full p-6">
        <div className="w-full container mx-auto">
          <div className="w-full flex items-center justify-between">
            <a
              className="flex items-center text-blue-200 no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
              href="#"
            >
              Next
              <span className="bg-clip-text text-white">Brain</span>
            </a>

            <div className="flex w-1/2 justify-end items-center content-center">
              {myDetails?.address && isShowingHistory && (
                <a
                  href={`https://shasta.tronscan.org/#/address/${myDetails.address}`}
                  target="_blank"
                >
                  Withdraw History
                </a>
              )}
              {tokenBalance ? (
                <span className="ml-8">Balance: ${tokenBalance} NBT</span>
              ) : null}
              {tokenBalance && tokenBalance >= MINIMUM_WITHDRAW_BALANCE ? (
                <span className="ml-8">
                  <Button onClick={withdraw}>Withdraw</Button>
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {zenData ? (
          <Zen duration={zenData.duration} setBalance={updateBalance} />
        ) : (
          <div className="container mx-auto flex flex-wrap flex-col md:flex-row items-center">
            <div className="py-32 flex flex-col w-full justify-center overflow-y-hidden items-center">
              <h1 className="my-4 text-3xl md:text-5xl text-white font-bold leading-tight text-center uppercase">
                PRACTICE MINDFULNESS AND EARN TOKENS
              </h1>

              <div className="mt-12">
                {hasLoggedIn ? (
                  <div className="flex flex-col items-center">
                    <h2 className="text-lg text-center mb-10">
                      Listen and count the correct number of drop. You will get
                      reward if answer correctly.
                    </h2>
                    <Button onClick={startZen}>Start</Button>
                  </div>
                ) : window.tronWeb ? (
                  <Button onClick={connectWallet}>Login with TronLink</Button>
                ) : (
                  <a href="https://www.tronlink.org/" target="_blank">
                    <Button>Install TronLink Wallet</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
