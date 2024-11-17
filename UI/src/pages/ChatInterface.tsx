import { useState, useEffect, useRef, FormEvent } from "react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Upload, X } from "lucide-react";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import { v5 as uuidv5 } from "uuid";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/appSidebar";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  avatar?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
    () => JSON.parse(localStorage.getItem("sidebarOpen") || "false") // Load from localStorage
  );

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen)); // Save to localStorage
  }, [isSidebarOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input
    }

    savePdf(file);
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

  const savePdf = async (file: File | null) => {
    try {
      if (!file) {
        alert("Please select a file before uploading.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/savePdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Couldn't save pdf in the backend");
      } else {
        console.log("Pdf Saved");
      }
    } catch (error) {
      alert("Error occurred: Check console");
      console.log(error);
    }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (!inputText.trim()) {
      alert("Please enter a question.");
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      avatar: "S",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const formData = new FormData();
      formData.append("message", inputText);

      const response = await fetch("http://localhost:8000/ask_question", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from the server");
      }

      const data = await response.json();
      console.log("API Response:", data);

      const aiMessage: Message = {
        id: Date.now(),
        text: data.message || "Sorry, I couldn't understand that.",
        sender: "ai",
        avatar: "A",
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setInputText("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-screen">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "350px",
          } as React.CSSProperties
        }
        open={isSidebarOpen}
      >
        <AppSidebar setIsSidebarOpen={setIsSidebarOpen} />
        <SidebarInset>
          <header className="flex flex-col sm:flex-row items-center justify-between border-b p-4 gap-4">
            <div className="flex items-center gap-2 bg-white datapx-2 rounded-xl">
              <img
                src="/assets/AI Planet Logo.png"
                alt="AI Planet Logo"
                className="hidden h-10 w-full"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {selectedFile ? (
                <div className="flex items-center justify-between p-0 pl-2 border rounded-md">
                  <span>{selectedFile.name}</span>
                  <Button
                    className="ml-2 bg-gray-100 text-black border"
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
                className={`gap-2 ${selectedFile === null ? "flex" : "hidden"}`}
                onClick={handleUploadClick}
              >
                <Upload className={`h-4 w-4`} />
                Upload PDF
              </Button>
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-4">
                  {/* <Avatar>
                {message.sender === "user" ? (
                  <AvatarFallback className="bg-purple-100 text-purple-500">
                    {message.avatar}
                  </AvatarFallback>
                ) : (
                  <img src="/assets/AIAssistant.png" alt="AI Avatar" />
                )}
              </Avatar> */}
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
              <form className="flex items-center gap-4" onSubmit={sendMessage}>
                <Input
                  className="flex-1 py-6 shadow-md"
                  placeholder="Send a message..."
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button
                  size="icon"
                  className="p-6 shadow-md"
                  type="submit"
                  variant={"outline"}
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
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default ChatInterface;
