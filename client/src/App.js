import { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from './lib/utils';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/hello');
        setMessage(response.data.message);
      } catch (error) {
        console.error('Error fetching message:', error);
        setMessage('Error loading message');
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center",
      "bg-background text-foreground"
    )}>
      <div className={cn(
        "rounded-lg border bg-card p-8",
        "shadow-lg transition-all hover:shadow-xl"
      )}>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-r from-gray-900 to-gray-600 text-transparent bg-clip-text">
          Hello World from Client!
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-gray-600">
          Message from server: {message}
        </p>
      </div>
    </div>
  );
}

export default App; 