import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateRoom = () => {
  const [userId, setUserId] = useState<string>(() => uuidv4());
  const [roomDetails, setRoomDetails] = useState<{ roomId: string; password: string } | null>(null);
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
        setRoomDetails({ roomId: data.room_id, password: data.password });
      } else {
        alert(`Failed to create room: ${data?.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Create a New Room</h1>

        <p className="mb-4 text-sm text-gray-600">
          Your User ID: <span className="font-mono">{userId}</span>
        </p>

        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>

        {roomDetails && (
          <div className="mt-4 border-t pt-4 border-gray-300">
            <h2 className="text-md font-semibold mb-2 text-gray-700">Room Created!</h2>

            <div className="mb-2">
              <label className="text-sm font-medium text-gray-600">Room ID:</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{roomDetails.roomId}</span>
                <button
                  onClick={() => copyToClipboard(roomDetails.roomId)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="text-sm font-medium text-gray-600">Password:</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{roomDetails.password}</span>
                <button
                  onClick={() => copyToClipboard(roomDetails.password)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              className="mt-4 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate(`/collab/${roomDetails.roomId}`)}
            >
              Go to Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;
