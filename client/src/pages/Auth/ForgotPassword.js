import React, { useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();

    // form function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/v1/auth/forgot-password", {
                email,
                answer,
                password,
            });
            if (res && res.data.success) {
                toast.success(res.data && res.data.message, {
                    duration: 5000,
                    icon: "🙏",
                    style: {
                    background: "green",
                    color: "white",
                    },
                });
                navigate("/login");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };
    return (
        <Layout title="Login - Ecommerce App">
        <div className="form-container " style={{ minHeight: "90vh" }}>
            <form onSubmit={handleSubmit}>
            <h4 className="title">RESET PASSWORD</h4>

            <div className="mb-3">
                <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                id="exampleInputEmail1"
                placeholder="Enter Your Email"
                required
                />
            </div>
            <div className="mb-3">
                <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="form-control"
                id="exampleInputanswer1"
                placeholder="What is Your Favorite sports"
                required
                />
            </div>
            <div className="mb-3">
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                id="exampleInputPassword1"
                placeholder="Enter Your New Password"
                required
                />
            </div>
            <button type="submit" className="btn btn-primary">
                RESET
            </button>
            </form>
        </div>
        </Layout>
    );
};

export default ForgotPassword;