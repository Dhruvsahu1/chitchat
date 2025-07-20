import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
