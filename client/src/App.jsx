import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Paper,
  Box,
} from "@mui/material";

const App = () => {
  const socket = useMemo(
    () => io("http://localhost:3000", { withCredentials: true }),
    []
  );

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState(""); 
  const [recipientId, setRecipientId] = useState(""); // For personal chat

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const data = recipientId
        ? { message, recipientId, username, type: "personal" } // Sending direct message
        : { message, room, username, type: "room" }; // Sending message to a room
      socket.emit("message", data);
      setMessage("");
    }
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      socket.emit("join-room", roomName);
      setRoom(roomName);
      setRoomName("");
      setMessages([]); // Clear messages when joining a new room
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log("connected", socket.id);
    });

    socket.on("receive-message", (data) => {
      setMessages((messages) => [...messages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 4,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: "0px 3px 15px rgba(0,0,0,0.2)",
      }}
    >
      <Typography
        variant="h6"
        component="div"
        gutterBottom
        sx={{ color: "#4caf50", fontWeight: "bold" }}
      >
        Socket ID: {socketID}
      </Typography>

      <TextField
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        id="outlined-basic"
        label="Username"
        variant="outlined"
        sx={{ mb: 2, bgcolor: "#fff", borderRadius: 1 }}
        fullWidth
      />

      <form
        onSubmit={joinRoomHandler}
        style={{
          width: "100%",
          marginTop: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="div" gutterBottom>
          Join Room
        </Typography>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
          sx={{ mb: 2, bgcolor: "#fff", borderRadius: 1 }}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ bgcolor: "#3f51b5", "&:hover": { bgcolor: "#303f9f" } }}
        >
          Join
        </Button>
      </form>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          marginTop: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="div" gutterBottom>
          Send Message
        </Typography>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="outlined-basic"
          label="Message"
          variant="outlined"
          sx={{ mb: 2, bgcolor: "#fff", borderRadius: 1 }}
          fullWidth
        />
        <TextField
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          id="outlined-basic"
          label="Recipient ID (Optional)"
          variant="outlined"
          sx={{ mb: 2, bgcolor: "#fff", borderRadius: 1 }}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
        >
          Send
        </Button>
      </form>

      <Typography
        variant="h5"
        component="div"
        gutterBottom
        sx={{ mt: 2, color: "#3f51b5" }}
      >
        Messages {room ? `in Room: ${room}` : "(Personal Chat)"}
      </Typography>
      <Paper
        elevation={3}
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxHeight: "300px",
          overflowY: "auto",
          bgcolor: "#e0f7fa",
          borderRadius: 2,
        }}
      >
        {messages.map((m, i) => (
          <Box
            key={i}
            sx={{
              bgcolor: "#ffffff",
              p: 1,
              mb: 1,
              borderRadius: 2,
              width: "100%",
              boxShadow: "0px 1px 5px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="body2"
              component="div"
              gutterBottom
              sx={{ textAlign: "left", color: "#00796b", fontWeight: "bold" }}
            >
              {m.username || "Anonymous"}:
            </Typography>
            <Typography
              variant="body1"
              component="div"
              sx={{ textAlign: "left", color: "#424242" }}
            >
              {m.message}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default App;
