import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import myAxios from "@/lib/axios";
import nProgress from "nprogress";
import { toast } from "sonner";
import { Item } from "@radix-ui/react-dropdown-menu";

// Types
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

// Interface for persisted state
interface PersistedState {
  primaryAssistant: string;
  activeItem: string;
  sidebarOpen: boolean;
}

// Interface for non-persisted state
interface NonPersistedState {
  docs: FileObject[];
  assistants: AssistantObject[];
  sidebarLoading: boolean;
  docsLoading: boolean;
  deletingDocID: string | null;
  deletingAssistantID: string | null;
  sidebarError: string | null;
  deletedDocs: string[];
  deletedAssistants: string[];
}

// Combined state interface
interface SidebarState extends PersistedState, NonPersistedState {
  setPrimaryAssistant: (item: string) => void;
  setSidebarOpen: (item: boolean) => void;
  setActiveItem: (item: string) => void;
  updatePrimaryAssistant: (assistantName: string) => Promise<void>;
  fetchDocs: () => Promise<void>;
  logout: () => Promise<boolean>;
  fetchAssistants: () => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  deleteAssistant: (assistantName: string) => Promise<void>;
}

// Create the persisted part of the store
const createPersistedStore = (initialState: PersistedState) =>
  persist<SidebarState, [], [], PersistedState>(
    (set, get) => ({
      // Persisted state
      ...initialState,

      // Non-persisted state (will be initialized on each app load)
      docs: [],
      assistants: [],
      sidebarLoading: false,
      docsLoading: false,
      deletingDocID: null,
      deletingAssistantID: null,
      sidebarError: null,
      deletedDocs: [],
      deletedAssistants: [],

      
      // update activeItem in localstorage from any other part of the application
      setActiveItem: (item) => {
        set({ activeItem: item });
      },

      // update primaryAssistant in localstorage from any other part of the application
      setPrimaryAssistant : (item) => {
        set({ primaryAssistant: item });
      },

      // update primaryAssistant in localstorage from any other part of the application
      setSidebarOpen : (item) => {
        set({ sidebarOpen: item });
      },

      updatePrimaryAssistant: async (assistantName) => {
        nProgress.start();
        try {
          const formData = new FormData();
          formData.append("assistantName", assistantName);

          const response: any = await myAxios.post(
            "http://localhost:8000/updatePrimaryAssistant",
            formData,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          if (response?.data?.success) {
            set({ primaryAssistant: assistantName });
            toast(`Primary Assistant updated to: ${assistantName}`);
          }
        } catch (error) {
          console.error("Error updating primary assistant:", error);
        } finally {
          nProgress.done();
        }
      },

      logout: async () => {
        try {
          nProgress.start();
          await myAxios.post("http://localhost:8000/auth/logout");
          // navigate("/")
          return true;
        } catch (error) {
          console.log(error);
          return false;
        } finally {
          set({ primaryAssistant: "default" }); // reset primary assistant to default
          // maybe try updating the primary assistant default to the db also
          nProgress.done();
          window.location.reload();
        }
      },

      fetchDocs: async () => {
        set({ docsLoading: true, sidebarError: null });
        nProgress.start();
        try {
          const formData = new FormData();
          formData.append("assistantName", get().primaryAssistant);

          const response: any = await myAxios.post(
            "http://localhost:8000/fetchDocs",
            formData,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          if (response?.data?.files) {
            set({ docs: response.data.files });
          }
        } catch (error) {
          set({ sidebarError: "Failed to fetch documents" });
          console.error(error);
        } finally {
          nProgress.done();
          set({ docsLoading: false });
        }
      },

      fetchAssistants: async () => {
        set({ sidebarLoading: true, sidebarError: null });
        nProgress.start();
        try {
          const response: any = await myAxios.post(
            "http://localhost:8000/getAssistants",
            new FormData(),
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          if (response?.data?.assistants) {
            set({ assistants: response.data.assistants });
          }
        } catch (error) {
          set({ sidebarError: "Failed to fetch assistants" });
          console.error(error);
        } finally {
          nProgress.done();
          set({ sidebarLoading: false });
        }
      },

      deleteDocument: async (id) => {
        nProgress.start();
        set({ deletingDocID: id });
        try {
          const formData = new FormData();
          formData.append("docID", id);
          formData.append("assistantName", get().primaryAssistant);

          const response: any = await myAxios.post(
            "http://localhost:8000/deleteDoc",
            formData,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          if (response.status === 200) {
            toast("Document deleted successfully.");
            set((state) => ({
              deletedDocs: [...state.deletedDocs, id],
              deletingDocID: null,
              // Remove the deleted document from the docs array to trigger a re-render
              docs: state.docs.filter((doc) => doc.id !== id),
            }));
          }
        } catch (error) {
          console.error("Error deleting document:", error);
        } finally {
          nProgress.done();
        }
      },

      deleteAssistant: async (assistantName) => {
        nProgress.start();
        set({ deletingAssistantID: assistantName });
        try {
          const formData = new FormData();
          formData.append("assistantName", assistantName);

          toast(`Deleting assistant ${assistantName}.`);
          const response: any = await myAxios.post(
            "http://localhost:8000/deleteAssistant",
            formData,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          if (response.status === 200) {
            toast("Assistant deleted successfully.");
            set((state) => ({
              deletedAssistants: [...state.deletedAssistants, assistantName],
              deletingAssistantID: null,
              // Remove the deleted assistant from the assistants array to trigger a re-render
              assistants: state.assistants.filter(
                (assistant) => assistant.name !== assistantName
              ),
            }));
            get().deletedAssistants.includes(get().primaryAssistant)
              ? get().updatePrimaryAssistant("default")
              : null;
          }
          await get().fetchAssistants(); // fetching assistants for better consistency
        } catch (error) {
          console.error("Error deleting assistant:", error);
        } finally {
          nProgress.done();
        }
      },
    }),
    {
      name: "sidebar-storage",
      // Only store specific keys in localStorage
      partialize: (state) => ({
        primaryAssistant: state.primaryAssistant,
        activeItem: state.activeItem,
        sidebarOpen: state.sidebarOpen
      }),
      storage: createJSONStorage(() => localStorage),
    }
  );

// Initialize the store with default values
export const useSidebarStore = create(
  createPersistedStore({
    primaryAssistant: "default",
    activeItem: "Docs",
    sidebarOpen: true
  })
);

function getState() {
  throw new Error("Function not implemented.");
}
