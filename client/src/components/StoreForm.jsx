import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { useToast } from "./ui/toast"
import { Toaster } from "./ui/toast"
import { ProofService } from '../services/proofService'

export function StoreForm() {
  const [inputData, setInputData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [signer, setSigner] = useState(null)
  const { toast } = useToast()

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const { signer, account } = await ProofService.connectWallet()
      setWalletConnected(true)
      setAccount(account)
      setSigner(signer)
      toast({
        title: "Success",
        description: "Wallet connected successfully",
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to connect wallet",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputData.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some data",
      })
      return
    }

    if (!walletConnected) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Generate proof
      const proofData = await ProofService.generateProof(signer, account)
      
      // Store data with proof verification
      const response = await fetch('http://localhost:3000/doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: inputData,
          ...proofData
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to store data')
      }

      toast({
        title: "Success",
        description: result.message,
      })
      
      setInputData('')
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to store data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Store Data</CardTitle>
        </CardHeader>
        <CardContent>
          {!walletConnected ? (
            <Button 
              onClick={connectWallet} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  type="text"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="Enter data to store"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Store'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
} 