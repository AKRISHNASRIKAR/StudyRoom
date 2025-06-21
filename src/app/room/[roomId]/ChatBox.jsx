"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, [roomId]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel("room-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Send message
  const sendMessage = async () => {
    if (newMsg.trim() === "") return;

    await supabase.from("messages").insert({
      room_id: roomId,
      user_name: "Anonymous",
      content: newMsg,
    });

    setNewMsg("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="h-80 overflow-y-scroll border rounded p-2 bg-[#212121]">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong className="text-blue-600">{msg.user_name}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message..."
        className="border border-amber-950 px-3 py-2 rounded w-full "
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
    </div>
  );
}
