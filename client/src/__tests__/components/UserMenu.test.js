import { render } from "@testing-library/react";
import UserMenu from "../../components/UserMenu";

jest.mock("react-router-dom", () => ({
  NavLink: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("UserMenu component", () => {
    it("should render user menu", async () => {
        const { getByText } = render(<UserMenu />);

        expect(getByText("Dashboard")).toBeInTheDocument();
        expect(getByText("Profile", { selector: "a", exact: true })).toBeInTheDocument();
        expect(getByText("Orders", { selector: "a", exact: true })).toBeInTheDocument();
    });

    it("should have clickable links", () => {
        const { getByText } = render(<UserMenu />);

        expect(getByText("Profile", { selector: "a", exact: true })).toBeEnabled();
        expect(getByText("Orders", { selector: "a", exact: true })).toBeEnabled();
    });
});