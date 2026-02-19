/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import About from "../../pages/About";

jest.mock("../../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("About", () => {
  test("renders about page with correct title", () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toHaveAttribute("data-title", "About us - Ecommerce app");
  });

  test("renders about text", () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText("Add text")).toBeInTheDocument();
  });

  test("renders about image", () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/about.jpeg");
  });
});