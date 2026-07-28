interface CheckUsageBalanceProps {
  usageResponse: any;
}

export default function CheckUsageBalanceComponent({
  usageResponse,
}: CheckUsageBalanceProps) {
  return (
    <>
      {" "}
      <h3 className="px-3 py-2 text-xs font-semibold text-neutral-800 font-sans">
        Credit usage balance
      </h3>
      {/*Credit usage balance section */}
      <nav className="grid grid-cols-2 gap-2 p-2">
        {/* Total Tokens */}
        <div className="rounded-sm border border-[var(--color-neutral-100)] bg-[var(--color-grey-250)] p-2">
          <p className="text-xs font-light text-[var(--color-black)]">
            Total Tokens
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-emerald-500)]">
            {usageResponse?.total_tokens ?? 0}
          </p>
        </div>

        {/* Optimized Tokens */}
        <div className="rounded-sm border border-[var(--color-neutral-100)] bg-[var(--color-grey-250)] p-2">
          <p className="text-xs font-light text-[var(--color-black)]">
            Optimized Tokens
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-neutral-800)]">
            {usageResponse?.optimizer_final_tokens ?? 0}
          </p>
        </div>

        {/* Tokens Saved */}
        <div className="rounded-sm border border-[var(--color-neutral-100)] bg-[var(--color-grey-250)] p-2">
          <p className="text-xs font-light text-[var(--color-black)]">
            Tokens Saved
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-neutral-800)]">
            {usageResponse?.optimizer_saved_tokens ?? 0}
          </p>
        </div>

        {/* Savings (%) */}
        <div className="rounded-sm border border-[var(--color-neutral-100)] bg-[var(--color-grey-250)] p-2">
          <p className="text-xs font-light text-[var(--color-black)]">
            Savings (%)
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-neutral-800)]">
            {usageResponse?.savings_percent ?? 0}
          </p>
        </div>
      </nav>
    </>
  );
}
