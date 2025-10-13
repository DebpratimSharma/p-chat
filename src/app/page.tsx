"use client";
import { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

export default function Home() {
  const [peerId, setPeerId] = useState("");
  const [otherPeerId, setOtherPeerId] = useState("");
  const [conn, setConn] = useState<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    // Initialise PeerJS
   const peer = new Peer({
     host: "peer-server-h0b2.onrender.com",
     port: 443,
     secure: true,
     path: "/", // 👈 important now that it’s mounted at /peerjs
   });


    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      console.log("My Peer ID:", id);
    });

    peer.on("connection", (connection) => {
      setConn(connection);
      connection.on("data", (data) => {
        setMessages((prev) => [...prev, `Friend: ${data}`]);
      });
    });

    // Cleanup on close
    return () => {
      peer.destroy();
      setMessages([]);
    };
  }, []);

  const connectToPeer = () => {
    if (!otherPeerId.trim()) return;
    const connection = peerRef.current?.connect(otherPeerId);
    connection?.on("open", () => setConn(connection));
    connection?.on("data", (data) => {
      setMessages((prev) => [...prev, `Friend: ${data}`]);
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !conn) return;
    conn.send(input);
    setMessages((prev) => [...prev, `You: ${input}`]);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-4">
        <h1 className="text-2xl font-semibold text-center mb-3">PeerJS Chat</h1>
        <div className="bg-gray-50 border rounded-lg p-2 mb-2 text-sm">
          <div>Your ID:</div>
          <div className="font-mono text-blue-600 break-words">{peerId || "Loading..."}</div>
        </div>

        {!conn && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter friend's peer ID"
              value={otherPeerId}
              onChange={(e) => setOtherPeerId(e.target.value)}
              className="flex-grow border px-2 py-1 rounded-lg"
            />
            <button
              onClick={connectToPeer}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
        )}

        <div className="h-64 overflow-y-auto border rounded-lg p-2 mb-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`py-1 px-2 rounded-lg mb-1 ${
                msg.startsWith("You")
                  ? "bg-blue-100 text-right"
                  : "bg-gray-200 text-left"
              }`}
            >
              {msg}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border px-2 py-1 rounded-lg"
          />
          <button
            onClick={sendMessage}
            disabled={!conn}
            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
