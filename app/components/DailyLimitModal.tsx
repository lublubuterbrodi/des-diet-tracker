"use client";

import { useEffect, useState } from "react";

type DailyLimitModalProps = {
  open: boolean;
  productName: string;
  initialLimit?: number | string;
  initialUnit?: string;
  saving?: boolean;
  title?: string;
  submitText?: string;
  onClose: () => void;
  onSave: (dailyLimit: number, unit: string) => Promise<void>;
};

type DailyLimitFormProps = Omit<DailyLimitModalProps, "open">;

const units = ["g", "pcs", "ml"];

function getInitialLimit(initialLimit: number | string) {
  if (initialLimit === "" || initialLimit === 0 || initialLimit === "0") {
    return "";
  }

  return String(initialLimit);
}

function DailyLimitForm({
  productName,
  initialLimit = "",
  initialUnit = "g",
  saving = false,
  title = "Daily limit",
  submitText = "Save",
  onClose,
  onSave,
}: DailyLimitFormProps) {
  const [dailyLimit, setDailyLimit] = useState(() =>
    getInitialLimit(initialLimit),
  );

  const [unit, setUnit] = useState(() => initialUnit || "g");

  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saving, onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedLimit = dailyLimit.replace(",", ".");
    const numericLimit = Number(normalizedLimit);

    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      setError("Enter a valid daily limit");
      return;
    }

    if (!unit.trim()) {
      setError("Choose a unit");
      return;
    }

    setError("");

    try {
      await onSave(numericLimit, unit);
    } catch (error) {
      console.error("Failed to save daily limit:", error);

      setError("Failed to save daily limit");
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-zinc-900">{title}</h2>

            <p className="mt-1 truncate text-sm text-zinc-500">{productName}</p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-zinc-400 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <label
          htmlFor="daily-limit"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Amount allowed per day
        </label>

        <div className="flex gap-3">
          <input
            id="daily-limit"
            autoFocus
            type="text"
            inputMode="decimal"
            value={dailyLimit}
            disabled={saving}
            placeholder="300"
            onChange={(event) => {
              setDailyLimit(event.target.value);
              setError("");
            }}
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <select
            value={unit}
            disabled={saving}
            aria-label="Unit"
            onChange={(event) => {
              setUnit(event.target.value);
              setError("");
            }}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
          >
            {units.map((currentUnit) => (
              <option key={currentUnit} value={currentUnit}>
                {currentUnit}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : submitText}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DailyLimitModal({
  open,
  productName,
  initialLimit = "",
  initialUnit = "g",
  saving = false,
  title = "Daily limit",
  submitText = "Save",
  onClose,
  onSave,
}: DailyLimitModalProps) {
  if (!open) {
    return null;
  }

  return (
    <DailyLimitForm
      key={`${productName}-${initialLimit}-${initialUnit}`}
      productName={productName}
      initialLimit={initialLimit}
      initialUnit={initialUnit}
      saving={saving}
      title={title}
      submitText={submitText}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
