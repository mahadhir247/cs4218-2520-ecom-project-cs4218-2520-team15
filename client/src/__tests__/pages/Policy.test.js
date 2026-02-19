/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Policy from "../../pages/Policy";

jest.mock("../../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Policy", () => {
  test("renders policy page with correct title", () => {
    render(
      <BrowserRouter>
        <Policy />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toHaveAttribute("data-title", "Privacy Policy");
  });

  test("renders privacy policy placeholder text", () => {
    render(
      <BrowserRouter>
        <Policy />
      </BrowserRouter>
    );

    const policyTexts = screen.getAllByText("add privacy policy");
    expect(policyTexts).toHaveLength(7);
  });

  test("renders policy image", () => {
    render(
      <BrowserRouter>
        <Policy />
      </BrowserRouter>
    );

    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });
});