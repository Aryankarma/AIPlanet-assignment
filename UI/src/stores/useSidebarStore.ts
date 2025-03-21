import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import myAxios from "@/lib/axios";
import nProgress from "nprogress";
import { toast } from "sonner";

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
  setActiveItem: (item: string) => void;
  updatePrimaryAssistant: (assistantName: string) => Promise<void>;
  fetchDocs: () => Promise<void>;
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
      
      // Actions
      setActiveItem: (item) => {
        set({ activeItem: item });
      },

      updatePrimaryAssistant: async (assistantName) => {
        nProgress.start();
        try {
          const formData = new FormData();
          formData.append("assistantName", assistantName);

          const response: any = await myAxios.post(
            "http://localhost:8000/updatePrimaryAssistant",
            formData,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
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

      fetchDocs: async () => {
        set({ docsLoading: true, sidebarError: null });
        nProgress.start();
        try {
          const formData = new FormData();
          formData.append("assistantName", get().primaryAssistant);

          const response: any = await myAxios.post(
            "http://localhost:8000/fetchDocs",
            formData,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
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
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
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
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
          );

          if (response.status === 200) {
            toast("Document deleted successfully.");
            set((state) => ({ 
              deletedDocs: [...state.deletedDocs, id], 
              deletingDocID: null,
              // Remove the deleted document from the docs array to trigger a re-render
              docs: state.docs.filter(doc => doc.id !== id)
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

          toast(`Deleting assistant ${assistantName}.`)
          const response: any = await myAxios.post(
            "http://localhost:8000/deleteAssistant",
            formData,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
          );

          if (response.status === 200) {
            toast("Assistant deleted successfully.");
            set((state) => ({ 
              deletedAssistants: [...state.deletedAssistants, assistantName], 
              deletingAssistantID: null,
              // Remove the deleted assistant from the assistants array to trigger a re-render
              assistants: state.assistants.filter(assistant => assistant.name !== assistantName)
            }));
            get().deletedAssistants.includes(get().primaryAssistant) ? get().updatePrimaryAssistant("default") : null
          }
          await get().fetchAssistants() // fetching assistants for better consistency
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
      }),
      storage: createJSONStorage(() => localStorage),
    }
  );

// Initialize the store with default values
export const useSidebarStore = create(
  createPersistedStore({
    primaryAssistant: localStorage.getItem("primaryAssistant") || "default",
    activeItem: localStorage.getItem("activeItem") || "Docs",
  })
);