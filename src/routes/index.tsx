import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-amber-200">Wazifah Tracker</h1>
        <p className="text-slate-300 text-sm">
          Offline tasbeeh and wazifah counter with timed session reports.
        </p>
      </div>
    </div>
  );
}
