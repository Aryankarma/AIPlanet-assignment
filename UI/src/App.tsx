import { ThemeProvider } from "./components/ui/ThemeProvider";
import ChatInterface from "./pages/ChatInterface";
import { Layout } from "./components/layout";

function App() {
  return (
    <div className="flex flex-col justify-center items-center">
      <Layout>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <ChatInterface />
        </ThemeProvider>
      </Layout>
    </div>
  );
}

export default App;
