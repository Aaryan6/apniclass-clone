import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "../assets/noavatar.png";

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const navigate = useNavigate();
  const User = useSelector((state) => state.currentUserReducer);

  const handleLogoout = () => {
    localStorage.removeItem("ac_user");
    setShowSidebar(!showSidebar);
    navigate("/login");
  };

  const navigateTo = (path) => {
    navigate(path);
    setShowSidebar(!showSidebar);
  };
  return (
    <div
      className={`bg-white dark:bg-slate-700 ${
        showSidebar ? "hidden lg:flex" : "lg:hidden flex"
      } lg:w-64 lg:sticky lg:h-screen lg:-mt-16 absolute border-2 dark:border-slate-500 w-48 z-20 top-0 pt-16 flex-col justify-between`}
    >
      <div className="grid w-full">
        <button
          onClick={() => navigateTo("/")}
          className="hover:bg-slate-100 hover:dark:bg-slate-600 dark:text-white py-3 px-4 text-sm text-left cursor-pointer border-b"
        >
          Home
        </button>
      </div>
      {User && (
        <div className="grid">
          <div
            onClick={() => navigateTo("/profile/" + User?._id)}
            className="hover:bg-slate-100 hover:dark:bg-slate-600 dark:border-slate-700 flex items-center py-3 px-4 text-sm cursor-pointer border-t"
          >
            <img
              src={User?.profileImage ? User?.profileImage : Avatar}
              alt=""
              className={`w-7 h-7 object-cover rounded-full mr-3`}
            />
            <span className="dark:text-white">{User?.name}</span>
          </div>
          <div
            className="hover:bg-slate-100 hover:dark:bg-slate-600 flex items-center justify-between py-3.5 px-4 text-sm cursor-pointer border-t"
            onClick={handleLogoout}
          >
            <span className="dark:text-white">Logout</span>
            <IoLogOutOutline className="text-xl dark:text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
