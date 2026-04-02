"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { getInitials } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "me" | "other";
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

const mockConversations: Conversation[] = [
  { id: "1", name: "MídiaOut SP", lastMessage: "O material foi aprovado!", time: "14:30", unread: 2 },
  { id: "2", name: "Visual Propaganda", lastMessage: "Podemos ajustar o período?", time: "11:15", unread: 0 },
  { id: "3", name: "Band FM", lastMessage: "Spot pronto para veiculação", time: "Ontem", unread: 1 },
  { id: "4", name: "Fitness Life", lastMessage: "Quando podemos gravar?", time: "Ontem", unread: 0 },
  { id: "5", name: "JCDecaux RJ", lastMessage: "Enviamos as fotos do local", time: "25/03", unread: 0 },
];

const mockMessages: Message[] = [
  { id: "1", content: "Olá! Gostaria de saber mais sobre o Painel LED na Paulista.", sender: "me", time: "14:20" },
  { id: "2", content: "Claro! O painel tem 12m² e fica ativo 24h. Quer agendar uma visita?", sender: "other", time: "14:22" },
  { id: "3", content: "Sim, seria ótimo! Quando tem disponibilidade?", sender: "me", time: "14:25" },
  { id: "4", content: "Podemos marcar para amanhã às 10h. O material foi aprovado!", sender: "other", time: "14:30" },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<string | null>("1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      content: message,
      sender: "me",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setMessage("");
    // TODO: integrate with Supabase Realtime
  };

  const activeConversation = mockConversations.find((c) => c.id === activeChat);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-8rem)] flex">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${!showMobileList && activeChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversas</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Buscar conversa..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1e3a8a]" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveChat(conv.id); setShowMobileList(false); }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeChat === conv.id ? "bg-[#1e3a8a]/5" : ""}`}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(conv.name)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 truncate">{conv.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-[#f97316] text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showMobileList && activeChat ? "hidden md:flex" : "flex"}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-1 hover:bg-gray-100 rounded">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(activeConversation.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{activeConversation.name}</p>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                        msg.sender === "me"
                          ? "bg-[#1e3a8a] text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-blue-200" : "text-gray-400"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1e3a8a] text-sm"
                    />
                    <button
                      onClick={handleSend}
                      className="p-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Selecione uma conversa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
