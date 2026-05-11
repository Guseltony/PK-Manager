"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import { User } from "@/src/types/user";
import { UpdateUserPayload } from "@/src/types/user";
import Image from "next/image";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3).optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url().optional().or(z.literal("")),
});

interface ProfileFormProps {
  user: User;
  onSubmit: (data: UpdateUserPayload) => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function ProfileForm({
  user,
  onSubmit,
  onCancel,
  isPending,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      username: user.username || "",
      email: user.email,
      avatar: user.avatar || "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const payload: UpdateUserPayload = {};
        if (data.name !== user.name) payload.name = data.name;
        if (data.username !== (user.username || ""))
          payload.username = data.username || undefined;
        if (data.email !== user.email) payload.email = data.email;
        if (data.avatar !== (user.avatar || ""))
          payload.avatar = data.avatar || undefined;
        onSubmit(payload);
      })}
      className="space-y-6 rounded-lg border border-gray-800 bg-surface-soft p-6"
    >
      <h2 className="text-lg font-semibold text-white">Edit Profile</h2>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-brand-primary/20 flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-brand-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          <Camera className="h-4 w-4" />
          Change Photo
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Name
          </label>
          <input
            {...register("name")}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            {...register("username")}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Avatar URL
          </label>
          <input
            {...register("avatar")}
            type="url"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
            placeholder="https://example.com/avatar.jpg"
          />
          {errors.avatar && (
            <p className="mt-1 text-sm text-red-400">{errors.avatar.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-700 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
