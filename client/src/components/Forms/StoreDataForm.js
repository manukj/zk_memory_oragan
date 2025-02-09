import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useZkProof } from '../../hooks/useZkProof';
import { api } from '../../services/api';
import Message from '../Common/Message';

export default function StoreDataForm({ onSuccess }) {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const { account, signer } = useWallet();
    const { generateProof, isGenerating } = useZkProof();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!account) {
                setMessage('Please connect your wallet first');
                setMessageType('info');
                return;
            }

            if (!text && !file) {
                setMessage('Please enter text or upload a file');
                setMessageType('info');
                return;
            }

            setMessage('Generating proof...');
            setMessageType('info');

            const proofData = await generateProof(account, signer);
            
            setMessage('Storing data...');
            let response;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('proofData', JSON.stringify(proofData));
            
            response = await api.storeData(proofData, text, formData);
            
            setText('');
            setFile(null);
            onSuccess(response);
            setMessage('Data stored successfully');
            setMessageType('success');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
            setMessageType('error');
            console.error('Error:', error);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setText(''); // Clear text input when file is selected
        }
    };

    return (
        <div className="store-data-form">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setFile(null); // Clear file when text is entered
                    }}
                    placeholder="Enter your text"
                    disabled={!account || file}
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={!account || text.length > 0}
                />
                <button 
                    type="submit" 
                    disabled={!account || isGenerating || (!text && !file)}
                >
                    {isGenerating ? 'Processing...' : 'Store Data'}
                </button>
            </form>
            {message && <Message type={messageType}>{message}</Message>}
        </div>
    );
} 