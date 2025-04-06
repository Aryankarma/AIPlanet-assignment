import React, { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import NProgress from "nprogress";
import { toast } from "sonner";

const getCookie = (name: string) => {
  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  avatar?: string;
}

interface sendMessageInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  sidebarOpen: boolean;
}

const SendMessageInput2: React.FC<sendMessageInputProps> = ({
  setMessages,
  sidebarOpen,
}) => {
  const [inputText, setInputText] = useState("");
  const [isEnterPressed, setIsEnterPressed] = useState(false);

  // Stream handler
  const streamMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (!inputText.trim()) {
      toast.error("Please enter a question.")
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      avatar: "S",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText(""); // Clear input
    NProgress.start();

    const aiMessageId = Date.now() + 1; // Unique ID for AI message
    let aiMessage: Message = {
      id: aiMessageId,
      text: "",
      sender: "ai",
      avatar: "A",
    };

    setMessages((prevMessages) => [...prevMessages, aiMessage])
    
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    try {
      // Open SSE connection
      const eventSource = new EventSource(
        `http://localhost:8000/stream_question?message=${encodeURIComponent(
          inputText
        )}?token=${token}`
      );

      eventSource.onmessage = (event) => {
        if (event.data) {
          const chunk = event.data;

          // Append new data to the existing AI message
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          );
        }
      };

      eventSource.onerror = (err) => {
        console.error("Streaming error:", err);
        eventSource.close();
        NProgress.done();
        toast.error("Error while receiving response.");
      };

      eventSource.addEventListener("end", () => {
        // Custom event if you want to emit 'end' from backend when complete
        eventSource.close();
        NProgress.done();
      });
    } catch (error) {
      console.error("Error:", error);
      NProgress.done();
      toast.error("Failed to send message.");
    }
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === "Enter") {
      setIsEnterPressed(true);
    }
  };

  const handleKeyUp = (e: { key: string }) => {
    if (e.key === "Enter") {
      setIsEnterPressed(false);
    }
  };

  return (
    <div
      className={`py-3 fixed bottom-0 transition-all duration-300 mx-auto flex`}
      style={{
        width: sidebarOpen ? "calc(100% - 350px)" : "96%",
      }}
    >
      <div className="relative w-full">
        <form
          className="flex items-center rounded-xl max-w-[800px] mx-auto border-2 border-secondary hover:border-gray-500 active:border-1 transition-all relative hover:border-opacity-75"
          onSubmit={streamMessage} // Streaming on submit
        >
          <Input
            className="py-6 border-none w-[800px] active:border-none focus:border-none focus-visible::border-none focus-within::border-none focus-visible:ring-transparent"
            placeholder="Send a message..."
            type="text"
            autoFocus
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
          <Button
            size="icon"
            className={`p-5 m-1 shadow-md outline-none border-none rounded-xl transition-colors ${
              isEnterPressed ? "bg-secondary" : ""
            }`}
            type="submit"
            variant={"outline"}
          >
            <Send
              className="h-4 w-4"
              style={{ rotate: "15deg", translate: "-2px" }}
            />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SendMessageInput2;
