"use client";
import ChatBox from "./ChatBox";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RoomPage({ params }) {
  const { roomId } = params;

  useEffect(() => {
    const login = async () => {
      await supabase.auth.signInAnonymously(); // Anonymous login
    };
    login();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Study Room: {roomId}</h1>
      <ChatBox roomId={roomId} />
    </div>
  );
}
