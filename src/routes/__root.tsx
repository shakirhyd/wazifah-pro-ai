import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../context/AuthContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-slate-100">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-slate-100">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-100">Page not found</h2>
        <p className="mt-2 text-sm text-slate-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-slate-100">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Something went wrong. You can try refreshing or heading back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}

