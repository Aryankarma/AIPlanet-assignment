import { useState, useEffect, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
import axios from "axios";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Markdown from "react-markdown";
import { useTheme } from "@/components/ui/ThemeProvider";
import SendMessageInput from "@/components/app/sendMessageInput";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  avatar?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
    () => JSON.parse(localStorage.getItem("sidebarOpen") || "false") // Load from localStorage
  );

  // dummy states for register
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setemail] = useState('');
  const [token, setToken] = useState<string>('');
  const [message, setMessage] = useState('');

  interface LoginResponse {
    access_token: string;
  }

  const handleRegister = async () => {
    alert("data sending for user reg")
    alert(JSON.stringify({name, password, email}))
    try {
      const response = await axios.post(`http://localhost:8000/auth/register`, { name, password, email });
      console.log(response.data)
      alert("Successfully registered user")
      listUsers()
      return response.data;
    } catch (error: any) {
      alert(JSON.stringify(error.response.data.detail))
    }
  };

  const loginUser2 = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/auth/login`, { name, password }, {withCredentials:true});
      listUsers()
      console.log(response)
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { detail: 'Unexpected error occurred' };
    }
  };
  

  const loginUser = async () => {
    alert(JSON.stringify({email, password}))
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
  
      const response = await axios.post(
        `http://localhost:8000/auth/login`,
        formData,
        {withCredentials:true}
      );
      
      console.log("login successfull")
      console.log(response)
      alert(JSON.stringify(response))
      return response.data;
    
    } catch (error: any) {
      throw error.response?.data || { detail: "Unexpected error occurred" };
    }
  };
  
  const handleLogin = async () => { 
    try {
      const response = await loginUser();
      console.log(response);
      setMessage('Login successful!');
      alert("Login successful");
    } catch (error: any) {
      setMessage(error.detail || 'Login failed');
      console.error('Login error:', error);
    }
  };
  
  
  const listUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/auth/users`);
      console.log(response.data)
      alert("fetched")
      return response.data;
    } catch (error: any) {
      alert(error.response.data.detail)
    }
  };

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen)); // Save to localStorage
  }, [isSidebarOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/savePdf",
        formData
      );

      console.log("PDF saved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      alert(
        "An error occurred while saving the PDF. Check the console for details."
      );
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
          <div className="flex flex-col h-screen">
            <header className="fixed top-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center justify-between border-b border-secondary p-4 gap-4 select-none">
              <div className="flex items-center gap-2 bg-white datapx-2 rounded-xl">
                <img
                  src="/assets/AI Planet Logo.png"
                  alt="AI Planet Logo"
                  className="hidden h-10 w-full"
                />
              </div>
              <input
                placeholder="Full name"
                value={name}
                className="w-40"
                onChange={(e) => setName(e.target.value)}
                />
              <input
                placeholder="Password"
                type="password"
                className="w-40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
              <input
                placeholder="email"
                type="email"
                className="w-40"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />
               {/* <button onClick={handleLogin}>Login</button> */}
              <button onClick={loginUser}>Register</button>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {selectedFile ? (
                  <div className="flex items-center justify-between p-0 pl-2 border  rounded-md">
                    <span>{selectedFile.name}</span>
                    <Button
                      className="ml-2 bg-sidebar text-primary border"
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
                  className={`gap-2 ${
                    selectedFile === null ? "flex" : "hidden"
                  }`}
                  onClick={handleUploadClick}
                >
                  <Upload className={`h-4 w-4`} />
                  Upload PDF
                </Button>
                <ModeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto mt-[72px] mb-[80px] p-4">
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-4 animate-opacityOpen "
                  >
                    {/* <Avatar>
                    {message.sender === "user" ? (
                      <AvatarFallback className="bg-purple-100 text-purple-500">
                        {message.avatar}
                      </AvatarFallback>
                    ) : (
                      <img src="/assets/AIAssistant.png" alt="AI Avatar" />
                    )}
                  </Avatar>  */}
                    <div className="text-sm grid gap-1.5">
                      <div className="text-gray-500">
                        {message.sender === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div
                        className={`prose w-full max-w-none ${
                          useTheme().theme === "dark"
                            ? "prose-invert text-gray-300"
                            : null
                        }`}
                      >
                        <Markdown>{message.text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* Message input here */}
            <SendMessageInput
              setMessages={setMessages}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default ChatInterface;
