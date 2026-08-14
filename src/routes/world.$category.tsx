import { Outlet, createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryMeta } from "@/data/topics";

export const Route = createFileRoute("/world/$category")({
  component: WorldLayout,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">העולם לא נמצא</h1>
      <Link to="/" className="comic-btn comic-btn-primary">חזרה לבית</Link>
    </div>
  ),
  beforeLoad: ({ params }) => {
    if (!(params.category in categoryMeta)) throw notFound();
  },
});

function WorldLayout() {
  return <Outlet />;
}
