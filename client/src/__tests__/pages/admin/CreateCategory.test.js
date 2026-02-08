import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CreateCategory from "../../../pages/admin/CreateCategory";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("@context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("@context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("@context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

const CreateCategoryWithTestWrapper = () => (
  <MemoryRouter initialEntries={["/admin/create-category"]}>
    <Routes>
      <Route path="/admin/create-category" element={<CreateCategory />} />
    </Routes>
  </MemoryRouter>
);

describe("CreateCategory admin page", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {}); // To silence console.log statements
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("View category action", () => {
    it("should render correctly", async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [
            { _id: "1", name: "Category A" },
            { _id: "2", name: "Category B" },
          ],
        },
      });

      const { findByText, queryAllByText } = render(
        <CreateCategoryWithTestWrapper />,
      );

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(
        await findByText("Category B", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(queryAllByText("Edit", { selector: "button" })).toHaveLength(2);
      expect(queryAllByText("Delete", { selector: "button" })).toHaveLength(2);
    });

    it("should render empty categories correctly", async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [],
        },
      });

      const { queryAllByText } = render(<CreateCategoryWithTestWrapper />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(queryAllByText("Edit", { selector: "button" })).toHaveLength(0);
      expect(queryAllByText("Delete", { selector: "button" })).toHaveLength(0);
    });

    it("should do nothing if get category fails (application error)", async () => {
      axios.get.mockResolvedValue({
        data: { success: false },
      });

      render(<CreateCategoryWithTestWrapper />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledTimes(0);
    });

    it("should prompt error if get category fails (server error)", async () => {
      axios.get.mockRejectedValue(new Error("Get all category error"));

      render(<CreateCategoryWithTestWrapper />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category",
      );
    });
  });

  describe("Create category action", () => {
    it("should create new category correctly", async () => {
      const user = userEvent.setup();
      let getCallsCount = 0;
      axios.get.mockImplementation((url) => {
        getCallsCount++;
        if (getCallsCount == 3) {
          // First 2 calls is triggered on page load
          return Promise.resolve({
            data: {
              success: true,
              category: [{ _id: "1", name: "Category A" }],
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            category: [],
          },
        });
      });
      axios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const { findByText, getByText, getByPlaceholderText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await act(async () => {
        await user.type(
          getByPlaceholderText("Enter new category"),
          "Category A",
        );
        await user.click(getByText("Submit", { selector: "button" }));
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith("Category A is created");
    });

    it("should prompt error if create new category fails (application error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.post.mockResolvedValueOnce({
        data: { success: false, message: "Category already exists" },
      });

      const { findAllByText, getByText, getByPlaceholderText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await act(async () => {
        await user.type(
          getByPlaceholderText("Enter new category"),
          "Category A",
        );
        await user.click(getByText("Submit", { selector: "button" }));
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(
        await findAllByText("Category A", { selector: "td", exact: true }),
      ).toHaveLength(1);
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(toast.error).toHaveBeenCalledWith("Category already exists");
    });

    it("should prompt error if create new category fails (server error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.post.mockRejectedValue(new Error("Create category error"));

      const { findAllByText, getByText, getByPlaceholderText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await act(async () => {
        await user.type(
          getByPlaceholderText("Enter new category"),
          "Category A",
        );
        await user.click(getByText("Submit", { selector: "button" }));
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(
        await findAllByText("Category A", { selector: "td", exact: true }),
      ).toHaveLength(1);
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in creating category",
      );
    });
  });

  describe("Update category action", () => {
    it("should update category correctly", async () => {
      const user = userEvent.setup();
      let getCallsCount = 0;
      axios.get.mockImplementation((url) => {
        getCallsCount++;
        if (getCallsCount == 3) {
          // First 2 calls is triggered on page load
          return Promise.resolve({
            data: {
              success: true,
              category: [{ _id: "1", name: "Category B" }],
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            category: [{ _id: "1", name: "Category A" }],
          },
        });
      });
      axios.put.mockResolvedValueOnce({
        data: { success: true },
      });

      const { findByText, getAllByText, getByDisplayValue, queryByRole } =
        render(<CreateCategoryWithTestWrapper />);
      await user.click(await findByText("Edit", { selector: "button" }));
      await act(async () => {
        const inputField = getByDisplayValue("Category A");
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getAllByText("Submit", { selector: "button" })[1]);
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(
        await findByText("Category B", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(queryByRole("dialog")).toBeNull();
      expect(toast.success).toHaveBeenCalledWith("Category B is updated");
    });

    it("should not update category on cancel", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });

      const {
        findByText,
        getByDisplayValue,
        getByLabelText,
        queryByRole,
        queryByText,
      } = render(<CreateCategoryWithTestWrapper />);
      await user.click(await findByText("Edit", { selector: "button" }));
      await act(async () => {
        const inputField = getByDisplayValue("Category A");
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getByLabelText("Close", { selector: "button" }));
      });

      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(
        queryByText("Category B", { selector: "td", exact: true }),
      ).toBeNull();
      expect(queryByRole("dialog")).toBeNull();
      expect(axios.put).toHaveBeenCalledTimes(0);
    });

    it("should prompt error if update category fails (application error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.put.mockResolvedValueOnce({
        data: { success: false, message: "Category already exists" },
      });

      const { findByText, getAllByText, getByDisplayValue, getByRole } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await user.click(await findByText("Edit", { selector: "button" }));
      await act(async () => {
        const inputField = getByDisplayValue("Category A");
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getAllByText("Submit", { selector: "button" })[1]);
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(getByRole("dialog")).toBeVisible();
      expect(toast.error).toHaveBeenCalledWith("Category already exists");
    });

    it("should prompt error if update category fails (server error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.put.mockRejectedValue(new Error("Update category error"));

      const { findByText, getAllByText, getByDisplayValue, getByRole } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await user.click(await findByText("Edit", { selector: "button" }));
      await act(async () => {
        const inputField = getByDisplayValue("Category A");
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getAllByText("Submit", { selector: "button" })[1]);
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(getByRole("dialog")).toBeVisible();
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in updating category",
      );
    });
  });

  describe("Delete category action", () => {
    it("should delete category correctly", async () => {
      const user = userEvent.setup();
      let getCallsCount = 0;
      axios.get.mockImplementation((url) => {
        getCallsCount++;
        if (getCallsCount == 3) {
          // First 2 calls is triggered on page load
          return Promise.resolve({
            data: {
              success: true,
              category: [],
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            category: [{ _id: "1", name: "Category A" }],
          },
        });
      });
      axios.delete.mockResolvedValueOnce({
        data: { success: true },
      });

      const { findByText, queryByText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await user.click(await findByText("Delete", { selector: "button" }));

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(
        await queryByText("Category A", { selector: "td", exact: true }),
      ).toBeNull();
      expect(toast.success).toHaveBeenCalledWith("Category is deleted");
    });

    it("should prompt error if delete category fails (application error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.delete.mockResolvedValueOnce({
        data: { success: false, message: "Category does not exist" },
      });

      const { findByText } = render(<CreateCategoryWithTestWrapper />);
      await user.click(await findByText("Delete", { selector: "button" }));

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Category does not exist");
    });

    it("should prompt error if delete category fails (server error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.delete.mockRejectedValue(new Error("Delete category error"));

      const { findByText } = render(<CreateCategoryWithTestWrapper />);
      await user.click(await findByText("Delete", { selector: "button" }));

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in deleting category",
      );
    });
  });
});
