import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const connectWallet = useCallback(async () => {
        setIsConnecting(true);
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const account = await signer.getAddress();
            
            setAccount(account);
            setSigner(signer);

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setSigner(provider.getSigner());
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });

            return { signer, account };
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        } finally {
            setIsConnecting(false);
        }
    }, []);

    return (
        <WalletContext.Provider value={{
            account,
            signer,
            isConnecting,
            connectWallet
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext); 