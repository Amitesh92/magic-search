import "@testing-library/jest-dom";
import { fireEvent, waitFor } from "@testing-library/dom";
import SmartSearch from "@shared/SmartSearch.js";

beforeAll(() => {
  if (!customElements.get("smart-search")) {
    customElements.define("smart-search", SmartSearch);
  }
});

afterEach(() => {
  document.body.innerHTML = "";
  jest.useRealTimers();
});

describe("SmartSearch Web Component", () => {
  it("renders the search input with placeholder and aria label", () => {
    const el = document.createElement("smart-search");
    el.setAttribute("placeholder", "Search accounts");
    el.setAttribute("aria-label", "Bank search");

    document.body.appendChild(el);

    const input = el.shadowRoot.querySelector(".search-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search accounts");
    expect(input).toHaveAttribute("aria-label", "Bank search");
  });

  it("reflects dark theme changes via attribute and property", () => {
    const el = document.createElement("smart-search");
    document.body.appendChild(el);

    el.setAttribute("theme", "dark");

    expect(el.getAttribute("theme")).toBe("dark");
    expect(el.theme).toBe("dark");
  });

  it("shows results when typing and emits select event on result click", async () => {
    jest.useFakeTimers();
    const el = document.createElement("smart-search");
    document.body.appendChild(el);
    el.setData([
      { id: 1, label: "Account 123456789", type: "Accounts" },
      { id: 2, label: "Transaction #987654", type: "Transactions" },
    ]);

    const input = el.shadowRoot.querySelector(".search-input");
    fireEvent.input(input, { target: { value: "Account" } });

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(el.shadowRoot.querySelector(".result-item")).toBeInTheDocument();
    });

    const selectHandler = jest.fn();
    el.addEventListener("select", selectHandler);

    const item = el.shadowRoot.querySelector(".result-item");
    fireEvent.mouseDown(item);
    fireEvent.click(item);

    await waitFor(() => {
      expect(selectHandler).toHaveBeenCalled();
    });
  });

  it("displays the clear button when input has text and clears input on click", async () => {
    jest.useFakeTimers();
    const el = document.createElement("smart-search");
    document.body.appendChild(el);
    el.setData([{ id: 1, label: "Account 123", type: "Accounts" }]);

    const input = el.shadowRoot.querySelector(".search-input");
    fireEvent.input(input, { target: { value: "Account" } });
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(el.shadowRoot.querySelector(".clear-btn").style.display).toBe("block");
    });

    fireEvent.click(el.shadowRoot.querySelector(".clear-btn"));
    expect(input.value).toBe("");
    expect(el.shadowRoot.querySelector(".dropdown").classList.contains("open")).toBe(false);
  });
});
