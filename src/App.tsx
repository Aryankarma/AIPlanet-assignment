import { ThemeProvider } from "./components/ui/ThemeProvider";
import { ModeToggle } from "./components/ui/ThemeToggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col justify-center items-center w-[100vw] h-[100vh]">
        <div className="absolute right-5 top-5">
          <ModeToggle />
        </div>
        <h1>This is a repo setup with React + ShadCN</h1>
      </div>
    </ThemeProvider>
  );
}

export default App;
