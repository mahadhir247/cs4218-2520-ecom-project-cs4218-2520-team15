/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Contact from "../../pages/Contact";

jest.mock("react-icons/bi", () => ({
  BiMailSend: () => <span data-testid="mail-icon">Mail</span>,
  BiPhoneCall: () => <span data-testid="phone-icon">Phone</span>,
  BiSupport: () => <span data-testid="support-icon">Support</span>,
}));

jest.mock("../../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Contact", () => {
  test("renders contact page with correct title", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toHaveAttribute("data-title", "Contact us");
  });

  test("renders contact us heading", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByText("CONTACT US")).toBeInTheDocument();
  });

  test("renders contact information text", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/For any query or info about product, feel free to call anytime/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/We are available 24\/7/i)).toBeInTheDocument();
  });

  test("renders email contact information", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
  });

  test("renders phone contact information", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
  });

  test("renders toll-free number", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
    expect(screen.getByText(/toll free/i)).toBeInTheDocument();
  });

  test("renders contact image", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });
  
  test("renders mail icon", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
  });

  test("renders phone icon", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
  });

  test("renders support icon", () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByTestId("support-icon")).toBeInTheDocument();
  });
});