import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Upload, X } from "lucide-react";
import axios from "axios";

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
    setMessages: Dispatch<SetStateAction<Message[]>>
    isSidebarOpen: boolean;
}

const SendMessageInput : React.FC<sendMessageInputProps> = ({setMessages, isSidebarOpen}) => {
  
    const [inputText, setInputText] = useState("");

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    console.log("sending message" , event)

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
    <div
      className={`py-3 fixed bottom-0 transition-all duration-300`}
      style={{
        width: isSidebarOpen ? "calc(100% - 350px)" : "100%",
      }}
    >
      <form
        className="flex items-center gap-4 rounded-lg max-w-4xl mx-auto"
        onSubmit={sendMessage}
      >
        <Input
          className="py-6 shadow-md"
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
  );
};

export default SendMessageInput;
