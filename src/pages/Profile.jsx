import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import { AiFillCaretDown } from "react-icons/ai";
import { GrClose } from "react-icons/gr";
import { GiClick } from "react-icons/gi";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebase-config";
import { updateUser } from "../actions/user";
import Post from "../components/Post";
import Sidebar from "../components/Sidebar";
import Avatar from "../assets/noavatar.png";

const Profile = ({ showSidebar, setShowSidebar }) => {
  const userId = window.location.pathname.split("/")[2];
  const users = useSelector((state) => state.userReducer?.data);
  const [profileUser, setProfileUser] = useState({});
  const [modalIsOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("uploads");
  const Posts = useSelector((state) => state.postReducer.data?.posts);

  useEffect(() => {
    setProfileUser(users.filter((user) => user._id === userId));
  }, [userId, users]);

  return (
    <div className="flex w-full">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className="pt-2 flex-1 pb-20">
        <ModalBox
          modalIsOpen={modalIsOpen}
          setIsOpen={setIsOpen}
          currentUser={profileUser[0]}
        />
        <div className="p-4 bg-white dark:bg-slate-700 max-w-lg mx-auto relative">
          <button
            onClick={() => setIsOpen(true)}
            className="absolute right-2 text-xs bg-slate-100 dark:bg-slate-500 dark:text-white py-2 px-3 rounded-sm cursor-pointer"
          >
            Edit Profile
          </button>
          <div className=" flex flex-col items-center">
            <img
              src={profileUser[0]?.profileImage || Avatar}
              alt=""
              className="w-40 h-40 object-cover rounded-full"
            />
            <span className="text-lg mt-2 font-medium dark:text-white">
              {profileUser[0]?.name}
            </span>
            <span className="dark:text-white text-sm -mt-1 font-normal text-gray-600">
              @{profileUser[0]?.username}
            </span>
          </div>
          <div className="grid grid-cols-3 text-sm px-4 pt-4">
            <div className="text-center py-1 grid">
              <span className="text-slate-600 dark:text-white">Year: </span>
              <span className="font-medium dark:text-white">
                {profileUser[0]?.presentYear === "second" ? "2nd" : "1st"}
              </span>
            </div>
            <div className="text-center py-1 grid">
              <span className="text-slate-600 dark:text-white">Branch: </span>
              <span className="font-medium dark:text-white">
                {profileUser[0]?.presentBranch}
              </span>
            </div>
            <div className="text-center py-1 grid">
              <span className="text-slate-600 dark:text-white">Posts: </span>
              <span className="font-medium dark:text-white">
                {
                  Posts?.filter((pst) => pst.userId === profileUser[0]?._id)
                    .length
                }
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-700 m-1 py-2 rounded-md mx-auto max-w-lg">
          <button
            onClick={() => setTab("uploads")}
            className={`text-sm ml-2 px-4 py-2 dark:text-white ${
              tab === "uploads" &&
              "bg-slate-100 dark:bg-slate-600 px-4 py-2 rounded-3xl cursor-pointer font-medium"
            }`}
          >
            My uploads
          </button>
          <button
            onClick={() => setTab("liked")}
            className={`text-sm px-4 py-2 dark:text-white ${
              tab === "liked" &&
              "bg-slate-100 dark:bg-slate-600 rounded-3xl cursor-pointer font-medium"
            }`}
          >
            Liked
          </button>
        </div>
        <div className="p-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto max-w-6xl">
          {tab === "uploads"
            ? Posts?.filter((pst) => pst.userId === profileUser[0]?._id).map(
                (item) => {
                  return <Post item={item} key={item._id} />;
                }
              )
            : Posts?.filter((pst) =>
                pst.likes.includes(profileUser[0]?._id)
              ).map((item) => {
                return <Post item={item} key={item._id} />;
              })}
        </div>
      </div>
    </div>
  );
};

export default Profile;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export const ModalBox = ({ modalIsOpen, setIsOpen, currentUser }) => {
  function closeModal() {
    setIsOpen(false);
  }

  const [showOption, setShowOption] = useState({
    optionYear: false,
    optionBranch: false,
    optionSubject: false,
    optionStuff: false,
  });
  const [showYear] = useState({
    first: "First Year",
    second: "Second Year",
  });
  const [showBranch] = useState({
    IT: "IT",
    CS: "CS",
    EC: "EC",
    civil: "Civil",
  });
  const [year, setYear] = useState(Object.keys(showYear)[0]);
  const [branch, setBranch] = useState(Object.keys(showBranch)[0]);
  const [name, setName] = useState(currentUser?.name);
  const [profile, setImage] = useState(null);
  const [fileUrl, setFileUrl] = useState(currentUser?.profileImage);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();

  const handleDisplayOptions = (type) => {
    setShowOption({
      optionYear: false,
      optionBranch: false,
      optionSubject: false,
      optionStuff: false,
    });
    if (type === "year") {
      setShowOption((prev) => ({
        ...prev,
        optionYear: !showOption.optionYear,
      }));
    } else {
      setShowOption((prev) => ({
        ...prev,
        optionBranch: !showOption.optionBranch,
      }));
    }
  };

  const handleSelectOption = (option, type) => {
    if (type === "year") {
      setYear(option);
    }
    if (type === "branch") {
      setBranch(option);
    }
    // close option box
    setShowOption({
      optionYear: false,
      optionBranch: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(
      updateUser(currentUser?._id, {
        name,
        profileImage: fileUrl,
        presentYear: year,
        presentBranch: branch,
      })
    );
    setIsOpen(false);
  };

  const uploadFile = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + Math.round(progress) + "% done");
        setProgress(Math.round(progress));
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log(error);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFileUrl(downloadURL);
          handleSubmit();
        });
      }
    );
  };

  useEffect(() => {
    setName(currentUser?.name);
    currentUser?.presentYear && setYear(currentUser.presentYear);
    currentUser?.presentBranch && setBranch(currentUser.presentBranch);
  }, [currentUser]);

  useEffect(() => {
    profile && uploadFile(profile);
    if (profile) {
      setFileUrl("");
    }
  }, [profile]);

  return (
    <div className="font-poppins relative">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h1 className="text-center text-lg font-bold font-poppins mb-4">
          Update Profile
        </h1>
        <GrClose
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 cursor-pointer"
        />
        <form className="grid w-72 font-poppins" onSubmit={handleSubmit}>
          <div className="flex items-center">
            <img
              src={fileUrl || Avatar}
              alt=""
              className="w-20 h-20 rounded-full object-cover"
            />
            <label
              htmlFor="file"
              className="bg-slate-200 mx-auto px-4 flex items-center justify-center cursor-pointer py-2 mb-2 rounded-sm text-sm"
            >
              {progress < 1
                ? "Choose Profile"
                : "Uploading Profile... " + progress + "%"}
              <GiClick className="ml-1" />
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              id="file"
              className="hidden"
            />
          </div>
          <label htmlFor="name" className="text-sm mb-1 mt-2">
            Name
          </label>
          <input
            type="text"
            placeholder={name}
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-slate-300 px-2 py-2 outline-none text-sm"
          />
          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-3 py-4">
            {/* selection div */}
            <div className="flex flex-col items-center relative">
              <div
                onClick={() => handleDisplayOptions("year")}
                className="flex justify-center items-center cursor-pointer border-2 border-solid border-gray-100 bg-white py-2 px-3 w-full"
              >
                <span className="text-sm text-gray-700 mr-1">Year</span>
                <AiFillCaretDown className="text-sm text-gray-700" />
              </div>
              {/* option */}
              <div className="mt-2 bg-indigo-50 border-2 border-solid border-indigo-200 h-9 flex items-center justify-center rounded-sm w-full">
                <span className="text-indigo-600 text-sm">
                  {showYear[year]}
                </span>
              </div>
              {/* options box */}
              <div
                className={`${
                  showOption.optionYear ? "flex" : "hidden"
                } absolute z-20 flex-col bg-white shadow-lg drop-shadow-xs border-solid border-2 border-zinc-100 w-full top-10`}
              >
                {Object.keys(showYear).map((item, index) => {
                  return (
                    <span
                      key={index}
                      onClick={() => handleSelectOption(item, "year")}
                      className="cursor-pointer p-3 text-sm border-b hover:bg-slate-100 text-left w-full"
                    >
                      {showYear[item]}
                    </span>
                  );
                })}
              </div>
              {/* end */}
            </div>
            <div className="relative flex flex-col items-center">
              <div
                onClick={() => handleDisplayOptions("branch")}
                className="flex justify-center items-center cursor-pointer border-2 border-solid border-gray-100 bg-white py-2 px-3 w-full"
              >
                <span className="text-sm text-gray-700 mr-1">Branch</span>
                <AiFillCaretDown className="text-sm text-gray-700" />
              </div>
              {/* option */}
              <div className="mt-2 bg-indigo-50 border-2 border-solid border-indigo-200 h-9 flex items-center justify-center rounded-sm w-full">
                <span className="text-indigo-600 text-sm">
                  {showBranch[branch]}
                </span>
              </div>
              {/* options box */}
              <div
                className={`${
                  showOption.optionBranch ? "flex" : "hidden"
                } absolute z-20 flex-col bg-white shadow-lg drop-shadow-xs border-solid border-2 border-zinc-100 w-full top-10`}
              >
                {Object.keys(showBranch).map((item, index) => {
                  return (
                    <span
                      key={index}
                      onClick={() => handleSelectOption(item, "branch")}
                      className="cursor-pointer p-3 text-sm border-b hover:bg-slate-100 text-left w-full"
                    >
                      {showBranch[item]}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={`${
              fileUrl === "" ? "bg-indigo-300" : "bg-indigo-500"
            }  text-sm text-white py-3
           rounded-sm`}
          >
            Update Profile
          </button>
        </form>
      </Modal>
    </div>
  );
};
