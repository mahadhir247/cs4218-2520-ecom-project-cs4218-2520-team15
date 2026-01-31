import { render } from "@testing-library/react";
import AdminDashboard from "../../../pages/admin/AdminDashboard";

jest.mock("@components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));
jest.mock("@components/AdminMenu");
jest.mock("@context/auth", () => ({ useAuth: jest.fn() }));

import { useAuth } from "@context/auth";

describe("AdminDashboard page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render user details correctly", () => {
    useAuth.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: 91234567,
        },
      },
      jest.fn(),
    ]);

    const { getByText } = render(<AdminDashboard />);

    expect(
      getByText("Admin Name : John Doe", { exact: true }),
    ).toBeInTheDocument();
    expect(
      getByText("Admin Email : john.doe@example.com", { exact: true }),
    ).toBeInTheDocument();
    expect(
      getByText("Admin Contact : 91234567", { exact: true }),
    ).toBeInTheDocument();
  });

  it("should render missing user details correctly", () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    const { getByText, container } = render(<AdminDashboard />);

    expect(getByText("Admin Name :", { exact: true })).toBeInTheDocument();
    expect(getByText("Admin Email :", { exact: true })).toBeInTheDocument();
    expect(getByText("Admin Contact :", { exact: true })).toBeInTheDocument();
  });
});
