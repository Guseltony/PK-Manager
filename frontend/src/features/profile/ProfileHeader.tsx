"use client";

import { User } from "@/src/types/user";
import { Camera, Pencil } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
  isEditing: boolean;
}

export default function ProfileHeader({
  user,
  onEdit,
  isEditing,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-linear-to-br from-surface-soft to-surface-base p-8">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-brand-primary/20 flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-brand-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-gray-700 p-1.5 hover:bg-gray-600">
            <Camera className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="mt-1 text-gray-400">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-brand-primary/20 px-3 py-1 text-xs font-medium text-brand-primary">
              {user.provider}
            </span>
            {user.emailVerified && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                Verified
              </span>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
