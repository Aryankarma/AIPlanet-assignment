import * as React from "react";
import { memo } from "react";
import { FileText, MessageCircle, UserIcon, Trash } from "lucide-react";
import { NavUser } from "./navUser";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Button } from "../button";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Loader1 from "@/components/app/loader";
import { FontItalicIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "../ThemeProvider";
import { Search } from "lucide-react";
import nProgress from "nprogress";
import myAxios from "@/lib/axios";
import { toast } from "sonner";
import { c } from "framer-motion/dist/types.d-6pKw1mTI";
import { useSidebarStore } from "@/stores/useSidebarStore";

const data = {
  user: {
    name: "Aryan Karma",
    email: "aryankarma29@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Docs",
      url: "#",
      icon: FileText,
      isActive: true,
    },
    {
      title: "Assistants",
      url: "#",
      icon: UserIcon,
      isActive: false,
    },
    {
      title: "Chats",
      url: "#",
      icon: MessageCircle,
      isActive: false,
    },
  ],
  docs: [
    {
      createdOn: "2024-11-16T16:55:51.723Z",
      id: "b1197938-0362-4f94-a15d-d730561f4a93",
      name: "Nalini 2.pdf",
      status: "Available",
    },
    {
      createdOn: "2024-11-16T17:02:04.109Z",
      id: "02ea5017-c7d9-4a6f-ba7d-daaec61d5881",
      name: "SANJAY KISHAN KAUL 3.pdf",
      status: "Available",
    },
    {
      createdOn: "2024-11-16T18:15:34.120Z",
      id: "f4321b08-1234-45cd-8a7e-ec1abcd12345",
      name: "Sample Document.pdf",
      status: "In Progress",
    },
    {
      createdOn: "2024-11-16T18:20:00.098Z",
      id: "abc12345-de67-4fg8-hijk-890lmnopqrst",
      name: "Draft Document.pdf",
      status: "Pending",
    },
    {
      createdOn: "2024-11-16T19:10:22.345Z",
      id: "9876abcd-efgh-4ijk-5678-lmnopqrs9876",
      name: "Final Report.pdf",
      status: "Failed",
    },
  ],
  assistants: [
    {
      id: "assistant-1",
      name: "Assistant Alpha",
      createdOn: "2024-11-10T09:30:00Z",
    },
    {
      id: "assistant-2",
      name: "Assistant Beta",
      createdOn: "2024-11-10T10:00:00Z",
    },
    {
      id: "assistant-3",
      name: "Assistant Gamma",
      createdOn: "2024-11-10T10:30:00Z",
    },
    {
      id: "assistant-4",
      name: "Assistant Delta",
      createdOn: "2024-11-10T11:00:00Z",
    },
    {
      id: "assistant-5",
      name: "Assistant Epsilon",
      createdOn: "2024-11-10T11:30:00Z",
    },
    {
      id: "assistant-6",
      name: "Assistant Zeta",
      createdOn: "2024-11-10T12:00:00Z",
    },
    {
      id: "assistant-7",
      name: "Assistant Eta",
      createdOn: "2024-11-10T12:30:00Z",
    },
    {
      id: "assistant-8",
      name: "Assistant Theta",
      createdOn: "2024-11-10T13:00:00Z",
    },
    {
      id: "assistant-9",
      name: "Assistant Iota",
      createdOn: "2024-11-10T13:30:00Z",
    },
    {
      id: "assistant-10",
      name: "Assistant Kappa",
      createdOn: "2024-11-10T14:00:00Z",
    },
  ],
  chats: [
    {
      id: "chat-1",
      chatName: "General Discussion and Announcements",
      createdOn: "2024-11-10T09:00:00Z",
    },
    {
      id: "chat-2",
      chatName: "Weekly Project Status Updates",
      createdOn: "2024-11-10T09:30:00Z",
    },
    {
      id: "chat-3",
      chatName: "Deep Dive into Emerging Technologies",
      createdOn: "2024-11-10T10:00:00Z",
    },
    {
      id: "chat-4",
      chatName: "Event Planning and Logistics Coordination",
      createdOn: "2024-11-10T10:30:00Z",
    },
    {
      id: "chat-5",
      chatName: "Feedback and Suggestions for Design Changes",
      createdOn: "2024-11-10T11:00:00Z",
    },
    {
      id: "chat-6",
      chatName: "Reporting and Resolving Critical Bugs",
      createdOn: "2024-11-10T11:30:00Z",
    },
    {
      id: "chat-7",
      chatName: "Organizing Team Outings and Activities",
      createdOn: "2024-11-10T12:00:00Z",
    },
    {
      id: "chat-8",
      chatName: "In-depth Code Reviews and Best Practices",
      createdOn: "2024-11-10T12:30:00Z",
    },
    {
      id: "chat-9",
      chatName: "Detailed Summary of Weekly Accomplishments",
      createdOn: "2024-11-10T13:00:00Z",
    },
    {
      id: "chat-10",
      chatName: "Customer Queries and Support Discussions",
      createdOn: "2024-11-10T13:30:00Z",
    },
  ],
};

interface FileModel {
  _data_store: string;
  _check_type: boolean;
  _spec_property_naming: boolean;
  _path_to_item: (string | number)[];
  _configuration: any;
  _visited_composed_classes: string[];
}

interface FileObject {
  name: string;
  created_on: string;
  updated_on: string;
  metadata: any;
  id: string;
  status: string;
  mime_type: string | null;
}

interface AssistantObject {
  name: string;
  instructions: string;
  metadata: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DocsResponseData {
  files: FileObject[];
}

interface AssistantResponseData {
  assistants: AssistantObject[];
}

export const AppSidebar = memo(
  ({
    setIsSidebarOpen,
    ...props
  }: React.ComponentProps<typeof Sidebar> & {
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const isFirstRender = useRef(true);
    // const [docs, setDocs] = useState<Object>({})
    // const [assistants, setAssistants] = useState<Object>({})
    // const [sidebarLoading, setSidebarLoading] = useState<boolean>(true)
    // const [docsLoading, setDocsLoading] = useState<boolean>(true)
    // const [deletingDocID, setDeletingDocID] = useState<string | null>(null)
    // const [deletedDocs, setDeletedDocs] = useState<string[]>([""])
    // const [deletedAssistants, setDeletedAssistants] = useState<string[]>([""])
    // const [sidebarError, setSidebarError] = useState<string | null>(null)
    // const [deletingAssistantID, setDeletingAssistantID] = useState<
    //   string | null
    // >(null)
    // const [primaryAssistant, setPrimaryAssistant] = useState<string>(
    //   () => localStorage.getItem("primaryAssistant") || "default"
    // )

    // const [activeItem, setActiveItem] = useState<string>(
    //   () => localStorage.getItem("activeItem") || "Docs" // Fallback to "Docs" if null
    // )

    const {
      docs,
      assistants,
      sidebarLoading,
      docsLoading,
      deletingDocID,
      deletingAssistantID,
      primaryAssistant,
      activeItem,
      deletedDocs,
      deletedAssistants,
      sidebarError,

      setActiveItem,
      updatePrimaryAssistant,
      fetchDocs,
      fetchAssistants,
      deleteDocument,
      deleteAssistant,
    } = useSidebarStore();

    useEffect(() => {
      // if (isFirstRe+nder.current) {
      //   // First render, skip API call
      //   isFirstRender.current = false;
      //   return;
      // }

      // Actual update logic only when primaryAssistant changes after first mount
      localStorage.setItem("primaryAssistant", primaryAssistant);
      updatePrimaryAssistant(primaryAssistant);
      fetchDocs();
    }, [primaryAssistant]);

    useEffect(() => {
      console.log("primaryAssistant: ", primaryAssistant);
    }, [primaryAssistant]);

    useEffect(() => {
      localStorage.setItem("activeItem", activeItem);
    }, [activeItem]);

    useEffect(() => {
      fetchDocs();
    }, [primaryAssistant]);

    useEffect(() => {
      fetchDocs();
      fetchAssistants();
    }, []);

    const { setOpen } = useSidebar();

    // const updatePrimaryAssistant = async (assistantName: string) => {
    //   nProgress.start()

    //   const formData = new FormData()
    //   formData.append("assistantName", assistantName)

    //   try {
    //     const response: any = await myAxios.post(
    //       "http://localhost:8000/updatePrimaryAssistant",
    //       formData,
    //       {
    //         withCredentials: true,
    //         headers: { "Content-Type": "multipart/form-data" },
    //       }
    //     )

    //     console.log("Primary assistant update response:", response)

    //     if (response?.data?.success) {
    //       setPrimaryAssistant(assistantName)
    //       localStorage.setItem("primaryAssistant", assistantName)
    //       toast(`Primary Assistant updated to: ${assistantName}`)
    //     }

    //     return response.data;
    //   } catch (err) {
    //     console.error(err)
    //     return null;
    //   } finally {
    //     nProgress.done()
    //   }
    // };

    // const fetchDocs = async () => {
    //   setDocsLoading(true)
    //   nProgress.start()
    //   setSidebarError(null)

    //   const formData = new FormData()
    //   formData.append("assistantName", primaryAssistant)

    //   try {
    //     const response: { data: DocsResponseData } = await myAxios.post(
    //       "http://localhost:8000/fetchDocs",
    //       formData,
    //       {
    //         withCredentials: true,
    //         headers: { "Content-Type": "multipart/form-data" },
    //       }
    //     )
    //     console.log("documents ", response)
    //     if (response?.data?.files) {
    //       setDocs(response.data.files)
    //     }
    //   } catch (err) {
    //     setSidebarError("Failed to fetch documents")
    //     console.error(err)
    //   } finally {
    //     nProgress.done()
    //     setDocsLoading(false)
    //   }
    // };

    // // send username in params when auth gets setup
    // const fetchAssistants = async () => {
    //   setSidebarLoading(true)
    //   setSidebarError(null)

    //   const formData = new FormData()
    //   formData.append("dummy", "dummy") // you can remove this if backend expects nothing

    //   try {
    //     nProgress.start()
    //     const response: { data: AssistantResponseData } = await myAxios.post(
    //       "http://localhost:8000/getAssistants",
    //       formData,
    //       {
    //         withCredentials: true,
    //         headers: { "Content-Type": "multipart/form-data" },
    //       }
    //     )
    //     console.log("assistants available : ", response.data.assistants)
    //     if (response?.data?.assistants) {
    //       setAssistants(response.data.assistants)
    //     }
    //   } catch (err) {
    //     setSidebarError("Failed to fetch documents")
    //     console.error(err)
    //   } finally {
    //     nProgress.done()
    //     setSidebarLoading(false)
    //   }
    // };

    // const deleteDocument = async (id: string) => {
    //   console.log("DataStore from fronyend: ", id)

    //   try {
    //     if (!id) {
    //       console.error("No id provided!")
    //       return;
    //     }

    //     // console.log("id from frontend:", id)

    //     // // Safely convert to valid JSON string
    //     // const validJsonString = id
    //     //   .replace(/'/g, '"')
    //     //   .replace(/\bNone\b/g, 'null')

    //     // const parsedObject: { id: string } = JSON.parse(validJsonString)

    //     console.log("Extracted ID:", id)

    //     nProgress.start()
    //     setDeletingDocID(id)
    //     const formData = new FormData()
    //     formData.append("docID", id)
    //     formData.append("assistantName", primaryAssistant)

    //     const response = await myAxios.post(
    //       "http://localhost:8000/deleteDoc",
    //       formData,
    //       {
    //         withCredentials: true,
    //         headers: { "Content-Type": "multipart/form-data" },
    //       }
    //     )

    //     if (response.status === 200) {
    //       // add a successfully deleted doc toast here
    //       toast("Document deleted successfully.")
    //       // fetchDocs()
    //       setDeletedDocs((prev) => [...prev, id])
    //       setDeletingDocID(null)
    //     }
    //   } catch (error) {
    //     console.error("error : ", error)
    //   } finally {
    //     nProgress.done()
    //   }
    // };

    // // check this out, and rewrite (this one is not perfect)
    // const deleteAssistant = async (assistantName: string) => {
    //   console.log("DataStore from fronyend: ", assistantName)

    //   try {
    //     nProgress.start()
    //     setDeletingAssistantID(assistantName)
    //     const formData = new FormData()
    //     formData.append("assistantName", assistantName)

    //     const response = await myAxios.post(
    //       "http://localhost:8000/deleteAssistant",
    //       formData,
    //       {
    //         withCredentials: true,
    //         headers: { "Content-Type": "multipart/form-data" },
    //       }
    //     )

    //     if (response.status === 200) {
    //       // add a successfully deleted assistant toast here
    //       toast("Assistant deleted successfully.")
    //       // fetchDocs()
    //       setDeletedAssistants((prev) => [...prev, assistantName])
    //       setDeletingAssistantID(null)
    //       updatePrimaryAssistant("default")
    //     }
    //   } catch (error) {
    //     console.error("error : ", error)
    //   } finally {
    //     nProgress.done()
    //   }
    // };

    const renderDocs = () => {
      if (docsLoading) {
        return <Loader1 />;
      }

      if (sidebarError) {
        return (
          <div
            key={Date.now()}
            className="text-red-500 py-10 mx-auto text-center"
          >
            {sidebarError}
          </div>
        );
      }

      const filteredDocs = (docs as FileObject[]).filter(
        (doc) => !deletedDocs.includes(doc?.id)
      );

      if (filteredDocs.length === 0) {
        return (
          <div
            key={Date.now()}
            className="flex justify-center items-center w-100 h-[100px] "
          >
            <p className="mx-auto">No Docs Uploaded.</p>
          </div>
        );
      }

      return filteredDocs.map((doc) => (
        <div
          key={doc.created_on}
          className="flex-row flex justify-between animate-opacityOpen ease-in-out items-center gap-2 whitespace-nowrap border-secondary border-b p-4 text-sm first:-mt-4 "
        >
          <div className="flex flex-col text-left">
            <span
              key={doc.created_on}
              className={`text-primary text-wrap font-medium hover:opacity-75 transition-all cursor-pointer`}
            >
              {doc.name.slice(0, 28) + "..."}
            </span>

            <span className="text-xs font-light">
              {new Date(doc.created_on).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>

          <Button
            onClick={() => deleteDocument(doc?.id)}
            className="px-2 py-1 hover:bg-red-700 hover:text-white hover:border-transparent"
            variant="outline"
          >
            {deletingDocID === doc?.id ? (
              <Loader1 size="17" />
            ) : (
              <Trash className="w-1.5 h-1.5" />
            )}
          </Button>
        </div>
      ));
    };

    const renderAssistants = () => {
      if (sidebarLoading) {
        return <Loader1 />;
      }

      if (sidebarError) {
        return (
          <div
            key={Date.now()}
            className="text-red-500 py-10 mx-auto text-center"
          >
            {sidebarError}
          </div>
        );
      }

      const filteredAssistantData = (assistants as AssistantObject[])
        .filter((assistant) => !deletedAssistants.includes(assistant?.name.split("---")[1]))
        .map((assistant) => ({
          ...assistant,
          name: assistant.name.split("---")[1] || assistant.name,
        }))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      return filteredAssistantData.map((assistant, id) => (
        <div
          key={id}
          // ${assistant.name == primaryAssistant ? (useTheme().theme == 'dark' ? "bg-neutral-950" : "bg-slate-50") : ""}
          className={`
          transition-all animate-opacityOpen hover:bg-opacity-80 flex-row flex justify-between gap-2 whitespace-nowrap border-secondary border-b p-4 text-sm first:-mt-4 items-center`}
        >
          <TooltipProvider delayDuration={750}>
            <Tooltip>
              <div className="flex flex-col text-left">
                <TooltipTrigger className="p-0 bg-transparent mr-auto border-none focus:outline-none hover:opacity-75">
                  <span
                    onClick={() => updatePrimaryAssistant(assistant.name)}
                    className={`text-wrap ${
                      assistant.name == primaryAssistant ? "text-blue-500" : ""
                    }`}
                  >
                    {assistant.name}
                  </span>
                  <TooltipContent>
                    <p>Set Primary</p>
                  </TooltipContent>
                </TooltipTrigger>
                <span className="text-xs font-light">
                  {new Date(assistant.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </span>
              </div>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={
              assistant?.name == "default"
                ? () => toast("Can't delete default")
                : () => deleteAssistant(assistant?.name)
            }
            className="px-2 py-1 hover:bg-red-700 hover:text-white hover:border-transparent"
            variant="outline"
            disabled={assistant?.name == "default" ? true : false}
          >
            {deletingAssistantID === assistant?.name ? (
              <Loader1 size="17" />
            ) : (
              <Trash className="w-1.5 h-1.5" />
            )}
          </Button>
        </div>
      ));
    };

    const renderChats = () => {
      return [...Array(4)]
        .flatMap(() => data.chats)
        .map((chat, id) => (
          <div
            key={id}
            className="flex-row flex animate-opacityOpen justify-between gap-2 border-secondary border-b p-4 text-sm first:-mt-4 items-center"
          >
            <div className="flex flex-col text-left">
              <a
                key={chat.id}
                className="cursor-pointer flex text-primary hover:opacity-75 flex-col pr-4"
              >
                {chat.chatName}
              </a>
              <span className="text-xs font-light">
                {" "}
                {new Date(chat.createdOn).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
            </div>
            <Button
              className="px-2 py-1 hover:bg-red-700 hover:text-white hover:border-transparent"
              variant="outline"
            >
              <Trash className="w-1.5 h-1.5" />
            </Button>
          </div>
        ));
    };

    const renderContent = () => {
      switch (activeItem) {
        case "Docs":
          return renderDocs();
        case "Assistants":
          return renderAssistants();
        default:
          return renderChats();
      }
    };

    return (
      <Sidebar
        collapsible="icon"
        className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row select-none z-50"
        setIsSidebarOpen={setIsSidebarOpen}
        {...props}
      >
        {/* This is the first sidebar */}
        {/* We disable collapsible and adjust width to icon. */}
        {/* This will make the sidebar appear as icons. */}
        <Sidebar
          collapsible="none"
          className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r border-secondary z-50"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  asChild
                  className="md:h-8 md:p-0"
                  tooltip={{
                    children: "Toggle sidebar",
                    hidden: false,
                  }}
                >
                  {/* <a href="#" className="text-primary bg-secondary hover:text-secondary hover:bg-primary">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a> */}
                  <SidebarTrigger
                    className="text-primary bg-transparent"
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {data.navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => {
                          setActiveItem(item.title);
                          setIsSidebarOpen(true);
                          setOpen(true);
                        }}
                        isActive={activeItem === item.title}
                        className="px-2.5 md:px-2 data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary border-none outline-none text-primary sidebar-background hover:border-none hover:text-primary bg-transparent"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarTrigger
              className="text-primary bg-transparent invisible"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            />
            <NavUser user={data.user} />
          </SidebarFooter>
        </Sidebar>

        {/* This is the second sidebar */}
        {/* We disable collapsible and let it fill remaining space */}
        <Sidebar collapsible="none" className="hidden flex-1 md:flex z-50">
          <SidebarHeader className="gap-3.5 border-b p-4 py-[18px]">
            <div className="flex w-full items-center justify-between">
              <div className="text-base font-medium text-foreground">
                {activeItem}
              </div>
              {/* replace with shadcn command, open a popup and set command in it, 3 options (heading), top 3 assistant, top 3 chats, top 3 documents */}
              <SidebarInput className="w-3/5" placeholder="Search Anything" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                <ScrollArea className="h-full overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-thumb-secondary scrollbar-track-transparent">
                  {renderContent()}
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </Sidebar>
    );
  }
);
