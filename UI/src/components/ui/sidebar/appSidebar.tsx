import * as React from "react";
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
import { useState, useEffect } from "react";
import axios from "axios";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Docs",
      url: "#",
      icon: FileText,
      isActive: true,
    },
    // {
    //   title: "Assistants",
    //   url: "#",
    //   icon: UserIcon,
    //   isActive: false,
    // },
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
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: "Sarah Brown",
      email: "sarahbrown@example.com",
      subject: "Re: Feedback on Proposal",
      date: "1 week ago",
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: "David Lee",
      email: "davidlee@example.com",
      subject: "New Project Idea",
      date: "1 week ago",
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: "Olivia Wilson",
      email: "oliviawilson@example.com",
      subject: "Vacation Plans",
      date: "1 week ago",
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: "James Martin",
      email: "jamesmartin@example.com",
      subject: "Re: Conference Registration",
      date: "1 week ago",
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: "Sophia White",
      email: "sophiawhite@example.com",
      subject: "Team Dinner",
      date: "1 week ago",
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
};

interface Document {
  created_on: string;
  id: string;
  metadata: null | Record<string, any>;
  name: string;
  percent_done: number;
  signed_url: null | string;
  size: number;
  status: string;
  updated_on: string;
}


export function AppSidebar({
  setIsSidebarOpen,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [mails, setMails] = useState(data.mails);
  const { setOpen } = useSidebar();
  const [docs, setDocs] = useState<Object>({});
  const ASSISTANT_NAME = "aiplanetassistant"

  
  const fetchDocs = async () => {
    const formData = new FormData();
    formData.append("assistantName", ASSISTANT_NAME);

    try {
      const response = await axios.post("http://localhost:8000/fetchDocs", formData);
      console.log(response.data)

    } catch (error) {
      console.error(error)
    }
  }

  const renderDocs = () => {
    // fetch docs from the pinecone assistant
    fetchDocs()

    return [...Array(4)]
      .flatMap(() => data.docs)
      .map((doc) => (
        <div className="flex-row flex justify-between	items-center gap-2 whitespace-nowrap border-secondary border-b p-4 text-sm first:-mt-4">
          <div className="flex-col flex">
            <a
              key={doc.id}
              className="flex text-primary flex-col cursor-pointer"
            >
              {doc.name}
            </a>
            <span className="text-xs font-light">
              {" "}
              {new Date(doc.createdOn).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
          <Button className="px-2 py-1" variant="destructive">
            <Trash className="w-1.5 h-1.5" />
          </Button>
        </div>
      ));
  };

  const renderAssistants = () => {
    return [...Array(4)]
      .flatMap(() => data.assistants)
      .map((assistant) => (
        <div className="flex-row flex justify-between	 items-start gap-2 whitespace-nowrap border-secondary border-b p-4 text-sm first:-mt-4 items-center">
          <div className="flex-col flex">
            <a
              key={assistant.id}
              className="cursor-pointer flex text-primary flex-col"
            >
              {assistant.name}
            </a>
            <span className="text-xs font-light">
              {" "}
              {new Date(assistant.createdOn).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
          <Button className="px-2 py-1" variant="destructive">
            <Trash className="w-1.5 h-1.5" />
          </Button>
        </div>
      ));
  };

  const renderChats = () => {
    return [...Array(4)]
      .flatMap(() => data.chats)
      .map((chat) => (
        <div className="flex-row flex justify-between items-start gap-2 border-secondary border-b p-4 text-sm first:-mt-4 items-center">
          <div className="flex-col flex">
            <a
              key={chat.id}
              className="cursor-pointer flex text-primary flex-col pr-4"
            >
              {chat.chatName}
            </a>
            {/* <span className="text-xs font-light">
              {" "}
              {new Date(chat.createdOn).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span> */}
          </div>
          <Button className="px-2 py-1" variant="destructive">
            <Trash className="w-1.5 h-1.5" />
          </Button>
        </div>
      ));
  };

  const renderContent = () => {
    switch (activeItem.title) {
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
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row select-none"
      setIsSidebarOpen={setIsSidebarOpen}
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r border-secondary"
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
                        setActiveItem(item);
                        const mail = data.mails.sort(() => Math.random() - 0.5);
                        setMails(
                          mail.slice(
                            0,
                            Math.max(5, Math.floor(Math.random() * 10) + 1)
                          )
                        );
                        setIsSidebarOpen(true);
                        setOpen(true);
                      }}
                      isActive={activeItem.title === item.title}
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
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4 py-[18px] ">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem.title}
            </div>
            {/* replace with shadcn command, open a popup and set command in it, 3 options (heading), top 3 assistant, top 3 chats, top 3 documents */}
            <SidebarInput className="w-2/3" placeholder="Search Anything" />
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
