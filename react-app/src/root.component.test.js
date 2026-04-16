import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { navigateToUrl } from "single-spa";
import Root from "./root.component";
import SmartSearch from "@shared/SmartSearch.js";

jest.mock("single-spa", () => ({
  navigateToUrl: jest.fn(),
}));

describe("Root component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation and search controls", () => {
    render(<Root />);

    expect(screen.getByRole("link", { name: /skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle navigation menu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /home \(react\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vue app/i })).toBeInTheDocument();
  });

  it("initially renders with light theme and toggles to dark theme", async () => {
    const setDataSpy = jest.spyOn(SmartSearch.prototype, "setData");
    render(<Root />);

    expect(document.querySelector(".react-layout")).toHaveClass("theme-light");
    expect(setDataSpy).toHaveBeenCalledTimes(1);

    const toggleButton = screen.getByRole("button", {
      name: /toggle react search theme/i,
    });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.querySelector(".react-layout")).toHaveClass("theme-dark");
    });

    const searchEl = document.querySelector("smart-search");
    expect(searchEl).toHaveAttribute("theme", "dark");

    setDataSpy.mockRestore();
  });

  it("navigates to the Vue app when clicking the Vue App button", () => {
    render(<Root />);

    fireEvent.click(screen.getByRole("button", { name: /vue app/i }));
    expect(navigateToUrl).toHaveBeenCalledWith("/vue");
  });
});
