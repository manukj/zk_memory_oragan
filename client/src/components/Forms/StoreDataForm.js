import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useZkProof } from '../../hooks/useZkProof';
import { api } from '../../services/api';
import Message from '../Common/Message';

export default function StoreDataForm({ onSuccess }) {
    const [text, setText] = useState('');
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

            setMessage('Generating proof...');
            setMessageType('info');

            const proofData = await generateProof(account, signer);
            
            setMessage('Storing data...');
            const response = await api.storeData(proofData, text);

            setText('');
            onSuccess(response);
            setMessage('Data stored successfully');
            setMessageType('success');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
            setMessageType('error');
            console.error('Error:', error);
        }
    };

    return (
        <div className="store-data-form">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text"
                    disabled={!account}
                />
                <button 
                    type="submit" 
                    disabled={!account || isGenerating}
                >
                    {isGenerating ? 'Processing...' : 'Store Data'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
} 