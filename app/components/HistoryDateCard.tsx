type Props = {
  date: string;
  onClick: () => void;
};

export function HistoryDateCard({ date, onClick }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <p className="text-lg font-bold">{formatDate(date)}</p>
      <p className="mt-1 text-sm text-zinc-500">Tap to see details</p>
    </button>
  );
}
