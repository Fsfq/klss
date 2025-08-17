const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple status endpoint
app.get('/status', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory message store (small, for demo only)
// Note: this is ephemeral; on restart messages are lost. For production use a DB.
const messages = [];

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);
  // send current messages to newly connected client
  socket.emit('init', messages);

  socket.on('message', (msg) => {
    // basic validation
    if (!msg || typeof msg !== 'object') return;
    // ensure id/time
    msg.id = msg.id || Date.now() + '-' + Math.random().toString(36).slice(2,8);
    msg.time = msg.time || new Date().toISOString();
    messages.push(msg);
    // limit memory for demo
    if (messages.length > 2000) messages.shift();
    // broadcast to other clients (and caller)
    io.emit('message', msg);

  });

  socket.on('delete', (id) => {
    if (!id) return;
    const idx = messages.findIndex(m => m.id === id);
    if (idx !== -1) messages.splice(idx, 1);
    io.emit('delete', id);

  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected:', socket.id, reason);

  });
});

// start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});