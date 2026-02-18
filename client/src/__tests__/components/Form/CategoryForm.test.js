/* Name: Lee Guan Kai Delon
 * Student No: A0273286W
 */

import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import CategoryForm from "../../../components/Form/CategoryForm";

const mockHandleSubmit = jest.fn((e) => e.preventDefault());

const CategoryFormWithTestState = () => {
  const [value, setValue] = useState("");
  return (
    <CategoryForm
      handleSubmit={mockHandleSubmit}
      value={value}
      setValue={setValue}
    />
  );
};

describe("CategoryForm component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <CategoryFormWithTestState />,
    );

    const inputField = getByPlaceholderText("Enter new category");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toBeEnabled();
    const submitButton = getByText("Submit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should update correctly on change of text input", async () => {
    const user = userEvent.setup();

    const { getByPlaceholderText, getByText } = render(
      <CategoryFormWithTestState />,
    );
    const inputField = getByPlaceholderText("Enter new category");
    await act(async () => {
      await user.type(inputField, "Category A");
    });

    expect(inputField).toHaveValue("Category A");
    expect(getByText("Submit")).toBeEnabled();
  });

  it("should call handleSubmit on click of submit button", async () => {
    const user = userEvent.setup();

    const { getByPlaceholderText, getByText } = render(
      <CategoryFormWithTestState />,
    );
    const inputField = getByPlaceholderText("Enter new category");
    const submitButton = getByText("Submit");
    await act(async () => {
      await user.type(inputField, "Category A");
      await user.click(submitButton);
    });

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});
