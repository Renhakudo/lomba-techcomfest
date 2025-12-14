import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  BookOpen,
  LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

// 1. Import gambar dari folder assets
// Pastikan file 'navbar-tera.png' ada di folder 'src/assets/'
import teraLogo from "@/assets/navbar-tera.png";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const publicLinks = [];

  const privateLinks = [
    { to: "/modules", label: "Modules", icon: BookOpen },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const navLinks = user ? privateLinks : publicLinks;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold">
            {/* 2. Gunakan variabel import tadi di sini */}
            <img 
              src={teraLogo} 
              alt="Tera Logo" 
              className="w-16 h-16 object-contain hover:scale-105 transition-transform"
            />
            
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors font-medium"
                activeClassName="text-primary font-semibold"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            {user ? (
              <Button onClick={() => supabase.auth.signOut()}>
                Logout
              </Button>
            ) : (
              <NavLink to="/login">
                <Button>Login</Button>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in bg-card/95 backdrop-blur-xl">
            <div className="flex flex-col gap-3">

              {/* Mobile nav links */}
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                  activeClassName="bg-primary/10 text-primary font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </NavLink>
              ))}

              {/* Mobile CTA Button Logic */}
              <div className="px-4 mt-2">
                {user ? (
                  <Button 
                    variant="destructive" 
                    className="w-full shadow-md"
                    onClick={() => {
                        supabase.auth.signOut();
                        setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="btn-gradient-primary w-full shadow-md">
                      Get Started
                    </Button>
                  </NavLink>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;