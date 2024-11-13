// src/components/ChatBox.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Make sure the port matches the backend

const ChatBox = ({ playerName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Listen for incoming messages from the server
    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        content: newMessage,
        senderName: playerName, // Include sender's name
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit('chatMessage', message); // Send message to the server
      setNewMessage(''); // Clear input field
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Chat</h3>
      <div style={{ height: '200px', overflowY: 'scroll', padding: '10px', borderRadius: '5px' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.senderName}: {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '100%', padding: '5px', marginTop: '10px', borderRadius: '5px' }}
      />
      <button onClick={handleSendMessage} style={{ marginTop: '5px', width: '100%' }}>
        Send
      </button>
    </div>
  );
};

export default ChatBox;
