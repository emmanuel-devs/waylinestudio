import { createFileRoute } from "@tanstack/react-router";
import { PostForm } from "@/components/admin/PostForm";

export const Route = createFileRoute("/admin/posts/new")({
  component: () => <PostForm />,
});
