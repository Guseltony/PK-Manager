"use client";

import React, { useState, useEffect, useRef } from "react";
import { IoIosNotifications } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../store/notificationStore";
import api from "../libs/api";
import { Notification } from "../types/notification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiCheck, FiTrash2, FiBellOff, FiClock } from "react-icons/fi";
import Link from "next/link";

dayjs.extend(relativeTime);

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get<Notification[]>("/notifications");
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [setNotifications]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main transition-all"
      >
        <IoIosNotifications size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white shadow-lg ring-2 ring-surface-base animate-in zoom-in duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 overflow-hidden rounded-xl border border-white/10 bg-surface-base shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-surface-soft/50 px-4 py-3">
              <h3 className="font-semibold text-text-main">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-medium text-brand-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Permission Prompt */}
            {typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default" && (
              <div className="bg-brand-primary/10 border-b border-brand-primary/20 px-4 py-3 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  Enable Browser Notifications
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Get real-time alerts for task completions and system insights even when the app is in the background.
                </p>
                <button
                  onClick={async () => {
                    const permission = await window.Notification.requestPermission();
                    if (permission === "granted") {
                      window.location.reload(); 
                    }
                  }}
                  className="w-full py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-primary/90 transition-all"
                >
                  Enable Notifications
                </button>
              </div>
            )}

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      className={`group relative flex flex-col gap-1 p-4 transition-colors hover:bg-surface-soft/30 cursor-pointer ${
                        !notification.isRead ? "bg-brand-primary/5" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-semibold ${
                            !notification.isRead ? "text-text-main" : "text-text-muted"
                          }`}
                        >
                          {notification.title}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="text-text-muted hover:text-red-400 p-1"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted/60">
                          <FiClock size={10} />
                          {dayjs(notification.createdAt).fromNow()}
                        </div>
                        {!notification.isRead && (
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                        )}
                      </div>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => setIsOpen(false)}
                          className="mt-2 text-[10px] font-bold text-brand-primary uppercase tracking-wider hover:underline"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="mb-4 rounded-full bg-surface-soft p-4 text-text-muted/20">
                    <FiBellOff size={40} />
                  </div>
                  <p className="text-sm font-medium text-text-muted">No notifications yet</p>
                  <p className="text-xs text-text-muted/60 mt-1">
                    We&apos;ll notify you when something important happens.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 bg-surface-soft/20 px-4 py-2 text-center">
              <button className="text-[11px] font-semibold text-text-muted hover:text-brand-primary transition-colors">
                View All Notification History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
