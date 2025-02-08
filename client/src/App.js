import React, { useState, useEffect } from 'react';
import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import { ethers } from 'ethers';
import { useWallet } from './context/WalletContext';
import { useZkProof } from './hooks/useZkProof';
import { api } from './services/api';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [poseidonHash, setPoseidonHash] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [allData, setAllData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get wallet and ZK proof functions from hooks
  const { account, signer, connectWallet } = useWallet();
  const { generateProof } = useZkProof();

  // Add this new useEffect at the top of other useEffects
  useEffect(() => {
    const checkWalletConnection = async () => {
      setIsConnecting(true);
      try {
        await connectWallet();
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        setMessage('Failed to connect to wallet automatically');
        setMessageType('error');
      } finally {
        setIsConnecting(false);
      }
    };

    checkWalletConnection();
  }, []); // Empty dependency array means this runs once on mount

  // Check verification and load data when userId changes
  useEffect(() => {
    if (!userId) return;

    const checkVerification = async () => {
      try {
        const response = await fetch(`http://localhost:3000/isVerified/${userId}`);
        const data = await response.json();
        setIsVerified(data.isVerified);
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    const loadData = async () => {
      try {
        // Use the api service instead of direct fetch
        const [allData, userData] = await Promise.all([
          api.getAllData(),
          api.getUserData(userId)
        ]);
        
        setAllData(allData);
        setUserData(userData);
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage('Error loading data: ' + error.message);
        setMessageType('error');
      }
    };

    checkVerification();
    loadData();
  }, [userId]);

  // Initialize Poseidon with wallet address
  useEffect(() => {
    const initPoseidon = async () => {
      if (!account) return;

      try {
        const poseidon = await buildPoseidon();
        // eslint-disable-next-line no-undef
        const hash = poseidon([BigInt(parseInt(account.slice(2), 16))]);
        const hashStr = poseidon.F.toString(hash);
        setPoseidonHash(hashStr);
      } catch (error) {
        console.error('Error initializing Poseidon:', error);
      }
    };

    initPoseidon();
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // First ensure wallet is connected
      if (!account) {
        setMessage('Please connect your wallet first');
        setMessageType('info');
        return;
      }

      setMessage('Generating proof...');
      setMessageType('info');

      const proofData = await generateProof(account, signer);
      
      setMessage('Storing data...');
      const response = await api.storeData(proofData, text);
       console.log(response);
      // Update state with response
      // setUserId(response.userId);
      setIsVerified(true);
      setText('');
      // setUserData(prev => [...prev, response.data]);
      setMessage('Data stored successfully');
      setMessageType('success');

    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteData(userId, id);
      
      // Refresh user data using api service
      const userData = await api.getUserData(userId);
      setUserData(userData);
      
      setMessage('Data deleted successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Private Data Storage with ZK Verification</h1>
        
        <div className="wallet-info">
          {!account ? (
            <button onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <>
              <p>Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
              {userId && (
                <p className="user-id">Your Anonymous ID: {userId.slice(0, 6)}...{userId.slice(-4)}</p>
              )}
            </>
          )}
          <span className={`verification-status ${isVerified ? 'verified' : 'unverified'}`}>
            ({isVerified ? 'Verified' : 'Unverified'})
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text"
            disabled={!account}
          />
          <button type="submit" disabled={!account}>
            Store Data
          </button>
        </form>

        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}

        <div className="data-section">
          <h2>Your Data</h2>
          <div className="data-list">
            {userData.map(item => (
              <div key={item.id} className="data-item">
                <span>{item.text}</span>
                <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
                {isVerified && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

          <h2>All Users' Data</h2>
          <div className="data-list">
            {allData.map(item => (
              <div key={item.id} className="data-item">
                <span>{item.text}</span>
                <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
