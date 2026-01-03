import React from "react";
import axios from "axios";
import Button from "./Button";
import { BiTask } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../redux/features/auth/authSlice";
import { LogOut, User } from "lucide-react";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const logoutUser = async () => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/logout`);
  return data;
};

const Header = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const userinfo = useSelector((state) => state.auth.userInfo);

  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      queryClient.setQueryData(["user"]);
      toast.success("Logout successful");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Logout failed");
    },
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to={"/"} className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition">
              <BiTask className="text-2xl text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </Link>

          {/* Actions Section */}
          <div className="flex items-center gap-4">
            {!userinfo?.email ? (
              <div className="flex items-center gap-3">
                <Link to={"/login"}>
                  <Button
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isLoginPage 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    Login
                  </Button>
                </Link>
                <Link to={"/signup"}>
                  <Button
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isSignupPage 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-gray-700 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                  <User size={18} />
                  <span className="text-sm truncate max-w-[150px]">{userinfo.name || userinfo.firstname}</span>
                </div>
                <Button
                  onClick={() => mutation.mutate()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;