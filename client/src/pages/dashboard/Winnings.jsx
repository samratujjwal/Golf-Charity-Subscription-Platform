import { getErrorMessage } from "../../utils/getErrorMessage";
import { useRef, useState } from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useMyWinnings, useUploadWinningProof } from "../../hooks/useWinnings";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read selected file"));
    reader.readAsDataURL(file);
  });
}

export default function DashboardWinnings() {
  const winningsQuery = useMyWinnings();
  const uploadProofMutation = useUploadWinningProof();
  const [error, setError] = useState("");
  const fileInputsRef = useRef({});

  const winnings = winningsQuery.data || [];
  const totalPrizeAmount = winnings.reduce(
    (sum, winning) => sum + Number(winning.prizeAmount || 0),
    0,
  );

  const triggerFilePicker = (winningId) => {
    fileInputsRef.current[winningId]?.click();
  };

  const handleFileChange = async (winningId, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      const imageData = await readFileAsDataUrl(file);
      await uploadProofMutation.mutateAsync({ winningId, imageData });
    } catch (uploadError) {
      setError(
        uploadError.response?.data?.error ||
          uploadError.message ||
          "Unable to upload proof",
      );
    } finally {
      event.target.value = "";
    }
  };

  // Can upload proof if status is 'pending' or 'rejected'
  const canUpload = (status) => status === "pending" || status === "rejected";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Winnings
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Track every reward, proof review, and payout milestone.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Once a draw completes and prize distribution runs, your winnings
          appear here with proof upload and payout status updates. If your proof
          is rejected, re-upload a clearer screenshot to try again.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Total Winnings"
          value={`$${totalPrizeAmount.toFixed(2)}`}
          description="Combined prize value across all current winnings."
        />
        <DashboardCard
          title="Open Reviews"
          value={String(
            winnings.filter(
              (w) => w.status === "pending" || w.status === "rejected",
            ).length,
          )}
          description="Pending or rejected winnings requiring action."
        />
        <DashboardCard
          title="Paid Out"
          value={String(winnings.filter((w) => w.status === "paid").length)}
          description="Winnings that have completed the payout workflow."
        />
      </div>

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
          {error}
        </div>
      )}

      {winningsQuery.isLoading && (
        <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
        </div>
      )}

      {winningsQuery.isError && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
          {getErrorMessage(winningsQuery.error, "Unable to load winnings.")}
        </div>
      )}

      {!winningsQuery.isLoading &&
        !winningsQuery.isError &&
        winnings.length === 0 && (
          <DashboardCard
            title="No winnings yet"
            description="When you match three or more draw numbers, your winning records and proof workflow will appear here."
          />
        )}

      {!winningsQuery.isLoading &&
        !winningsQuery.isError &&
        winnings.length > 0 && (
          <div className="space-y-4">
            {winnings.map((winning) => (
              <article
                key={winning.id}
                className="rounded-[2rem] border border-white/50 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {winning.matchCount} matches for{" "}
                        {winning.draw
                          ? `${winning.draw.month}/${winning.draw.year}`
                          : "recent draw"}
                      </h3>
                      <StatusBadge status={winning.status} />
                    </div>
                    <p className="text-sm text-slate-600">
                      Prize amount:{" "}
                      <span className="font-semibold text-slate-950">
                        ${Number(winning.prizeAmount).toFixed(2)}
                      </span>
                    </p>
                    {winning.draw?.numbers?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {winning.draw.numbers.map((number) => (
                          <span
                            key={`${winning.id}-${number}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Rejection notice */}
                    {winning.status === "rejected" && (
                      <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                        ⚠️ Your proof was rejected by an admin. Please upload a
                        clearer screenshot of your score card.
                      </div>
                    )}
                  </div>

                  <div className="min-w-[240px] space-y-3">
                    {winning.proofImage ? (
                      <a
                        href={winning.proofImage}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={winning.proofImage}
                          alt="Proof"
                          className="h-40 w-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                        No proof uploaded yet.
                      </div>
                    )}

                    <input
                      ref={(node) => {
                        fileInputsRef.current[winning.id] = node;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleFileChange(winning.id, event)}
                    />

                    {canUpload(winning.status) && (
                      <button
                        type="button"
                        onClick={() => triggerFilePicker(winning.id)}
                        disabled={uploadProofMutation.isPending}
                        className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {winning.status === "rejected"
                          ? "Re-upload proof image"
                          : winning.proofImage
                            ? "Replace proof image"
                            : "Upload proof image"}
                      </button>
                    )}

                    {winning.status === "verified" && (
                      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        ✓ Proof verified — awaiting payout
                      </p>
                    )}

                    {winning.status === "paid" && (
                      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        ✓ Paid out
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
    </div>
  );
}
