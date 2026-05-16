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
          payload.username = data.username;
        if (data.email !== user.email) payload.email = data.email;
        if (data.avatar !== (user.avatar || ""))
          payload.avatar = data.avatar;
        onSubmit(payload);
      })}
      className="space-y-6 rounded-3xl border border-border bg-surface-soft/80 p-5 sm:p-6"
    >
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main">
        Edit Profile
      </h2>

      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-border bg-brand-primary/20">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={80}
              height={80}
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
          className="flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm text-text-muted hover:bg-surface-mutes/50"
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
            className="mt-1 w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3 text-white outline-none focus:border-brand-primary"
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
            className="mt-1 w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3 text-white outline-none focus:border-brand-primary"
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
            className="mt-1 w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3 text-white outline-none focus:border-brand-primary"
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
            className="mt-1 w-full rounded-2xl border border-border bg-surface-mutes/20 px-4 py-3 text-white outline-none focus:border-brand-primary"
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
          className="rounded-2xl bg-brand-primary px-6 py-3 text-sm font-bold text-white hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-border px-6 py-3 text-sm font-bold text-text-muted hover:bg-surface-mutes/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
