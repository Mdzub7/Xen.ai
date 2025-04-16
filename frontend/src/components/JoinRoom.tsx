import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoom = () => {
  const [userId] = useState<string>(
    localStorage.getItem('userId') || `user-${Math.random().toString(36).substring(7)}`
  );
  const [roomId, setRoomId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const handleJoinRoom = async () => {
    if (!roomId || !password) {
      alert('Please enter both Room ID and Password');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/join-collab-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          password: password,
          user_id: userId
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Store room info for the WebSocket connection
        localStorage.setItem('roomId', roomId);
        localStorage.setItem('roomPassword', password);
        
        // Navigate to editor
        navigate(`/collab/${roomId}`);
      } else {
        alert(`Failed to join room: ${data?.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Join a Room</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter Room ID"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter Room Password"
          />
        </div>
        
        <p className="mb-4 text-sm text-gray-600">Your User ID: <span className="font-mono">{userId}</span></p>
        
        <button
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleJoinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;