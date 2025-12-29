import { Link, useLocation } from "react-router";
import {
  Menu,
  X,
  Server
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Triton Servers", href: "/", icon: Server },
];

export function Sidebar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-300 hover:bg-[#1a1a1a]"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-[#121212] border-r border-[#2a2a2a]`}
      >
        <div className="h-full px-3 py-2 overflow-y-auto">
          <div className="flex justify-center lg:justify-start">
            <Link to="/" className="flex items-center group">
              <img 
                src="/assets/logo.png" 
                alt="Triton Studio" 
                className="h-14 w-auto max-w-[180px] object-contain transition-opacity group-hover:opacity-80"
              />
            </Link>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#1a1a1a] text-[#76b900] border-l-2 border-[#76b900]"
                      : "text-gray-300 hover:bg-[#1a1a1a] hover:text-gray-100"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

