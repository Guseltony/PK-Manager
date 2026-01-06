import { IoMdSettings } from "react-icons/io";
import { FaBars, FaRegUser } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import SignButton from "../utils/SignButton";

const Header = () => {
  return (
    <div className="w-full flex items-center justify-between px-20 py-4 bg-[#131720] rounded-full">
      {/* input */}
      <div className="relative w-125 py-2 px-4 bg-gray-700 rounded-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <BiSearch size={18} />
        </span>
        <input
          type="text"
          className="w-full py-1 pl-10 pr-3 rounded-md border-0 outline-0 bg-gray-700 text-text placeholder:text-muted"
          placeholder="Search notes, tags, or archives…"
        />
      </div>

      {/* right col */}
      <div className="w-fit flex items-center justify-between">
        {/* icons */}
        <div className="flex items-center justify-center gap-4 mr-10">
          <div className="flex items-center w-8 h-8 justify-center bg-gray-200 rounded-full">
            <IoIosNotifications
              size={20}
              className="text-[#6366f1] hover:text-[#2225f5] cursor-pointer"
            />
          </div>

          <div className="flex items-center w-8 h-8 justify-center bg-gray-200 rounded-full">
            <IoMdSettings
              size={20}
              className="text-[#6366f1] hover:text-[#2225f5] cursor-pointer"
            />
          </div>

          <div className="flex items-center w-8 h-8 justify-center bg-gray-200 rounded-full">
            <FaBars
              size={20}
              className="text-[#6366f1] hover:text-[#2225f5] cursor-pointer"
            />
          </div>
        </div>

        {/* user profile */}
        <div className="flex items-center justify-center gap-4 mr-10">
          <div className="bg-fuchsia-300 rounded-full w-10 h-10 flex items-center justify-center">
            <FaRegUser size={25} />
          </div>
          <p>Guseltony</p>
        </div>

        {/* Sign Up */}
        <SignButton />
      </div>
    </div>
  );
};

export default Header;
