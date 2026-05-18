import { Suspense } from "react";
import TasksPageContent from "@/src/features/tasks/TasksPageContent";

export const metadata = {
  title: "Tasks | PK-Manager",
  description: "Manage your tasks and execution intelligence.",
};

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksPageContent />
    </Suspense>
  );
}
