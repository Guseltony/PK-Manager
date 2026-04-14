"use client";

import { useTasksStore } from "@/src/store/tasksStore";
import { useState } from "react";
import TaskSidebar from "./TaskSidebar";
import TaskListView from "./TaskListView";
import TaskDetailView from "./TaskDetailView";
import TaskQuickAdd from "./TaskQuickAdd";

export default function TasksPageContent() {
  const { selectedTaskId, setSelectedTaskId } = useTasksStore();
  const [filter, setFilter] = useState("all");

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-surface-base">
      {/* Left Context: Filters & Smart Lists */}
      <TaskSidebar activeFilter={filter} onFilterChange={setFilter} />

      {/* Center Engine: Execution Layer */}
      <div className={`flex-1 flex-col relative ${selectedTaskId ? "hidden lg:flex" : "flex"}`}>
        <div className="px-4 py-4 md:px-0 md:py-0 border-b md:border-b-0 border-white/5">
          <TaskQuickAdd />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <TaskListView
            activeFilter={filter}
            selectedTaskId={selectedTaskId}
            onTaskSelect={setSelectedTaskId}
          />
        </div>
      </div>

      {/* Right Layer: Deep Context & Analytics */}
      {selectedTaskId && (
        <TaskDetailView
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
