import { useState, useRef } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Send, Upload, X } from "lucide-react";
import { ModeToggle } from "../ui/ThemeToggle";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  avatar?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "explain like im 5",
      sender: "user",
      avatar: "S",
    },
    {
      id: 2,
      text: "Our own Large Language Model (LLM) is a type of AI that can learn from data. We have trained it on 7 billion parameters which makes it better than other LLMs. We are featured on aiplanet.com and work with leading enterprises to help them use AI securely and privately. We have a Generative AI Stack which helps reduce the hallucinations in LLMs and allows enterprises to use AI in their applications.",
      sender: "ai",
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-screen min-w-[100vw] flex-col">
      <header className="flex flex-col sm:flex-row items-center justify-between border-b py-4 px-20 gap-4">
        <div className="flex items-center gap-2 bg-white px-2 rounded-xl">
          <img
            src="../../../public/assets/AI Planet Logo.png"
            alt="AI Planet Logo"
            className="h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {selectedFile ? (
            <div className="flex items-center justify-between p-0 pl-2 border rounded-md">
              <span className="">{selectedFile.name}</span>
              <Button
                className="ml-2 bg-gray-100 text-black hover:text-white hover:bg-gray-950 border"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
              >
                <X className="h-2 w-2" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              No file selected
            </span>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
          />
          <Button
            variant="outline"
            className="gap-2 whitespace-nowrap"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-4">
              <Avatar>
                {message.sender === "user" ? (
                  <AvatarFallback className="bg-purple-100 text-purple-500">
                    {message.avatar}
                  </AvatarFallback>
                ) : (
                  <img
                    src="../../../public/assets/AIAssistant.png"
                    alt="AI Avatar"
                  />
                )}
              </Avatar>
              <div className="grid gap-2.5">
                <div className="text-sm text-gray-500">
                  {message.sender === "user" ? "You" : "AI Assistant"}
                </div>
                <div className="text-sm">{message.text}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="p-4">
        <div className="mx-auto max-w-4xl">
          <form className="flex items-center gap-4">
            <Input
              className="flex-1 py-6 shadow-md"
              placeholder="Send a message..."
              type="text"
            />
            <Button
              size="icon"
              className="p-6 bg-white text-black hover:text-white hover:bg-gray-950 shadow-md hover:shadow-lg"
              type="submit"
            >
              <Send
                className="h-4 w-4"
                style={{ rotate: "45deg", translate: "-2px" }}
              />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
