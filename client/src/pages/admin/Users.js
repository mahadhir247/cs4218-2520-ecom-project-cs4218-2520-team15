import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import AdminMenu from "../../components/AdminMenu";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/v1/auth/users");
        setUsers(data || []);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center">All Users</h1>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length ? (
                      users.map((u, idx) => (
                        <tr key={u._id || idx}>
                          <td>{idx + 1}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || "-"}</td>
                          <td>{u.role === 0 ? "User" : "Admin"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}>No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;