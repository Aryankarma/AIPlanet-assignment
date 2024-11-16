import { ThemeProvider } from "./components/ui/ThemeProvider";
import ChatInterface from "./components/app/chatInterface";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col justify-center items-center w-[100vw] h-[100vh]">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
}

export default App;
