/* Name: Lee Guan Kai Delon
 * Student No: A0273286W
 */

import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import toast from "react-hot-toast";
import CreateProduct from "../../../pages/admin/CreateProduct";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("antd", () => {
  const Select = ({ children, placeholder, onChange }) => (
    <select placeholder={placeholder} onChange={onChange}>
      {children}
    </select>
  );
  Select.Option = ({ children, ...props }) => (
    <option name={children} {...props}>
      {children}
    </option>
  );
  return { ...jest.requireActual("antd"), Select };
});

const mockNavigateFn = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigateFn,
}));

jest.mock("@components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

jest.mock("@components/AdminMenu", () => () => <div>Admin Menu</div>);

describe("CreateProduct admin page", () => {
  const mockFile = new File(["mock-file"], "mock-file.png", {
    type: "image/png",
  });

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: jest.fn((file) => `/url/${file.name}`),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("General actions", () => {
    it("should render correctly", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });

      const { getByPlaceholderText, getByRole, getByText, queryAllByRole } =
        render(<CreateProduct />);

      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      expect(getByPlaceholderText("Select a category")).toBeEnabled();
      expect(getByRole("option", { name: "Electronics" })).toBeEnabled();
      expect(getByRole("option", { name: "Clothing" })).toBeEnabled();
      expect(
        getByText("Upload Photo", { selector: "label" }),
      ).toBeInTheDocument();
      expect(getByPlaceholderText("Enter a name")).toBeEnabled();
      expect(getByPlaceholderText("Enter a description")).toBeEnabled();
      expect(getByPlaceholderText("Enter a price")).toBeEnabled();
      expect(getByPlaceholderText("Enter a quantity")).toBeEnabled();
      expect(getByPlaceholderText("Select shipping")).toBeEnabled();
      expect(getByText("Create", { selector: "button" })).toBeDisabled();
    });

    it("should render empty categories correctly", async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, category: [] },
      });

      const { queryAllByRole } = render(<CreateProduct />);

      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
      });
      expect(await queryAllByRole("option")).toHaveLength(2);
    });

    it("should render empty categories on get category fails (application error)", async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: false },
      });

      const { queryAllByRole } = render(<CreateProduct />);

      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
      });
      expect(await queryAllByRole("option")).toHaveLength(2);
    });

    it("should prompt error on get category fails (server error)", async () => {
      axios.get.mockRejectedValue(new Error("Get category error"));

      const { queryAllByRole } = render(<CreateProduct />);

      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
      });
      expect(await queryAllByRole("option")).toHaveLength(2);
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category",
      );
    });

    it("should update correctly on change of input", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });

      const {
        getByPlaceholderText,
        getByRole,
        getByTestId,
        getByText,
        queryAllByRole,
      } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.selectOptions(
          getByPlaceholderText("Select a category"),
          "Electronics",
        );
        await user.upload(getByTestId("img-upload"), mockFile);
        await user.type(getByPlaceholderText("Enter a name"), "Laptop");
        await user.type(
          getByPlaceholderText("Enter a description"),
          "A mock laptop",
        );
        await user.type(getByPlaceholderText("Enter a price"), "199.99");
        await user.type(getByPlaceholderText("Enter a quantity"), "100");
        await user.selectOptions(
          getByPlaceholderText("Select shipping"),
          "Yes",
        );
      });

      expect(
        getByText("mock-file.png", { selector: "label" }),
      ).toBeInTheDocument();
      expect(getByRole("img")).toHaveAttribute("src", "/url/mock-file.png");
      expect(getByText("Create", { selector: "button" })).toBeEnabled();
    });
  });

  describe("Create product action", () => {
    it("should create product correctly", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      const {
        getByPlaceholderText,
        getByRole,
        getByTestId,
        getByText,
        queryAllByRole,
      } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.selectOptions(
          getByPlaceholderText("Select a category"),
          "Electronics",
        );
        await user.upload(getByTestId("img-upload"), mockFile);
        await user.type(getByPlaceholderText("Enter a name"), "Laptop");
        await user.type(
          getByPlaceholderText("Enter a description"),
          "A mock laptop",
        );
        await user.type(getByPlaceholderText("Enter a price"), "199.99");
        await user.type(getByPlaceholderText("Enter a quantity"), "100");
        await user.selectOptions(
          getByPlaceholderText("Select shipping"),
          "Yes",
        );
        await user.click(getByText("Create", { selector: "button" }));
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(toast.success).toHaveBeenCalledWith(
        "Product created successfully",
      );
      expect(mockNavigateFn).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("should prompt error on create product fail (application error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });
      axios.post.mockResolvedValueOnce({
        data: { success: false, message: "Product already exists" },
      });

      const {
        getByPlaceholderText,
        getByRole,
        getByTestId,
        getByText,
        queryAllByRole,
      } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.selectOptions(
          getByPlaceholderText("Select a category"),
          "Electronics",
        );
        await user.upload(getByTestId("img-upload"), mockFile);
        await user.type(getByPlaceholderText("Enter a name"), "Laptop");
        await user.type(
          getByPlaceholderText("Enter a description"),
          "A mock laptop",
        );
        await user.type(getByPlaceholderText("Enter a price"), "199.99");
        await user.type(getByPlaceholderText("Enter a quantity"), "100");
        await user.selectOptions(
          getByPlaceholderText("Select shipping"),
          "Yes",
        );
        await user.click(getByText("Create", { selector: "button" }));
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledWith("Product already exists");
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });

    it("should prompt error on create product fail (server error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });
      axios.post.mockRejectedValue(new Error("Create product error"));

      const {
        getByPlaceholderText,
        getByRole,
        getByTestId,
        getByText,
        queryAllByRole,
      } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.selectOptions(
          getByPlaceholderText("Select a category"),
          "Electronics",
        );
        await user.upload(getByTestId("img-upload"), mockFile);
        await user.type(getByPlaceholderText("Enter a name"), "Laptop");
        await user.type(
          getByPlaceholderText("Enter a description"),
          "A mock laptop",
        );
        await user.type(getByPlaceholderText("Enter a price"), "199.99");
        await user.type(getByPlaceholderText("Enter a quantity"), "100");
        await user.selectOptions(
          getByPlaceholderText("Select shipping"),
          "Yes",
        );
        await user.click(getByText("Create", { selector: "button" }));
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });
  });

  describe("Photo upload constraints", () => {
    it("should do nothing if photo size below limit", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });
      const mockFileBelowSizeLimit = new File(
        [new Uint8Array(999999)],
        "mock-file.png",
        {
          type: "image/png",
        },
      );

      const { getByTestId, queryAllByRole } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.upload(getByTestId("img-upload"), mockFileBelowSizeLimit);
      });

      expect(toast.error).toHaveBeenCalledTimes(0);
    });

    it("should do nothing if photo size equals to limit", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });
      const mockFileOnSizeLimit = new File(
        [new Uint8Array(1000000)],
        "mock-file.png",
        {
          type: "image/png",
        },
      );

      const { getByTestId, queryAllByRole } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.upload(getByTestId("img-upload"), mockFileOnSizeLimit);
      });

      expect(toast.error).toHaveBeenCalledTimes(0);
    });

    it("should prompt error if photo size exceed limit", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
          ],
        },
      });
      const mockFileAboveSizeLimit = new File(
        [new Uint8Array(1000001)],
        "mock-file.png",
        {
          type: "image/png",
        },
      );

      const { getByTestId, queryAllByRole } = render(<CreateProduct />);
      await waitFor(async () => {
        expect(axios.get).toHaveBeenCalled();
        expect(await queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.upload(getByTestId("img-upload"), mockFileAboveSizeLimit);
      });

      expect(toast.error).toHaveBeenCalledWith("Photo size cannot exceed 1MB");
    });
  });
});
