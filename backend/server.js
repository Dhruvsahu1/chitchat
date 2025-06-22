import 'dotenv/config.js';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // ✅ Add this import
import ProjectModel from './models/project.model.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// ✅ Auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid ProjectId"));
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) return next(new Error("Project not found"));

    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return next(new Error('Invalid token'));

    socket.user = decoded;
    socket.project = project;
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Socket event listeners
io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()
  console.log(`✅ User connected: ${socket.user.email}`);

  socket.join(socket.roomId);

  socket.on("project-message", data => {

    socket.broadcast.to(socket.roomId).emit('project-message', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.email}`);
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
