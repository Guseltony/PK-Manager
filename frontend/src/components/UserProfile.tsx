"use client"

import { FaRegUser } from "react-icons/fa"


const UserProfile = () => {

  await fetch("/api/refresh", {
  method: "POST",
  credentials: "include",
});

  return (
    <>
    {/* user profile */}
        <div className="flex items-center justify-center gap-4 mr-10">
          <div className="bg-fuchsia-300 rounded-full w-10 h-10 flex items-center justify-center">
            <FaRegUser size={25} />
          </div>
          <p>{name}.</p>
        </div>

        {/* Sign Up */}

        {authenticated ? <SignOut /> : <SignButton />}  )
    </>
}

export default UserProfile