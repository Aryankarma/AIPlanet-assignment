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
import axios from "axios";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Markdown from "react-markdown";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  avatar?: string;
}

interface MessageApiResponse {
  message: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1732693760989,
      text: "hey",
      sender: "user",
      avatar: "S",
    },
    {
      id: 1732693765741,
      text: "Hello! How can I assist you today?",
      sender: "ai",
      avatar: "A",
    },
    {
      id: 1732693840004,
      text: "what can you do for me?",
      sender: "user",
      avatar: "S",
    },
    {
      id: 1732693846862,
      text: "I can assist you by providing information and answering questions based on the documents and snippets available in the system. For example, if you have questions about leadership, hiring practices, or specific business strategies, I can provide insights and details from the provided snippets. Please let me know what specific information or assistance you need!",
      sender: "ai",
      avatar: "A",
    },
    {
      id: 1732693851612,
      text: "what else>",
      sender: "user",
      avatar: "S",
    },
    {
      id: 1732693859331,
      text: 'In addition to "The Alchemist," Paulo Coelho has written several other books. Some of these include "The Pilgrimage: A Contemporary Quest for Ancient Wisdom," "The Valkyries: An Encounter with Angels," "By the River Piedra I Sat Down and Wept," "The Fifth Mountain," "The Illustrated Alchemist," and "Veronika Decides to Die" .',
      sender: "ai",
      avatar: "A",
    },
    {
      id: 1732693851612,
      text: "what else>",
      sender: "user",
      avatar: "S",
    },
    {
      id: 1732693859331,
      text: 'In addition to "The Alchemist," Paulo Coelho has written several other books. Some of these include "The Pilgrimage: A Contemporary Quest for Ancient Wisdom," "The Valkyries: An Encounter with Angels," "By the River Piedra I Sat Down and Wept," "The Fifth Mountain," "The Illustrated Alchemist," and "Veronika Decides to Die" .',
      sender: "ai",
      avatar: "A",
    },
    {
      id: 1732693851612,
      text: "what else>",
      sender: "user",
      avatar: "S",
    },
    {
      id: 1732693859331,
      text: 'In addition to "The Alchemist," Paulo Coelho has written several other books. Some of these include "The Pilgrimage: A Contemporary Quest for Ancient Wisdom," "The Valkyries: An Encounter with Angels," "By the River Piedra I Sat Down and Wept," "The Fifth Mountain," "The Illustrated Alchemist," and "Veronika Decides to Die" .',
      sender: "ai",
      avatar: "A",
    },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
    () => JSON.parse(localStorage.getItem("sidebarOpen") || "false") // Load from localStorage
  );

  console.log(messages);

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

      const response = await axios.post<MessageApiResponse>(
        "http://localhost:8000/ask_question",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      const data = response.data;
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
          <div className="flex flex-col h-screen">
            <header className="fixed top-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center justify-between border-b border-secondary p-4 gap-4 select-none">
              <div className="flex items-center gap-2 bg-white datapx-2 rounded-xl">
                <img
                  src="/assets/AI Planet Logo.png"
                  alt="AI Planet Logo"
                  className="hidden h-10 w-full"
                />
              </div>
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
                  <div key={message.id} className="flex items-start gap-4">
                    {/* <Avatar>
                    {message.sender === "user" ? (
                      <AvatarFallback className="bg-purple-100 text-purple-500">
                        {message.avatar}
                      </AvatarFallback>
                    ) : (
                      <img src="/assets/AIAssistant.png" alt="AI Avatar" />
                    )}
                  </Avatar>  */}
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
            <footer className="p-4 fixed bottom-0 w-full">
              <div className="max-w-4xl">
                <form
                  className="flex items-center gap-4"
                  onSubmit={sendMessage}
                >
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default ChatInterface;

// return (
//   <div className="flex flex-col min-h-screen w-screen">
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "350px",
//         } as React.CSSProperties
//       }
//       open={isSidebarOpen}
//     >
//       <AppSidebar setIsSidebarOpen={setIsSidebarOpen} />
//       <SidebarInset>
//         <div className="flex flex-col h-screen">
//           {/* Fixed Header */}
//           <header className="fixed top-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center justify-between border-b border-secondary p-4 gap-4 select-none">
//             <div className="flex items-center gap-2 datapx-2 rounded-xl">
//               <img
//                 src="/assets/AI Planet Logo.png"
//                 alt="AI Planet Logo"
//                 className="hidden h-10 w-full"
//               />
//             </div>
//             <div className="flex items-center w-full sm:w-auto gap-4">
//               {selectedFile ? (
//                 <div className="flex items-center justify-between p-0 pl-2 border rounded-md">
//                   <span>{selectedFile.name}</span>
//                   <Button
//                     className="ml-2 bg-sidebar text-primary border"
//                     variant="ghost"
//                     size="icon"
//                     onClick={handleRemoveFile}
//                   >
//                     <X className="h-2 w-2" />
//                     <span className="sr-only">Remove file</span>
//                   </Button>
//                 </div>
//               ) : (
//                 <span className="text-sm text-muted-foreground">
//                   No file selected
//                 </span>
//               )}
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 className="hidden"
//                 accept=".pdf"
//               />
//               <Button
//                 variant="outline"
//                 className={`gap-2 ${
//                   selectedFile === null ? "flex" : "hidden"
//                 }`}
//                 onClick={handleUploadClick}
//               >
//                 <Upload className={`h-4 w-4`} />
//                 Upload PDF
//               </Button>
//               <ModeToggle />
//             </div>
//           </header>

//           {/* Scrollable Main Content */}
//           <main className="flex-1 overflow-y-auto mt-[72px] mb-[80px] p-4">
//             <div className="mx-auto max-w-4xl space-y-6">
//               {messages.map((message) => (
//                 <div key={message.id} className="flex items-start gap-4">
//                   <div className="grid gap-2.5">
//                     <div className="text-sm text-gray-500">
//                       {message.sender === "user" ? "You" : "AI Assistant"}
//                     </div>
//                     <div className="text-sm flex flex-col gap-2 leading-relaxed">
//                       <Markdown>{message.text}</Markdown>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </main>
//           <footer className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center p-4">
//             <div className="w-full max-w-4xl">
//               <div
//                 className="flex items-center gap-4"
//                 onSubmit={sendMessage}
//               >
//                 <Input
//                   className="flex-1 py-6 shadow-md w-full"
//                   placeholder="Send a message..."
//                   type="text"
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                 />
//                 <Button
//                   size="icon"
//                   className="p-6 shadow-md"
//                   type="submit"
//                   variant={"outline"}
//                 >
//                   <Send
//                     className="h-4 w-4"
//                     style={{ rotate: "45deg", translate: "-2px" }}
//                   />
//                   <span className="sr-only">Send message</span>
//                 </Button>
//               </div>
//             </div>
//           </footer>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   </div>
// );
