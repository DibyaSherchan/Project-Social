import { io } from 'socket.io-client';

// Replace 'http://localhost:3001' with your server's URL if different
const socket = io('http://localhost:3001', {
  withCredentials: true, // Allows sending credentials (cookies, auth headers) if needed
});

export { socket };
