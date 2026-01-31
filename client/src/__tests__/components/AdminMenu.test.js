import AdminMenu from "@components/AdminMenu";
import { render } from "@testing-library/react";

jest.mock("react-router-dom", () => ({
  NavLink: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("AdminMenu component", () => {
  it("should render correctly", () => {
    const { getByText } = render(<AdminMenu />);

    expect(
      getByText("Create Category", { selector: "a", exact: true }),
    ).toBeInTheDocument();
    expect(
      getByText("Create Product", { selector: "a", exact: true }),
    ).toBeInTheDocument();
    expect(
      getByText("Products", { selector: "a", exact: true }),
    ).toBeInTheDocument();
    expect(
      getByText("Orders", { selector: "a", exact: true }),
    ).toBeInTheDocument();
  });

  it("should have clickable links", () => {
    const { getByText } = render(<AdminMenu />);

    expect(
      getByText("Create Category", { selector: "a", exact: true }),
    ).toBeEnabled();
    expect(
      getByText("Create Product", { selector: "a", exact: true }),
    ).toBeEnabled();
    expect(getByText("Products", { selector: "a", exact: true })).toBeEnabled();
    expect(getByText("Orders", { selector: "a", exact: true })).toBeEnabled();
  });
});
