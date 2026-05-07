"use client"
import { useState } from "react";
import clsx from "clsx";
import Dropdown from "./Dropdown";
import { useUserInfoContext } from "@/context/UserInfoContext";

const GuestIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="#5c5c6e" />
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#5c5c6e" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const Profile = () => {
  const [isToggled, setIsToggled] = useState(false)
  const { loading, userInfo, isUserLoggedIn: isLoggedIn } = useUserInfoContext()

  return (
    <div className="relative">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer border border-[#1e1e28] hover:border-[#7eb8a4] transition-colors"
        style={{ background: '#111116' }}
        onClick={() => setIsToggled(prev => !prev)}
      >
        {isLoggedIn && userInfo?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userInfo.photo}
            alt="profile"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <GuestIcon />
        )}
      </div>

      {isToggled && <Dropdown data={userInfo} isLoggedIn={isLoggedIn} />}
    </div>
  )
}

export default Profile
