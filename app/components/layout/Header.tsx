import { Bell, Search, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 py-4 lg:ml-64">
        <div className="flex items-right justify-end">
          <div className="flex items-right gap-4 ml-4">
          </div>
        </div>
      </div>
    </header>
  );
}

