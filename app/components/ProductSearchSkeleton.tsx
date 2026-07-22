export default function ProductSearchSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="h-5 w-2/3 rounded bg-zinc-200" />

      <div className="mt-3 h-4 w-1/2 rounded bg-zinc-200" />

      <div className="mt-5 flex justify-end">
        <div className="h-10 w-24 rounded-xl bg-zinc-200" />
      </div>
    </div>
  );
}
