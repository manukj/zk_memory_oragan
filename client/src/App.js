import React, { useState, useEffect } from 'react';
import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import { ethers } from 'ethers';
import { useWallet } from './context/WalletContext';
import { useZkProof } from './hooks/useZkProof';
import { api } from './services/api';
import './App.css';
import { Form, Input, Button, Card, Row, Col, Collapse, Typography, Badge, Layout, Space, Alert, Empty } from 'antd';
import axios from 'axios';
import { UserOutlined, GlobalOutlined, LinkOutlined, CheckCircleOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { UserIcon, GlobeAltIcon, LinkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FaShieldAlt, FaDatabase, FaLock } from 'react-icons/fa';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { HiDatabase } from 'react-icons/hi';
import { HiLockClosed } from 'react-icons/hi';
import { BsShieldLockFill } from 'react-icons/bs';
import { HiDocumentText } from 'react-icons/hi';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { Header, Content } = Layout;

// Add this utility function at the top of your App.js
const formatDate = (timestamp) => {
  if (!timestamp) return 'No date available';
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

function App() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [messageVisible, setMessageVisible] = useState(false);
  const [poseidonHash, setPoseidonHash] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [allData, setAllData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [form] = Form.useForm();
  const [personalData, setPersonalData] = useState([]);
  const [publicSignal, setPublicSignal] = useState(null);
  const [activeKeys, setActiveKeys] = useState(['1']);
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);

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

  // Fetch all documents
  const fetchAllData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/doc');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  // Fetch personal documents based on DID
  const fetchPersonalData = async (did) => {
    if (!did) return;
    try {
      const response = await axios.get(`http://localhost:3000/doc/${did}`);
      setPersonalData(response.data);
    } catch (error) {
      console.error('Error fetching personal data:', error);
    }
  };

  // Effect to fetch all data on component mount only
  useEffect(() => {
    fetchAllData();
  }, []); // Empty dependency array

  // Effect to fetch personal data when publicSignal changes
  useEffect(() => {
    if (publicSignal && publicSignal[0]) {
      fetchPersonalData(publicSignal[0]);
    }
  }, [publicSignal]); // Only depend on publicSignal

  const onFinish = async (values) => {
    // Your existing form submission logic
    // ... 
    // After successful submission:
    fetchAllData(); // Refresh all data
    if (publicSignal && publicSignal[0]) {
      fetchPersonalData(publicSignal[0]); // Refresh personal data
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setMessageVisible(true);

    // Auto hide after 3 seconds
    setTimeout(() => {
      setMessageVisible(false);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!account) {
        setMessage('Please connect your wallet first');
        setMessageType('info');
        return;
      }

      showMessage('Generating proof...', 'info');
      const proofData = await generateProof(account, signer);

      // Create FormData object to handle both text and file
      const formData = new FormData();


      // Only append file if it exists
      if (file) {
        formData.append('file', file);
      }

      showMessage('Storing data...', 'info');
      const response = await api.storeData(proofData, text, formData);

      setIsVerified(true);
      setText('');
      setFile(null);
      setFileList([]);
      showMessage('Data stored successfully', 'success');

    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
      console.error('Error:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileList([{
        uid: '-1',
        name: selectedFile.name,
        status: 'done',
        size: selectedFile.size,
        type: selectedFile.type
      }]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteData(userId, id);

      // Refresh user data using api service
      const userData = await api.getUserData(userId);
      setUserData(userData);

      showMessage('Data deleted successfully', 'success');

    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed w-full bg-gradient-to-r from-dark-900 to-dark-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="relative h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center">
                <BsShieldLockFill className="h-7 w-7 text-blue-500" />
              </div>
              <div className="space-y-3">
                <h1 className="text-white text-2xl font-bold tracking-tight">
                  ZK Proof Memory Organ
                </h1>
                <p className="text-gray-300 text-sm">
                  Secure. Private. Decentralized.
                </p>
              </div>
            </div>

            <div>
              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 
                           border border-white/20 text-white transition-all"
                >
                  <LinkIcon className="h-5 w-5 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <div className={`h-2 w-2 rounded-full mr-3 ${isVerified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-white font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {messageVisible && message && (
          <div
            className={`fixed top-28 left-1/2 transform -translate-x-1/2 z-40 
                       px-6 py-3 rounded-lg shadow-lg text-white
                       transition-opacity duration-300
                       ${messageType === 'error' ? 'bg-red-500' :
                messageType === 'success' ? 'bg-green-500' :
                  'bg-blue-500'}`}
          >
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <HiDatabase className="h-8 w-8 text-blue-500" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Add to Decentralized Storage
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <label className="text-lg font-medium text-gray-700">
                    Data to Store
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the data you want to store..."
                    disabled={!account}
                    className="w-full h-32 px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 
                             focus:border-blue-500 focus:ring-0 transition-all
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-lg font-medium text-gray-700">
                    Upload File
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      disabled={!account}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl 
                                border-2 border-dashed cursor-pointer transition-all
                                ${!account ? 'bg-gray-50 border-gray-200 cursor-not-allowed' :
                          'border-blue-200 hover:border-blue-500 bg-blue-50'}`}
                    >
                      <UploadOutlined className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">Choose File</span>
                    </label>
                    {fileList.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <span className="text-sm text-gray-600">{fileList[0].name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setFileList([]);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <DeleteOutlined className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 px-2">
                  <HiLockClosed className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">
                    Your data will be encrypted and stored with ZK proof verification
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!account}
                  className="w-full flex items-center justify-center gap-2 
                           bg-blue-500 hover:bg-blue-600 
                           text-white text-lg font-medium
                           py-4 px-6 rounded-2xl
                           transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiDatabase className="h-5 w-5" />
                  <span>Store Securely</span>
                </button>
              </form>
            </div>
          </div>

          {/* Data Display Section */}
          <div className="space-y-6">
            <Collapse
              activeKey={activeKeys}
              onChange={(keys) => {
                setActiveKeys(keys);
              }}
              className="bg-transparent border-none"
            >
              {/* Personal Entries */}
              <Panel
                header={
                  <div className="flex items-center justify-between w-full pr-8">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-6 w-6 text-primary-500" />
                      <h2 className="text-xl font-semibold text-gray-900">Your Secured Data</h2>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {personalData.length}
                    </span>
                  </div>
                }
                key="1"
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="space-y-4">
                  {account ? (
                    isVerified ? (
                      personalData.length > 0 ? (
                        personalData.map((item) => (
                          <div
                            key={item._id}
                            className="bg-gray-50 rounded-xl p-4 group hover:bg-gray-100 transition-colors"
                          >
                            {/* Display text if present */}
                            {item.text ? (
                              <p className="text-gray-800 mb-2">{item.text}</p>
                            ) : item.data ? (
                              <p className="text-gray-800 mb-2">
                                {item.data.toString().split(" ").slice(0, 5).join(" ")}
                              </p>
                            ) : null}

                            {/* Display file info if available */}
                            {item.file && item.file.data && (
                              <div className="mb-2">

                                <a
                                  href={item.file.data}
                                  download={item.file.name || "download"}
                                  className="mt-2 inline-block text-blue-500 hover:underline"
                                >
                                  Download {item.file.name || "File"}
                                </a>
                              </div>
                            )}

                            {/* Fallback if neither text nor file exists */}
                            {!item.text && !item.data && !item.file && (
                              <p className="text-gray-800">No content available</p>
                            )}

                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm text-gray-500">
                                {formatDate(item.created_at)}
                              </span>
                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={!isVerified}
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all disabled:opacity-50"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No entries yet
                        </div>
                      )
                    ) : (
                      <div className="text-center py-12 flex flex-col items-center justify-center">
                        <p className="text-gray-500 mb-6 text-lg">
                          Prove yourself to view your data
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              showMessage("Generating proof...", "info");
                              const proofData = await generateProof(account, signer);
                              const publicSignals = proofData.publicSignals;
                              await fetchPersonalData(publicSignals[0]);
                              setIsVerified(true);
                              showMessage("Verification successful!", "success");
                            } catch (error) {
                              console.error("Verification error:", error);
                              showMessage("Verification failed: " + error.message, "error");
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                        >
                          <HiLockClosed className="h-5 w-5" />
                          <span className="font-medium">Prove Yourself</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Connect your wallet to view your data
                    </div>
                  )}
                </div>

              </Panel>



            </Collapse>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
