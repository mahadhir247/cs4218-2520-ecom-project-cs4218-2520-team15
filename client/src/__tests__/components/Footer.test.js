/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "../../components/Footer";

describe("Footer", () => {
  test("renders footer with copyright text", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();
    expect(screen.getByText(/TestingComp/i)).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const aboutLink = screen.getByText("About");
    const contactLink = screen.getByText("Contact");
    const policyLink = screen.getByText("Privacy Policy");

    expect(aboutLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
    expect(policyLink).toBeInTheDocument();

    expect(aboutLink.closest("a")).toHaveAttribute("href", "/about");
    expect(contactLink.closest("a")).toHaveAttribute("href", "/contact");
    expect(policyLink.closest("a")).toHaveAttribute("href", "/policy");
  });
});