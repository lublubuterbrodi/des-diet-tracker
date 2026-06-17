import type { DietItem, FoodLog } from "@/app/hooks/useHistory";

type Props = {
  date: string;
  items: DietItem[];
  logs: FoodLog[];
  onClose: () => void;
};

export function HistoryModal({ date, items, logs, onClose }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
  };

  const dateLogs = logs.filter((log) => log.log_date === date);

  const getEatenAmount = (itemId: string) => {
    return dateLogs
      .filter((log) => log.diet_item_id === itemId)
      .reduce((sum, log) => sum + Number(log.amount), 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center">
      <div className="max-h-[80vh] w-full overflow-y-auto rounded-3xl bg-white p-5 shadow-xl sm:mx-auto sm:max-w-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{formatDate(date)}</h2>

          <button
            onClick={onClose}
            className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const eaten = getEatenAmount(item.id);

            if (eaten === 0) return null;

            const progress = Math.min((eaten / item.daily_limit) * 100, 100);

            return (
              <div key={item.id}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate font-medium">
                    {item.name}
                  </p>

                  <p className="shrink-0 font-bold">
                    {eaten} / {item.daily_limit} {item.unit}
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
