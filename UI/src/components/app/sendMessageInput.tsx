import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Upload, X } from "lucide-react";
import axios from "axios";
import NProgress from "nprogress";

interface MessageApiResponse {
  message: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  avatar?: string;
}

interface sendMessageInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isSidebarOpen: boolean;
}

const SendMessageInput: React.FC<sendMessageInputProps> = ({
  setMessages,
  isSidebarOpen,
}) => {
  const [inputText, setInputText] = useState("");
  const [isEnterPressed, setIsEnterPressed] = useState(false);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    console.log("sending message", event);

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
      NProgress.start();
      const formData = new FormData();
      formData.append("message", inputText);
      setInputText("");

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
      NProgress.done();
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
        width: isSidebarOpen ? "calc(100% - 350px)" : "96%",
      }}
    >
      <div className="relative w-full">
        <form
          className="flex items-center rounded-xl max-w-[800px] mx-auto border-2 hover:border-gray-500 active:border-1 transition-all focus-visible:border-gray-300 relative"
          onSubmit={sendMessage}
        >
          <Input
            className="py-6 shadow-md border-none w-[800px] active:border-none focus:border-none focus-visible::border-none focus-within::border-none focus-visible:ring-transparent"
            placeholder="Send a message..."
            type="text"
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

export default SendMessageInput;
