/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Pagenotfound from "../../pages/Pagenotfound";

jest.mock("../../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Pagenotfound", () => {
  test("renders page not found with correct title", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toHaveAttribute("data-title", "go back- page not found");
  });

  test("renders 404 error code", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  test("renders error message", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
  });

  test("renders go back link with correct href", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    const goBackLink = screen.getByText("Go Back");
    expect(goBackLink).toBeInTheDocument();
    expect(goBackLink.closest("a")).toHaveAttribute("href", "/");
  });
});