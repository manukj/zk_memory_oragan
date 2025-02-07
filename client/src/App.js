import { StoreForm } from "./components/StoreForm"
import './styles/App.css'

function App() {
  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="app-title">
          Data Storage App
        </h1>
        <StoreForm />
      </div>
    </div>
  )
}

export default App 