import { render } from "@testing-library/react";
import Dashboard from "../../../pages/user/Dashboard";
import { useAuth } from "../../../context/auth";

jest.mock("@components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));
jest.mock("@components/UserMenu");
jest.mock("@context/auth", () => ({ useAuth: jest.fn() }));

describe("Dashboard page", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    it("should render user details correctly", () => {
        useAuth.mockReturnValue([
            {
                user: {
                    name: "Test",
                    email: "test@gmail.com",
                    address: "testAddress",
                },
            }, 
            jest.fn()
        ]);

        const { getByText } = render(<Dashboard />);

        expect(getByText("Name: Test", { exact: true })).toBeInTheDocument();
        expect(getByText("Email: test@gmail.com", { exact: true })).toBeInTheDocument();
        expect(getByText("Address: testAddress", { exact: true })).toBeInTheDocument();
    });

    it("should render page if user details is missing", () => {
        useAuth.mockReturnValue([null, jest.fn()]);

        const { getByText } = render(<Dashboard />);

        expect(getByText("Name:", { exact: true })).toBeInTheDocument();
        expect(getByText("Email:", { exact: true })).toBeInTheDocument();
        expect(getByText("Address:", { exact: true })).toBeInTheDocument();
    })
});