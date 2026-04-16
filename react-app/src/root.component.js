import React, { useState, useRef, useEffect } from "react";
import { navigateToUrl } from "single-spa";
import "./root.component.css";
import "@shared/SmartSearch.js";

const sampleData = [
  { id: 1, label: "Account 123456789", type: "Accounts" },
  { id: 2, label: "Transaction #987654", type: "Transactions" },
  { id: 3, label: "Customer John Doe", type: "Customers" },
  { id: 4, label: "Account 987654321", type: "Accounts" },
  { id: 5, label: "Transaction #123456", type: "Transactions" },
  { id: 6, label: "Customer Jane Smith", type: "Customers" },
  { id: 7, label: "Account 555666777", type: "Accounts" },
  { id: 8, label: "Transaction #789012", type: "Transactions" },
  { id: 9, label: "Customer Bob Johnson", type: "Customers" },
  { id: 10, label: "Account 111222333", type: "Accounts" },
];

export default function Root() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const gridItems = Array.from({ length: 16 }, (_, i) => i + 1);
  const searchRef = useRef(null);

  useEffect(() => {
    const searchEl = searchRef.current;
    if (!searchEl) return;

    // Set the data
    searchEl.setData(sampleData);

    // Event Handlers (Equivalent to your logEvent logic)
    const handleSearch = (e) => console.log("React Search Event:", e.detail);
    const handleSelect = (e) => console.log("React Select Event:", e.detail);
    const handleClear = () => console.log("React Clear Event");

    searchEl.addEventListener("search", handleSearch);
    searchEl.addEventListener("select", handleSelect);
    searchEl.addEventListener("clear", handleClear);

    return () => {
      searchEl.removeEventListener("search", handleSearch);
      searchEl.removeEventListener("select", handleSelect);
      searchEl.removeEventListener("clear", handleClear);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    const el = searchRef.current;
    if (el) {
      el.setAttribute("theme", nextTheme);
    }
  };
  // Close menu on "Escape" key for accessibility
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleNavigation = (path) => {
    navigateToUrl(path);
    setIsMenuOpen(false);
  };

  return (
    <div className={`react-layout ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {/* Skip Link: Allows keyboard users to jump straight to content */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="mobile-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="sidebar-menu"
        >
          ☰
        </button>
        <div className="mobile-title">My App</div>
      </header>

      <div className="container">
        {/* Semantic <nav> for screen readers */}
        <aside
          id="sidebar-menu"
          className={`sidebar ${isMenuOpen ? "open" : ""}`}
          aria-hidden={!isMenuOpen && window.innerWidth <= 1024}
        >
          <nav aria-label="Main Navigation">
            <ul className="menu-list">
              <li>
                <button
                  type="button"
                  className="menu-item active"
                  onClick={() => handleNavigation("/react")}
                  aria-current="page"
                >
                  Home (React)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => handleNavigation("/vue")}
                >
                  Vue App
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {isMenuOpen && (
          <div
            className="overlay"
            onClick={() => setIsMenuOpen(false)}
            role="presentation"
          ></div>
        )}

        <main id="main-content" className="content">
          <section className="search-section" role="search" aria-label="Search banking records">
            <button type="button" onClick={toggleTheme} aria-label="Toggle React search theme">
              Toggle React Search Theme
            </button>
            <smart-search
              ref={searchRef}
              placeholder="Search across banking entities..."
              aria-label="Search through site content"
              theme={theme}
              filters='["Accounts", "Transactions", "Customers"]'
            ></smart-search>
          </section>

          <section className="grid-section" aria-label="Items grid">
            <div className="grid-container" role="list">
              {gridItems.map((item) => (
                <div
                  key={item}
                  className="grid-block"
                  role="listitem"
                >
                  Block {item}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
