import NavLinks from "./navLinks";

const SideBar = () => {
  return (
    <div className="bg-[#131720] min-h-dvh pt-20 p-4 ">
      {/* logo */}
      <div className="mb-20">
        <h1 className="text-2xl font-bold uppercase">GUSEL-OS</h1>
      </div>

      {/* navLinks */}
      <aside className="w-64">
        <NavLinks />
      </aside>
    </div>
  );
};

export default SideBar;
