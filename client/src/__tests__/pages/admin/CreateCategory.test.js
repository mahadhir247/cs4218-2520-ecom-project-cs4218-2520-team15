/* Name: Lee Guan Kai Delon
 * Student No: A0273286W
 */

import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CreateCategory from "../../../pages/admin/CreateCategory";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  Modal: ({ children, onCancel, ...props }) => (
    <div {...props}>
      {children}
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("@components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

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
      axios.get.mockResolvedValueOnce({
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
      axios.get.mockResolvedValueOnce({
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
      axios.get.mockResolvedValueOnce({
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
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const { findByText, getAllByText, getAllByPlaceholderText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await act(async () => {
        await user.type(
          getAllByPlaceholderText("Enter new category")[0],
          "Category A",
        );
        await user.click(getAllByText("Submit", { selector: "button" })[0]);
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith("Category A is created");
    });

    it("should prompt error if create new category fails (application error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.post.mockResolvedValueOnce({
        data: { success: false, message: "Category already exists" },
      });

      const { findAllByText, getAllByText, getAllByPlaceholderText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await act(async () => {
        await user.type(
          getAllByPlaceholderText("Enter new category")[0],
          "Category A",
        );
        await user.click(getAllByText("Submit", { selector: "button" })[0]);
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(
        await findAllByText("Category A", { selector: "td", exact: true }),
      ).toHaveLength(1);
      expect(axios.get).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Category already exists");
    });

    it("should prompt error if create new category fails (server error)", async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          category: [{ _id: "1", name: "Category A" }],
        },
      });
      axios.post.mockRejectedValue(new Error("Create category error"));

      const { findAllByText, getAllByText, getAllByPlaceholderText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      await act(async () => {
        await user.type(
          getAllByPlaceholderText("Enter new category")[0],
          "Category A",
        );
        await user.click(getAllByText("Submit", { selector: "button" })[0]);
      });

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(
        await findAllByText("Category A", { selector: "td", exact: true }),
      ).toHaveLength(1);
      expect(axios.get).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in creating category",
      );
    });
  });

  describe("Update category action", () => {
    it("should update category correctly", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [{ _id: "1", name: "Category A" }],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [{ _id: "1", name: "Category B" }],
          },
        });
      axios.put.mockResolvedValueOnce({
        data: { success: true },
      });

      const {
        findByText,
        getAllByText,
        getAllByPlaceholderText,
        queryByRole,
        queryByText,
      } = render(<CreateCategoryWithTestWrapper />);
      const editButton = await findByText("Edit", { selector: "button" });
      await waitFor(() => expect(editButton).toBeInTheDocument());
      await act(async () => {
        await user.click(editButton);
        const inputField = getAllByPlaceholderText("Enter new category")[1];
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getAllByText("Submit", { selector: "button" })[1]);
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(
        queryByText("Category A", { selector: "td", exact: true }),
      ).toBeNull();
      expect(
        queryByText("Category B", { selector: "td", exact: true }),
      ).toBeInTheDocument();
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

      const { findByText, getAllByPlaceholderText, queryByText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      const editButton = await findByText("Edit", { selector: "button" });
      await waitFor(() => expect(editButton).toBeInTheDocument());
      await act(async () => {
        await user.click(editButton);
        const inputField = getAllByPlaceholderText("Enter new category")[1];
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(queryByText("Cancel", { selector: "button" }));
      });

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledTimes(0);
      expect(
        queryByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(
        queryByText("Category B", { selector: "td", exact: true }),
      ).toBeNull();
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

      const { findByText, getAllByPlaceholderText, getAllByText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      const editButton = await findByText("Edit", { selector: "button" });
      await waitFor(() => expect(editButton).toBeInTheDocument());
      await act(async () => {
        await user.click(editButton);
        const inputField = getAllByPlaceholderText("Enter new category")[1];
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getAllByText("Submit", { selector: "button" })[1]);
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(axios.get).toHaveBeenCalledTimes(1);
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

      const { findByText, getAllByPlaceholderText, getAllByText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      const editButton = await findByText("Edit", { selector: "button" });
      await waitFor(() => expect(editButton).toBeInTheDocument());
      await act(async () => {
        await user.click(editButton);
        const inputField = getAllByPlaceholderText("Enter new category")[1];
        await user.clear(inputField);
        await user.type(inputField, "Category B");
        await user.click(getAllByText("Submit", { selector: "button" })[1]);
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in updating category",
      );
    });
  });

  describe("Delete category action", () => {
    it("should delete category correctly", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [{ _id: "1", name: "Category A" }],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [],
          },
        });
      axios.delete.mockResolvedValueOnce({
        data: { success: true },
      });

      const { findByText, queryByText } = render(
        <CreateCategoryWithTestWrapper />,
      );
      const deleteButton = await findByText("Delete", { selector: "button" });
      await waitFor(() => expect(deleteButton).toBeInTheDocument());
      await act(async () => {
        await user.click(deleteButton);
      });

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(axios.get).toHaveBeenCalledTimes(2);
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
      const deleteButton = await findByText("Delete", { selector: "button" });
      await waitFor(() => expect(deleteButton).toBeInTheDocument());
      await act(async () => {
        await user.click(deleteButton);
      });

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(axios.get).toHaveBeenCalledTimes(1);
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
      const deleteButton = await findByText("Delete", { selector: "button" });
      await waitFor(() => expect(deleteButton).toBeInTheDocument());
      await act(async () => {
        await user.click(deleteButton);
      });

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(
        await findByText("Category A", { selector: "td", exact: true }),
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in deleting category",
      );
    });
  });
});
