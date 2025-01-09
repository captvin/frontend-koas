import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { io } from 'socket.io-client';
import axios from "./axios";

function App() {
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpData, setOtpData] = useState("");
  const [token, setToken] = useState("")

  const socket = io("http://localhost:8080"); // URL backend Anda

  useEffect(() => {
    const tkn = `token${Date.now()}`
    setToken(tkn)
  }, [])

  socket.on("reichiveOTP", (data) => {
    // console.log(data);
    setOtpData(data.otp); // Simpan data OTP ke state
    setIsModalOpen(true); // Tampilkan modal
  });

  socket.on("verifyOtpSuccess", () => {
    // console.log(data);
    // setOtpData(data.otp); // Simpan data OTP ke state
    setIsModalOpen(false); // Tampilkan modal
  });

  const buttonHandler = async () => {
    socket.emit('joinRoom', token)
    const dt = {
      token
    }
    await axios.post('/otp', dt)
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={buttonHandler}>
          tekan 
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>


      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>OTP Received</h2>
            <p>Your OTP is: {otpData}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
