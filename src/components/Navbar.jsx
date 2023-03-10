import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { HiBars3BottomLeft } from "react-icons/hi2";
import { IoArrowBackOutline } from "react-icons/io5";
import { BsShare } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../actions/currentUser";
import { getUserNotifications } from "../actions/notification";
import { getAllUsers } from "../actions/user";
import { getAllPosts } from "../actions/post";
import { getSubjects } from "../actions/subject";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast, ToastContainer } from "react-toastify";

const Navbar = ({ setShowSidebar, showSidebar }) => {
  const User = useSelector((state) => state.currentUserReducer);
  const notifications = useSelector((state) => state.notificationReducer?.data);
  const dispatch = useDispatch();
  const path = window.location.pathname;
  const [notificationsList, setNotificationsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setCurrentUser(JSON.parse(localStorage.getItem("ac_user"))));
  }, [dispatch]);

  // fetch notifications
  useEffect(() => {
    User?._id && dispatch(getUserNotifications(User._id));
  }, [User?._id, dispatch]);

  // store notification
  useEffect(() => {
    setNotificationsList(
      notifications?.notifications?.filter((ntf) => ntf.seen === false)
    );
  }, [notifications, User?._id]);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllPosts());
    dispatch(getSubjects());
  }, [dispatch]);

  const copyPath = () => {
    toast.success("Url copied!", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <div
      className={`${
        path === "/login" || path === "/signup" ? "hidden" : "flex"
      } px-4 h-16 items-center justify-between bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-30 xl:px-6
        `}
    >
      <div className="flex items-center">
        {path.split("/")[1] === "open" || path === "/share" ? (
          <button
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <IoArrowBackOutline className="text-xl mr-1 dark:text-white" />
            <span className="dark:text-white">Back</span>
          </button>
        ) : (
          <>
            <HiBars3BottomLeft
              className="text-2xl mr-5 cursor-pointer lg:inline-block dark:text-white"
              onClick={() => setShowSidebar(!showSidebar)}
            />
            <Link to="/" className="md:inline-block hidden">
              <h1 className="text-xl font-poppins dark:text-white">
                Apni<span className="font-bold">Class</span>
              </h1>
            </Link>
          </>
        )}
      </div>
      <Link to="/" className="md:hidden">
        <h1 className="text-xl font-poppins dark:text-slate-100">
          Apni<span className="font-bold">Class</span>
        </h1>
      </Link>
      <ul className="flex">
        {!User ? (
          <Link to="signup">
            <li className="ml-1 text-sm dark:text-slate-100">Sign Up</li>
          </Link>
        ) : (
          <div className="flex items-center">
            <Link to="/share" className="hidden md:flex">
              <AiOutlinePlus className="dark:text-slate-100 transition ease-in-out delay-150 duration-300 text-4xl p-1.5 mr-5 text-gray-600 bg-slate-200 dark:bg-slate-700 rounded-full border-white" />
            </Link>
            {path.split("/")[1] !== "open" ? (
              <Link to="/notification" className="relative mr-2">
                {notificationsList?.length > 0 && (
                  <div className="absolute -top-2 -right-1.5 bg-red-500 text-white rounded-full grid place-items-center text-xs w-5 h-5">
                    <span className="mt-0.5">{notificationsList?.length}</span>
                  </div>
                )}
                <IoNotificationsOutline className="text-2xl dark:text-slate-100" />
              </Link>
            ) : (
              <CopyToClipboard text={window.location.href}>
                <BsShare
                  onClick={copyPath}
                  className="dark:text-white scale-110 cursor-pointer"
                />
              </CopyToClipboard>
            )}
          </div>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
