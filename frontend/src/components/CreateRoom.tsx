import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateRoom = () => {
  const [userId, setUserId] = useState<string>(() => uuidv4()); // Generate a unique userId for each session

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/create-collab-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      if (response.ok && data.room_id && data.password) {
        localStorage.setItem('roomId', data.room_id);
        localStorage.setItem('roomPassword', data.password);
        navigate(`/collab/${data.room_id}`);
        alert(`Room created! Share these details with collaborators:\nRoom ID: ${data.room_id}\nPassword: ${data.password}`);
      } else {
        alert(`Failed to create room: ${data?.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Create a New Room</h1>
        <p className="mb-2 text-sm text-gray-600">Your User ID: <span className="font-mono">{userId}</span></p>
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;