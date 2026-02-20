/* Name: Lee Guan Kai Delon
 * Student No: A0273286W
 */

import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import toast from "react-hot-toast";
import UpdateProduct from "../../../pages/admin/UpdateProduct";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("antd", () => {
  const Select = ({ children, placeholder, onChange, value }) => (
    <select placeholder={placeholder} onChange={onChange} value={value}>
      {children}
    </select>
  );
  Select.Option = ({ children, ...props }) => (
    <option name={children} {...props}>
      {children}
    </option>
  );
  return {
    ...jest.requireActual("antd"),
    Modal: ({ children, onCancel, onOk }) => (
      <div>
        {children}
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onOk}>Confirm</button>
      </div>
    ),
    Select,
  };
});

const mockNavigateFn = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigateFn,
  useParams: jest.fn(() => ({ slug: "fake-slug" })),
}));

jest.mock("@components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

jest.mock("@components/AdminMenu", () => () => <div>Admin Menu</div>);

describe("UpdateProduct admin page", () => {
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
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: true,
            },
          },
        });

      const { getByPlaceholderText, getByAltText, getByText, queryAllByRole } =
        render(<UpdateProduct />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      expect(getByPlaceholderText("Select a category")).toHaveValue("1");
      expect(getByAltText("product_photo")).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/1",
      );
      expect(getByPlaceholderText("Enter a name")).toHaveValue("Laptop");
      expect(getByPlaceholderText("Enter a description")).toHaveValue(
        "A fake laptop",
      );
      expect(getByPlaceholderText("Enter a price")).toHaveValue(9.99);
      expect(getByPlaceholderText("Enter a quantity")).toHaveValue(100);
      expect(getByPlaceholderText("Select shipping")).toHaveValue("1");
      expect(getByText("Update", { selector: "button" })).toBeEnabled();
      expect(getByText("Delete", { selector: "button" })).toBeEnabled();
    });

    it("should render missing product correctly", async () => {
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({ data: { success: false } });

      const {
        getByPlaceholderText,
        getByText,
        queryAllByRole,
        queryByAltText,
      } = render(<UpdateProduct />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      expect(getByPlaceholderText("Select a category")).toHaveValue(
        "1", // If no option is selected, the default value is the first option
      );
      expect(queryByAltText("product_photo")).not.toBeInTheDocument();
      expect(getByPlaceholderText("Enter a name")).toHaveValue("");
      expect(getByPlaceholderText("Enter a description")).toHaveValue("");
      expect(getByPlaceholderText("Enter a price")).toHaveValue(null);
      expect(getByPlaceholderText("Enter a quantity")).toHaveValue(null);
      expect(getByPlaceholderText("Select shipping")).toHaveValue(
        "0", // If no option is selected, the default value is the first option
      );
      expect(getByText("Update", { selector: "button" })).toBeDisabled();
      expect(getByText("Delete", { selector: "button" })).toBeDisabled();
    });

    it("should render empty categories correctly", async () => {
      axios.get
        .mockResolvedValueOnce({
          data: { success: true, category: [] },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });

      const { queryAllByRole } = render(<UpdateProduct />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(queryAllByRole("option")).toHaveLength(2);
    });

    it("should render empty categories on get category fails (application error)", async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: false },
      });

      const { queryAllByRole } = render(<UpdateProduct />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(queryAllByRole("option")).toHaveLength(2);
    });

    it("should prompt error on get category fails (server error)", async () => {
      axios.get.mockRejectedValue(new Error("Get category error"));

      const { queryAllByRole } = render(<UpdateProduct />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(queryAllByRole("option")).toHaveLength(2);
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category",
      );
    });

    it("should update correctly on change of input", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });

      const { getByPlaceholderText, getByTestId, getByText, queryAllByRole } =
        render(<UpdateProduct />);
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.selectOptions(
          getByPlaceholderText("Select a category"),
          "Clothing",
        );
        await user.upload(getByTestId("img-upload"), mockFile);
        await user.clear(getByPlaceholderText("Enter a name"));
        await user.clear(getByPlaceholderText("Enter a description"));
        await user.clear(getByPlaceholderText("Enter a price"));
        await user.clear(getByPlaceholderText("Enter a quantity"));
        await user.selectOptions(
          getByPlaceholderText("Select shipping"),
          "Yes",
        );
      });

      expect(getByText("Update", { selector: "button" })).toBeDisabled();
    });
  });

  describe("Update product action", () => {
    it("should update product correctly", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.put.mockResolvedValueOnce({ data: { success: true } });

      const { getByPlaceholderText, getByText, queryAllByRole } = render(
        <UpdateProduct />,
      );
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.clear(getByPlaceholderText("Enter a name"));
        await user.type(getByPlaceholderText("Enter a name"), "Computer");
        await user.click(getByText("Update", { selector: "button" }));
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(Object.fromEntries(axios.put.mock.calls[0][1]).name).toEqual(
        "Computer",
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Product updated successfully",
      );
      expect(mockNavigateFn).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("should update product photo correctly", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.put.mockResolvedValueOnce({ data: { success: true } });

      const { getByTestId, getByText, queryAllByRole } = render(
        <UpdateProduct />,
      );
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.upload(getByTestId("img-upload"), mockFile);
        await user.click(getByText("Update", { selector: "button" }));
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(Object.fromEntries(axios.put.mock.calls[0][1]).photo).toEqual(
        mockFile,
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Product updated successfully",
      );
      expect(mockNavigateFn).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("should prompt error on update product fail (application error)", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.put.mockResolvedValueOnce({
        data: { success: false, message: "Unable to find product" },
      });

      const { getByPlaceholderText, getByText, queryAllByRole } = render(
        <UpdateProduct />,
      );
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.clear(getByPlaceholderText("Enter a name"));
        await user.type(getByPlaceholderText("Enter a name"), "Computer");
        await user.click(getByText("Update", { selector: "button" }));
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(Object.fromEntries(axios.put.mock.calls[0][1]).name).toEqual(
        "Computer",
      );
      expect(toast.error).toHaveBeenCalledWith("Unable to find product");
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });

    it("should prompt error on update product fail (server error)", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.put.mockRejectedValue(new Error("Update product error"));

      const { getByPlaceholderText, getByText, queryAllByRole } = render(
        <UpdateProduct />,
      );
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.clear(getByPlaceholderText("Enter a name"));
        await user.type(getByPlaceholderText("Enter a name"), "Computer");
        await user.click(getByText("Update", { selector: "button" }));
      });

      await waitFor(() => expect(axios.put).toHaveBeenCalled());
      expect(Object.fromEntries(axios.put.mock.calls[0][1]).name).toEqual(
        "Computer",
      );
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });
  });

  describe("Delete product action", () => {
    it("should delete product correctly", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.delete.mockResolvedValueOnce({ data: { success: true } });

      const { getByText, queryAllByRole } = render(<UpdateProduct />);
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.click(getByText("Delete", { selector: "button" }));
        await user.click(getByText("Confirm", { selector: "button" }));
      });

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(toast.success).toHaveBeenCalledWith(
        "Product deleted successfully",
      );
      expect(mockNavigateFn).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("should do nothing on cancel", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });

      const { getByText, queryAllByRole } = render(<UpdateProduct />);
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.click(getByText("Cancel", { selector: "button" }));
      });

      expect(axios.delete).toHaveBeenCalledTimes(0);
      expect(toast.success).toHaveBeenCalledTimes(0);
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });

    it("should prompt error on delete product fail (application error)", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.delete.mockResolvedValueOnce({
        data: { success: false, message: "Unable to find product" },
      });

      const { getByText, queryAllByRole } = render(<UpdateProduct />);
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.click(getByText("Delete", { selector: "button" }));
        await user.click(getByText("Confirm", { selector: "button" }));
      });

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });

    it("should prompt error on update product fail (server error)", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      axios.delete.mockRejectedValue(new Error("Update product error"));

      const { getByText, queryAllByRole } = render(<UpdateProduct />);
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(queryAllByRole("option")).toHaveLength(4);
      });
      await act(async () => {
        await user.click(getByText("Delete", { selector: "button" }));
        await user.click(getByText("Confirm", { selector: "button" }));
      });

      await waitFor(() => expect(axios.delete).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      expect(mockNavigateFn).toHaveBeenCalledTimes(0);
    });
  });

  describe("Photo upload constraints", () => {
    it("should do nothing if photo size below limit", async () => {
      const user = userEvent.setup();
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      const mockFileBelowSizeLimit = new File(
        [new Uint8Array(999999)],
        "mock-file.png",
        {
          type: "image/png",
        },
      );

      const { getByTestId, queryAllByRole } = render(<UpdateProduct />);
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
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      const mockFileOnSizeLimit = new File(
        [new Uint8Array(1000000)],
        "mock-file.png",
        {
          type: "image/png",
        },
      );

      const { getByTestId, queryAllByRole } = render(<UpdateProduct />);
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
      axios.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            product: {
              _id: "1",
              name: "Laptop",
              description: "A fake laptop",
              category: { _id: "1" },
              price: 9.99,
              quantity: 100,
              shipping: false,
            },
          },
        });
      const mockFileAboveSizeLimit = new File(
        [new Uint8Array(1000001)],
        "mock-file.png",
        {
          type: "image/png",
        },
      );

      const { getByTestId, queryAllByRole } = render(<UpdateProduct />);
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
