"use client";

import { useState } from "react";
import { useUser, useUserStats, useUpdateUser } from "@/src/hooks/useUser";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileForm from "./ProfileForm";
import { Skeleton } from "@/src/components/ui/skeleton";
import { User } from "@/src/types/user";

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);

  if (userLoading || statsLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return <div className="p-8 text-center">User not found</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <ProfileHeader
        user={user}
        onEdit={() => setIsEditing(true)}
        isEditing={isEditing}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {isEditing ? (
            <ProfileForm
              user={user}
              onSubmit={(data) => {
                updateUser(data, {
                  onSuccess: () => setIsEditing(false),
                });
              }}
              onCancel={() => setIsEditing(false)}
              isPending={isPending}
            />
          ) : (
            <ProfileInfo user={user} />
          )}
        </div>

        <div>
          <ProfileStats stats={stats} />
        </div>
      </div>
    </div>
  );
}

function ProfileInfo({ user }: { user: User }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-surface-soft p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Profile Information
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <p className="text-white">{user.name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Email</label>
          <p className="text-white">{user.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Username</label>
          <p className="text-white">{user.username || "Not set"}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Provider</label>
          <p className="text-white capitalize">{user.provider.toLowerCase()}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Member Since</label>
          <p className="text-white">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
