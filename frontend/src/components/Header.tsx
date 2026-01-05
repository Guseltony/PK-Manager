import { IoMdSettings } from "react-icons/io";
import { FaBars, FaRegUser, FaSearch } from "react-icons/fa";

const Header = () => {
  return (
    <div className="w-full flex items-center justify-between border-2 border-green-800 pl-96 pr-10 py-2">
      {/* input */}
      <div className="w-96">
        <input
          type="text"
          className="w-full py-2 px-4 bg-transparent border-2 border-red-800 rounded-2xl"
        />
      </div>

      {/* right col */}
      <div className="w-72 flex items-center justify-between">
        {/* icons */}
        <div className="flex items-center justify-center gap-4">
          <FaSearch size={30} />
          <IoMdSettings size={30} />
          <FaBars size={30} />
        </div>

        {/* user profile */}
        <div className="flex items-center justify-center gap-4">
          <p>Guseltony</p>
          <div className="bg-fuchsia-300 rounded-full w-10 h-10 flex items-center justify-center">
            <FaRegUser size={25} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
