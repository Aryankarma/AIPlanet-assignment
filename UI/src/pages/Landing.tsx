import React from 'react';
import { Menu, X, ChevronRight, Bot, Database, FileText, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold text-white">DocumentAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a>
              <div className="flex items-center space-x-4">
                <Button onClick={() => navigate("/login")}  variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/register")}  className="bg-blue-600 text-white hover:bg-blue-700">
                  Sign Up
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-950">
              <a href="#" className="block px-3 py-2 text-gray-300 hover:text-white">Features</a>
              <a href="#" className="block px-3 py-2 text-gray-300 hover:text-white">Pricing</a>
              <a href="#" className="block px-3 py-2 text-gray-300 hover:text-white">Documentation</a>
              <Button onClick={() => navigate("/login")} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Sign In
              </Button>
              <Button onClick={() => navigate("/register")} className="w-full mt-2 bg-blue-600 text-white hover:bg-blue-700">
                Sign Up Free
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="pt-24 lg:pt-32 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 flex h-[100vh] items-center justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Card className="bg-blue-500/10 border-blue-500/20 px-4 py-1 inline-flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-500 rounded-full">Models from Claude & OpenAI</span>
              </Card>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Your Documents,{' '}
              <span className="text-blue-500">Enhanced by AI</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Create custom AI assistants trained on your documents. Get precise answers 
              powered by leading language models, strictly based on your data.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* <Button onClick={() => navigate("/register")}  size="lg" className="w-full text-primary sm:w-auto bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button> */}
              <Button onClick={() => navigate("/chat")} size="lg" variant="outline" className="w-full sm:w-auto flex items-center bg-transparent">
                Try it out
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-12 flex justify-center gap-8">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-gray-400">Secure Data</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-gray-400">Custom Training</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;