import { MemoryRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "../../../components/Routes/Private";
import { useAuth } from "../../../context/auth";
import axios from "axios";
import { render, waitFor } from "@testing-library/react";

jest.mock("axios");
jest.mock("@context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("@components/Spinner", () => ({ path }) => (
  <div>spinner-mock</div>
));

function renderPrivateRoute() {
    return render(
        <MemoryRouter initialEntries={["/private"]}>
            <Routes>
                <Route path="/private" element={<PrivateRoute />}>
                    <Route path="/private" element={<div>child-element</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    )
}

describe("Private tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render spinner when there is no auth token", async () => {
        const { getByText } = renderPrivateRoute();

        expect(getByText("spinner-mock")).toBeInTheDocument();
        expect(axios.get).not.toHaveBeenCalled();
    });

    it("should render spinner if auth token is not ok", async () => {
        useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
        axios.get.mockResolvedValue({ data: { ok: false } });

        const { getByText } = renderPrivateRoute();

        await waitFor(() => {
            expect(getByText("spinner-mock")).toBeInTheDocument();
            expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
        });
    });

    it("should render outlet child if auth token is ok", async () => {
        useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
        axios.get.mockResolvedValue({ data: { ok: true } });

        const { getByText } = renderPrivateRoute();

        await waitFor(() => {
            expect(getByText("child-element")).toBeInTheDocument();
            expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
        });
    });
});