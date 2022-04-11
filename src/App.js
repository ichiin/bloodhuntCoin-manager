import './App.css';
import { ethers, utils } from "ethers";
import abi from "./contracts/BloodhuntCoin.json";
import { useState, useEffect } from 'react';

function App() {
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [inputValue, setInputValue] = useState({ walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
    const [isTokenOwner, setIsTokenOwner] = useState(false);
    const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
    const [userWalletAddress, setUserWalletAddress] = useState(null);
  
    const contractAddress = '0xce8dd61b143bEc85458bF08Ab0370c154a5154cd';
    const contractABI = abi.abi

    const checkIfWalletIsConnected = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          const account = accounts[0];
          setIsWalletConnected(true);
          setUserWalletAddress(account);
          console.log("Account Connected: ", account);
        } else {
          console.log("No Metamask detected");
        }
      } catch (error) {
        console.log(error);
      }
    }

    const getTokenInfo = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
          const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
          let tokenName = await tokenContract.name();
          let tokenSymbol = await tokenContract.symbol();
          let tokenOwner = await tokenContract.owner();
          let tokenSupply = await tokenContract.totalSupply();
          tokenSupply = utils.formatEther(tokenSupply)
  
          setTokenName(`${tokenName}`);
          setTokenSymbol(tokenSymbol);
          setTokenTotalSupply(tokenSupply);
          setTokenOwnerAddress(tokenOwner);
  
          if (account.toLowerCase() === tokenOwner.toLowerCase()) {
            setIsTokenOwner(true)
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    const sendTokens = async (event) => {
      event.preventDefault();
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
          
          const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
          console.log("Sending tokens...");
          await txn.wait();
          console.log("Tokens Transfered", txn.hash);
    
        } else {
          console.log("Ethereum object not found, install Metamask.");
        }
      } catch (error) {
        console.log(error);
      }
    }

    const burnTokens = async (event) => {
      event.preventDefault();
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount));
          console.log("Burning tokens...");
          await txn.wait();
          console.log("Tokens burned...", txn.hash);
  
          let tokenSupply = await tokenContract.totalSupply();
          tokenSupply = utils.formatEther(tokenSupply)
          setTokenTotalSupply(tokenSupply);
  
        } else {
          console.log("Ethereum object not found, install Metamask.");
        }
      } catch (error) {
        console.log(error);
      }
    }
  
    const mintTokens = async (event) => {
      event.preventDefault();
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
          let tokenOwner = await tokenContract.owner();
          const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount));
          console.log("Minting tokens...");
          await txn.wait();
          console.log("Tokens minted...", txn.hash);
  
          let tokenSupply = await tokenContract.totalSupply();
          tokenSupply = utils.formatEther(tokenSupply)
          setTokenTotalSupply(tokenSupply);
  
        } else {
          console.log("Ethereum object not found, install Metamask.");
        }
      } catch (error) {
        console.log(error);
      }
    }

    const handleInputChange = (event) => {
      setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
    }
  

    useEffect(() => {
      checkIfWalletIsConnected();
      getTokenInfo();
    }, [isWalletConnected])

  return (
    <div className="App">
      <header className="App-header">
        Bloodhunt coin manager - HNT 
      </header>
      <div id='main'>
        <div id='content'>
        <h1>As we wait for nightfall, explore the new HNT token...</h1>
        {isWalletConnected ? <div>
          <h2>Name: {tokenName} - Symbol: {tokenSymbol} Supply: {tokenTotalSupply}</h2>
          <h3>Your address : <div style={{ display: 'inline', color: 'red'}}>{userWalletAddress}</div></h3>
          <div>
            <h3>Send {tokenSymbol} tokens</h3>
            <input onChange={handleInputChange} name="transferAmount" placeholder='Number of tokens to send' type="number"/>
            <input onChange={handleInputChange} name="walletAddress" placeholder='Adress to send the tokens to' type="text"/>
            <button onChange={handleInputChange} onClick={sendTokens}>Send</button>
          </div>
          {isTokenOwner && <div>
            <h3>Mint {tokenSymbol} tokens</h3>
            <input onChange={handleInputChange} name="mintAmount" placeholder='Number of tokens to mint' type="number"/>
            <button onClick={mintTokens}>Mint</button>
          </div>}
          {isTokenOwner && <div>
            <h3>Burn {tokenSymbol} tokens</h3>
            <input onChange={handleInputChange} name="burnAmount" placeholder='Number of tokens to burn' type="number"/>
            <button onClick={burnTokens}>Burn</button>
          </div>}
        </div> : <h2>Connect your Metamask account to access the app.</h2>}
        </div>
      </div>
      <footer>Contract address: {contractAddress} - Owner: {tokenOwnerAddress}</footer>
    </div>
  );
}

export default App;
