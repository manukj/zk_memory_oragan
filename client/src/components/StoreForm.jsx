import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { useToast } from "./ui/toast"
import { Toaster } from "./ui/toast"

export function StoreForm() {
  const [inputData, setInputData] = useState('')
  const { toast } = useToast()

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
    
    try {
      const response = await fetch('http://localhost:3001/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputData }),
      })

      const result = await response.json()
      
      toast({
        title: "Success",
        description: result.message,
      })
      
      setInputData('') // Clear input after successful submission
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to store data. Please try again.",
      })
    }
  }

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Store Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter data to store"
            />
            <Button type="submit">
              Store
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
} 