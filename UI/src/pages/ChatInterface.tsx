import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, UserPlus } from "lucide-react";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/appSidebar";
import Markdown from "react-markdown";
import { useTheme } from "@/components/ui/ThemeProvider";
import SendMessageInput from "@/components/app/sendMessageInput";
import myAxios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import nProgress from "nprogress";
import { useSidebarStore } from "@/stores/useSidebarStore";

const FormSchema = z.object({
  assistantName: z
    .string()
    .min(3, { message: "Assistant name must be at least 3 characters." })
    .max(15, { message: "Assistant name cannot exceed 15 characters." })
    .regex(/^[a-z]+$/, { message: "Only lowercase letters are allowed." }),
});

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
  const [open, setOpen] = useState(false); // Control popover state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("sidebarOpen") || "false")
  );
  const { fetchAssistants, fetchDocs } = useSidebarStore();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const theme = useTheme().theme;

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
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

    const assistantName = localStorage.getItem("primaryAssistant");

    try {
      toast("Uploading document...");
      nProgress.start();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assistantName", assistantName || "");

      const response = await myAxios.post(
        "http://localhost:8000/savePdf",
        formData
      );

      console.log("PDF saved successfully:", response.data);
      toast("Document uploaded successfully.");
      fetchDocs();
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data);
      toast(
        "An error occurred while saving the PDF. Check the console for details."
      );
    } finally {
      handleRemoveFile()
      nProgress.done();
    }
  };

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // create assistant form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      assistantName: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast(`Creating assistant: ${data.assistantName}`);
    createAssistant(data.assistantName);
  }

  const createAssistant = async (name: string) => {
    try {
      nProgress.start();
      const formData = new FormData();
      formData.append("assistantName", name);

      const response = await myAxios.post<{
        message: string;
        status: number | string;
      }>("http://localhost:8000/createAssistant", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      console.log(response.data);
      response.data.status == 200
        ? toast(`Assistant created successfully.`)
        : null;
      fetchAssistants();
    } catch (error) {
      toast(
        "Error occured while creating assistant, check console for more details"
      );
      console.log(error);
    } finally {
      nProgress.done();
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
              {/* <input
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
              /> */}
              {/* <button onClick={handleLogin}>Login</button> */}
              {/* <button onClick={loginUser}>Register</button> */}
              {/* <Link to="/login">Go to login</Link> */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedFile ? (
                  <div className="flex items-center justify-between p-0 pl-2 rounded-md">
                    <Button
                      className="px-3 flex gap-4 text-primary w-full"
                      variant="outline"
                      size="icon"
                      // onClick={handleRemoveFile}
                    >
                      <p>
                      Uploading {selectedFile.name.slice(0, 20)}...
                      </p>
                      {/* <X className="h-2 w-2" /> */}
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {/* No file selected */}
                  </span>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
                <TooltipProvider delayDuration={750}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className={`gap-2 ${
                          selectedFile === null ? "flex" : "hidden"
                        }`}
                        onClick={handleUploadClick}
                      >
                        <Upload className={`h-4 w-4`} />
                        Upload Doc
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload document to your primary assistant</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={750}>
                  <Tooltip>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button variant="outline" className="gap-2 px-3">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="grid gap-8">
                          <div className="space-y-4">
                            <h4 className="font-medium leading-none">
                              Create Assistant
                            </h4>
                            <div className="flex w-full max-w-sm items-center">
                              <Form {...form}>
                                <form
                                  onSubmit={form.handleSubmit((data) => {
                                    setOpen(false);
                                    onSubmit(data);
                                  })}
                                  className="w-full space-y-3"
                                >
                                  <FormField
                                    control={form.control}
                                    name="assistantName"
                                    render={({ field }) => (
                                      <FormItem>
                                        {/* <FormLabel>Assistant Name</FormLabel> */}
                                        <FormControl>
                                          <div className="flex w-full max-w-sm items-center space-x-2">
                                            <Input
                                              placeholder="Assistant name"
                                              {...field}
                                              onChange={(e) => {
                                                const value = e.target.value
                                                  .toLowerCase()
                                                  .replace(/\s+/g, "")
                                                  .slice(0, 15);
                                                field.onChange(value);
                                              }}
                                            />
                                            <Button className="" type="submit">
                                              Create
                                            </Button>
                                          </div>
                                        </FormControl>
                                        {/* <FormDescription>
                                          This is your public display name.
                                        </FormDescription> */}
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </form>
                              </Form>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <TooltipContent>
                      <p>Create Assistant</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={750}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ModeToggle />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Theme</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto mt-[72px] mb-[80px] p-4">
              <div className="mx-auto max-w-[800px] space-y-6">
                {messages.length === 0 && (
                  <div className="flex items-end justify-center h-64">
                    <p className="text-primary/15 select-none text-2xl font-semibold">
                      Ask anything on your information — get instant, AI-powered
                      answers.
                    </p>
                  </div>
                )}
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
                    <div className="text-base grid gap-1.5 text-start">
                      <div className="text-gray-500">
                        {message.sender === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div
                        className={`prose list-decimal w-full max-w-none flex flex-col gap-3 leading-loose ${
                          theme === "dark" ? "prose-invert text-gray-300" : null
                        }`}
                      >
                        <Markdown>{message.text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Message input here */}
            <SendMessageInput
              setMessages={setMessages}
              messages={messages}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default ChatInterface;
