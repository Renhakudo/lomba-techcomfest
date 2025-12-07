import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import Forum from "./pages/Forum";
import Gamification from "./pages/Gamification";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/register";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import Protected from "./components/Protected";
import ProfilePage from "./pages/ProfilePage";
import LessonDetail from "./pages/LessonDetail";
import ForumChat from "./pages/ForumChat";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/modules" element={<Modules />} />


              {/* Protected Routes */}
              <Route path="/module/:moduleId" element={<Protected><ModuleDetail /></Protected>} />
              <Route path="/module/:moduleId/lesson/:lessonId" element={<LessonDetail />} />
              <Route path="/forum" element={<Protected><Forum /></Protected>} />
              <Route path="/gamification" element={<Protected><Gamification /></Protected>} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profilepage" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/ForumChat/:id"element={<Protected><ForumChat /></Protected>}
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>

    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
