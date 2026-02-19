/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "../../components/Layout";

jest.mock("../../components/Header", () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock("../../components/Footer", () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

describe("Layout", () => {
  test("renders children content", () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders Header and Footer components", () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("renders with default props", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      const helmet = document.querySelector("title");
      expect(helmet?.textContent).toBe("Ecommerce app - shop now");
    });
  });

  test("renders with custom title", async () => {
    render(
      <BrowserRouter>
        <Layout title="Custom Title">
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      const helmet = document.querySelector("title");
      expect(helmet?.textContent).toBe("Custom Title");
    });
  });

  test("renders with custom meta description", async () => {
    render(
      <BrowserRouter>
        <Layout description="Custom description">
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription?.content).toBe("Custom description");
    });
  });

  test("renders with custom meta keywords", async () => {
    render(
      <BrowserRouter>
        <Layout keywords="test,keywords">
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      expect(metaKeywords?.content).toBe("test,keywords");
    });
  });

  test("renders with custom meta author", async () => {
    render(
      <BrowserRouter>
        <Layout author="Test Author">
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      const metaAuthor = document.querySelector('meta[name="author"]');
      expect(metaAuthor?.content).toBe("Test Author");
    });
  });

  test("renders Toaster component", () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });
});