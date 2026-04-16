class SmartSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.results = [];
    this.filteredResults = [];
    this.selectedIndex = -1;
    this.isOpen = false;
    this.filters = [];
    this.placeholder = "Search...";
    this.highlightTerm = "";
    this.inputAriaLabel = "Search input";
    this.inputAriaLabelledby = "";
    this.inputAriaDescribedby = "";
    this._theme = "light";
    this.maxResults = 10;
    this.debounceTimer = null;
    this.debounceDelay = 300;
    this.isLoading = false;
    this.selectedFilter = "";
  }

  get theme() {
    return this._theme || "light";
  }

  set theme(value) {
    const normalized = value || "light";
    if (this._theme === normalized) return;
    this._theme = normalized;
    if (this.getAttribute("theme") !== normalized) {
      super.setAttribute("theme", normalized);
    }
    this.updateTheme();
  }

  connectedCallback() {
    // Ensure shadow DOM exists before rendering
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this.render();
    this.attachEventListeners();
    this.updateTheme();
    this.updatePlaceholder();
    this.updateAccessibility();
  }

  disconnectedCallback() {
    // Clean up window event listeners
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
  }

  static get observedAttributes() {
    return ["placeholder", "theme", "max-results", "filters", "aria-label", "aria-labelledby", "aria-describedby"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "placeholder") {
      this.placeholder = newValue;
      this.updatePlaceholder();
    } else if (name === "theme") {
      this.theme = newValue;
      this.updateTheme();
    } else if (name === "max-results") {
      this.maxResults = parseInt(newValue) || 10;
    } else if (name === "filters") {
      const parsed = JSON.parse(newValue || "[]");
      this.filters = Array.isArray(parsed) ? parsed : [];
      this.render();
    } else if (name === "aria-label") {
      this.inputAriaLabel = newValue || "Search input";
      this.updateAccessibility();
    } else if (name === "aria-labelledby") {
      this.inputAriaLabelledby = newValue || "";
      this.updateAccessibility();
    } else if (name === "aria-describedby") {
      this.inputAriaDescribedby = newValue || "";
      this.updateAccessibility();
    }
  }

  render() {
    try {
      // Ensure shadow root exists
      if (!this.shadowRoot) {
        console.error("SmartSearch: Shadow DOM not attached");
        return;
      }

      const hasFilters = Array.isArray(this.filters) && this.filters.length > 0;
      const filterOptions = hasFilters
        ? this.filters.map((val) => `<option value="${val}"> ${val} </option>`).join("")
        : "";
      
      // Set innerHTML with complete template
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          display: block;
          width: 100%;

          --primary-color: #007bff;
          --text-color: #333;
          --bg-color: #fff;
          --border-color: #ccc;
          --shadow: 0 2px 8px rgba(0,0,0,0.1);
          --highlight-color: #ffeb3b;
          --border-focus: #0056b3;
        }
        :host([theme="dark"]) {
          --text-color: #fff;
          --bg-color: #333;
          --border-color: #ddd;
          --shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .search-container {
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 12px 40px 12px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-color);
          color: var(--text-color);
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
            
        .menu-item:focus,
        .grid-block:focus {
          outline: 3px solid var(--highlight-color);
          outline-offset: 2px;
        }
        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          box-shadow: var(--shadow);
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
          display: none;
        }
        .dropdown.open {
          display: block;
        }
        .result-item {
          padding: 10px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
        }
        .result-item:last-child {
          border-bottom: none;
        }
        .result-item.selected {
          background: var(--primary-color);
          color: white;
        }
        .result-item:hover {
          background: var(--primary-color);
          color: white;
        }
        .highlight {
          background: var(--highlight-color);
        }
        .filters {
          margin-bottom: 10px;
        }
        .filter-btn {
          margin-right: 5px;
          padding: 5px 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-color);
          color: var(--text-color);
          cursor: pointer;
          border-radius: 4px;
        }
        .filter-btn.active {
          background: var(--primary-color);
          color: white;
        }
        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: transparent;
          z-index: 999;
          display: none;
        }
        .clear-btn{
          position: absolute;
          right: ${hasFilters ? "125px" : "10px"};
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #999;
          display: none;
        }
        .backdrop.open {
          display: block;
        }
        .input-wrapper {
            display: flex;
            gap: 5px;
        }

        .filter-dropdown {
            padding: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-color);
            color: var(--text-color);
            border-radius: 4px;
            display: ${hasFilters ? "block" : "none"};
        }

        .loader {
          padding: 10px;
          text-align: center;
          font-size: 14px;
        }

        .no-results {
          padding: 10px;
          text-align: center;
          color: gray;
        }
        @media (max-width: 768px) {
          .search-input {
            font-size: 18px;
          }
        }
      </style>

        <div class="search-container">
          <div class="input-wrapper">
            <input
              type="text"
              class="search-input"
              placeholder="${this.placeholder}"
              aria-label="${this.inputAriaLabel}"
              aria-labelledby="${this.inputAriaLabelledby}"
              aria-describedby="${this.inputAriaDescribedby}"
              aria-expanded="${this.isOpen}"
              aria-haspopup="listbox"
              aria-controls="search-results-list"
              name="search"
            />
            <button type="button" class="clear-btn" aria-label="Clear search">×</button>
              ${
                hasFilters
                  ? `
                    <select class="filter-dropdown" id="filter-dropdown" name="filter" aria-label="Filter search results">
                      <option value="" name="filter-option">All</option>
                      ${filterOptions}
                    </select>
                `
                  : ""
              }
          </div>
          <div id="search-results-list" class="dropdown" role="listbox" aria-live="polite"></div>
        </div>
        <div class="backdrop" role="presentation"></div>
    `;
    } catch (error) {
      console.error("SmartSearch render error:", error);
    }
  }

  attachEventListeners() {
    if (!this.shadowRoot) return;

    const input = this.shadowRoot.querySelector(".search-input");
    const clearBtn = this.shadowRoot.querySelector(".clear-btn");
    const dropdown = this.shadowRoot.querySelector(".dropdown");
    const backdrop = this.shadowRoot.querySelector(".backdrop");
    const filterDropdown = this.shadowRoot.querySelector(".filter-dropdown");

    if (input) {
      input.addEventListener("input", this.handleInput.bind(this));
      input.addEventListener("keydown", this.handleKeydown.bind(this));
      input.addEventListener("focus", this.handleFocus.bind(this));
      input.addEventListener("blur", this.handleBlur.bind(this));
    }
    
    if (clearBtn) {
      clearBtn.addEventListener("click", this.clearSearch.bind(this));
    }
    
    if (backdrop) {
      backdrop.addEventListener("click", this.closeDropdown.bind(this));
    }
    
    if (dropdown) {
      dropdown.addEventListener("mousedown", this.handleResultClick.bind(this));
    }

    if (filterDropdown) {
      filterDropdown.addEventListener("change", (e) => {
        this.selectedFilter = e.target.value;

        const currentInput = this.shadowRoot.querySelector(".search-input");
        if (currentInput && currentInput.value.trim()) {
          this.performSearch(currentInput.value.trim());
        }
      });
    }

    // Position update on resize/scroll
    if (!this.resizeListener) {
      this.resizeListener = this.updatePosition.bind(this);
      this.scrollListener = this.updatePosition.bind(this);
      window.addEventListener("resize", this.resizeListener);
      window.addEventListener("scroll", this.scrollListener);
    }
  }

  handleInput(e) {
    const query = e.target.value.trim();
    this.highlightTerm = query;
    if (query) {
      this.showClearBtn();
      this.debouncedSearch(query);
    } else {
      this.hideClearBtn();
      this.closeDropdown();
    }
  }

  debouncedSearch(query) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, this.debounceDelay);
  }

  async performSearch(query) {
    this.isLoading = true;
    this.renderResults();
    this.openDropdown();

    // Simulate API delay
    await new Promise((res) => setTimeout(res, 500));

    this.filteredResults = this.results
      .filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) &&
          this.matchesFilters(item),
      )
      .slice(0, this.maxResults);

    this.isLoading = false;

    this.renderResults();

    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          query,
          filter: this.selectedFilter,
          results: this.filteredResults,
        },
      }),
    );
  }

  matchesFilters(item) {
    if (!this.selectedFilter) return true;
    return item.type === this.selectedFilter;
  }

  renderResults() {
    const dropdown = this.shadowRoot.querySelector(".dropdown");

    if (this.isLoading) {
      dropdown.innerHTML = `<div class="loader">Searching...</div>`;
      return;
    }

    if (this.filteredResults.length === 0) {
      dropdown.innerHTML = `<div class="no-results">No results found</div>`;
      return;
    }

    dropdown.innerHTML = this.filteredResults
      .map(
        (item, index) => `
        <div class="result-item ${index === this.selectedIndex ? "selected" : ""}"
            data-index="${index}"
            role="option"
            aria-selected="${index === this.selectedIndex}">
        ${this.highlightText(item.label)}
        </div>
    `,
      )
      .join("");
  }

  highlightText(text) {
    if (!this.highlightTerm) return text;
    const regex = new RegExp(`(${this.escapeRegex(this.highlightTerm)})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  handleKeydown(e) {
    if (!this.isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.selectNext();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.selectPrev();
        break;
      case "Enter":
        e.preventDefault();
        this.selectCurrent();
        break;
      case "Escape":
        this.closeDropdown();
        break;
    }
  }

  selectNext() {
    this.selectedIndex = Math.min(
      this.selectedIndex + 1,
      this.filteredResults.length - 1,
    );
    this.updateSelection();
  }

  selectPrev() {
    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    this.updateSelection();
  }

  updateSelection() {
    const items = this.shadowRoot.querySelectorAll(".result-item");
    items.forEach((item, index) => {
      item.classList.toggle("selected", index === this.selectedIndex);
      item.setAttribute("aria-selected", index === this.selectedIndex);
    });
    this.scrollToSelected();
  }

  scrollToSelected() {
    const selected = this.shadowRoot.querySelector(".result-item.selected");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }

  selectCurrent() {
    if (
      this.selectedIndex >= 0 &&
      this.selectedIndex < this.filteredResults.length
    ) {
      const item = this.filteredResults[this.selectedIndex];

      const input = this.shadowRoot.querySelector(".search-input");
      input.value = item.label;
      this.dispatchEvent(new CustomEvent("select", { detail: item }));
      this.closeDropdown();
      this.filteredResults = [];
    }
  }

  handleResultClick(e) {
    const itemEl = e.target.closest(".result-item");
    if (!itemEl) return;

    const index = itemEl.dataset.index;
    this.selectedIndex = parseInt(index);
    this.selectCurrent();
  }

  handleFocus() {
    if (this.filteredResults.length > 0) {
      this.openDropdown();
    }
  }

  handleBlur(e) {
    // Delay to allow click on dropdown
    setTimeout(() => {
      if (!this.shadowRoot.contains(document.activeElement)) {
        this.closeDropdown();
      }
    }, 150);
  }

  openDropdown() {
    this.isOpen = true;
    const input = this.shadowRoot.querySelector(".search-input");
    if (input) {
      input.setAttribute("aria-expanded", "true");
    }
    this.shadowRoot.querySelector(".dropdown").classList.add("open");
    this.shadowRoot.querySelector(".backdrop").classList.add("open");
    this.updatePosition();
  }

  closeDropdown() {
    this.isOpen = false;
    const input = this.shadowRoot.querySelector(".search-input");
    if (input) {
      input.setAttribute("aria-expanded", "false");
    }
    this.shadowRoot.querySelector(".dropdown").classList.remove("open");
    this.shadowRoot.querySelector(".backdrop").classList.remove("open");
    this.selectedIndex = -1;
  }

  updatePosition() {
    if (!this.isOpen) return;
    const input = this.shadowRoot.querySelector(".search-input");
    const dropdown = this.shadowRoot.querySelector(".dropdown");
    const rect = input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = dropdown.offsetHeight || 300;

    if (rect.bottom + dropdownHeight > viewportHeight) {
      dropdown.style.top = "auto";
      dropdown.style.bottom = "100%";
    } else {
      dropdown.style.top = "100%";
      dropdown.style.bottom = "auto";
    }
  }

  clearSearch() {
    const input = this.shadowRoot.querySelector(".search-input");
    input.value = "";
    this.hideClearBtn();
    this.closeDropdown();
    this.filteredResults = [];
    this.dispatchEvent(new CustomEvent("clear"));
  }

  showClearBtn() {
    this.shadowRoot.querySelector(".clear-btn").style.display = "block";
  }

  hideClearBtn() {
    this.shadowRoot.querySelector(".clear-btn").style.display = "none";
  }

  updatePlaceholder() {
    const input = this.shadowRoot.querySelector(".search-input");
    // Only update if the element exists in the DOM
    if (input) {
      input.placeholder = this.placeholder;
    }
  }

  updateAccessibility() {
    const input = this.shadowRoot.querySelector(".search-input");
    if (!input) return;

    if (this.inputAriaLabel) {
      input.setAttribute("aria-label", this.inputAriaLabel);
    } else {
      input.removeAttribute("aria-label");
    }

    if (this.inputAriaLabelledby) {
      input.setAttribute("aria-labelledby", this.inputAriaLabelledby);
    } else {
      input.removeAttribute("aria-labelledby");
    }

    if (this.inputAriaDescribedby) {
      input.setAttribute("aria-describedby", this.inputAriaDescribedby);
    } else {
      input.removeAttribute("aria-describedby");
    }
  }

  updateTheme() {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot.host;
    if (this.theme === "dark") {
      root.style.setProperty("--text-color", "#fff");
      root.style.setProperty("--bg-color", "#333");
      root.style.setProperty("--border-color", "#ddd");
      root.style.setProperty("--shadow", "0 2px 8px rgba(0,0,0,0.3)");
    } else {
      root.style.setProperty("--text-color", "#333");
      root.style.setProperty("--bg-color", "#fff");
      root.style.setProperty("--border-color", "#ccc");
      root.style.setProperty("--shadow", "0 2px 8px rgba(0,0,0,0.1)");
    }
  }

  // Public API
  setData(data) {
    this.results = data;
  }

  getData() {
    return this.results;
  }

  setFilters(filters) {
    this.filters = filters;
    this.render();
  }
}

// Register the custom element immediately and before any export
if (!customElements.get("smart-search")) {
  customElements.define("smart-search", SmartSearch);
}

export default SmartSearch;
