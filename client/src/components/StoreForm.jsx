import { useState, useCallback } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { useToast } from "./ui/toast"
import { Toaster } from "./ui/toast"
import { ProofService } from '../services/proofService'

export function StoreForm() {
  const [inputData, setInputData] = useState('')
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [signer, setSigner] = useState(null)
  const { toast } = useToast()
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = (file) => {
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File type not supported. Please upload JPG, PNG, PDF, or TXT files.",
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 5MB",
      })
      return
    }

    setFile(file)
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputData.trim() && !file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some data or upload a file",
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
    setUploadProgress(0)
    
    try {
      const proofData = await ProofService.generateProof(signer, account)
      
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      formData.append('data', inputData)
      Object.keys(proofData).forEach(key => {
        formData.append(key, proofData[key])
      })

      const response = await fetch('http://localhost:3000/doc', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        },
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
      setFile(null)
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to store data. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
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
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                    ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="hidden"
                    accept={ALLOWED_TYPES.join(',')}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <span>Drag and drop a file here, or click to select</span>
                      <span className="text-sm text-muted-foreground">
                        Supported: JPG, PNG, PDF, TXT (max 5MB)
                      </span>
                    </div>
                  </label>
                </div>
                {file && (
                  <div className="text-sm text-muted-foreground">
                    Selected file: {file.name}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
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