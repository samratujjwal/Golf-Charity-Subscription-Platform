import nodemailer from "nodemailer";
import { logger } from "../../config/logger.js";

/**
 * EmailService — wraps nodemailer with typed notification methods.
 *
 * PRD §13 requires:
 *   - Email notifications: system updates, draw results, winner alerts
 *
 * Configuration via environment variables:
 *   EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 *
 * If EMAIL_HOST is not set the service runs in "no-op" mode and logs the
 * email payload without sending — safe for local development.
 */
export class EmailService {
  constructor() {
    this.fromAddress =
      process.env.EMAIL_FROM ||
      "Golf Charity Platform <noreply@golfcharity.com>";
    this.enabled = Boolean(process.env.EMAIL_HOST);

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  /* ─── Core send ───────────────────────────────────────────── */

  async send({ to, subject, html, text }) {
    if (!this.enabled) {
      logger.info(
        { to, subject },
        "[EmailService] No-op: email not configured",
      );
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
        text,
      });
      logger.info(
        { to, subject, messageId: info.messageId },
        "[EmailService] Email sent",
      );
    } catch (error) {
      // Never crash the app over a failed email — just log
      logger.error(
        { err: error, to, subject },
        "[EmailService] Failed to send email",
      );
    }
  }

  /* ─── Notification methods (PRD §13) ──────────────────────── */

  /**
   * Draw results — sent to every subscriber when a draw is published.
   */
  async sendDrawResults({
    to,
    userName,
    month,
    year,
    drawNumbers,
    matchCount,
    isWinner,
  }) {
    const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
      month: "long",
    });
    const subject = isWinner
      ? `🏆 You won the ${monthName} ${year} draw!`
      : `${monthName} ${year} draw results are in`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;">
          ${isWinner ? "🏆 Congratulations, " : "Hi, "}${userName}!
        </h1>
        <p style="color:#475569;line-height:1.7;">
          The <strong>${monthName} ${year}</strong> monthly draw has been published.
        </p>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;">
            Draw numbers
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${drawNumbers
              .map(
                (n) =>
                  `<span style="display:inline-flex;width:36px;height:36px;align-items:center;justify-content:center;border-radius:50%;background:#e0e7ff;color:#4338ca;font-weight:700;font-size:14px;">${n}</span>`,
              )
              .join("")}
          </div>
        </div>

        ${
          isWinner
            ? `<div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;">
                <p style="margin:0;color:#065f46;font-weight:600;">
                  You matched <strong>${matchCount} number${matchCount !== 1 ? "s" : ""}</strong> — you're a winner!
                </p>
                <p style="margin:8px 0 0;color:#065f46;font-size:14px;">
                  Log in to your dashboard and upload your score screenshot to claim your prize.
                </p>
              </div>`
            : matchCount > 0
              ? `<p style="color:#475569;">You matched <strong>${matchCount} number${matchCount !== 1 ? "s" : ""}</strong> this month. Keep playing — you need 3+ to win.</p>`
              : `<p style="color:#475569;">No matches this month. Better luck in the next draw!</p>`
        }

        <a href="${process.env.CLIENT_URL}/dashboard/draw"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          View your results
        </a>
      </div>
    `;

    await this.send({
      to,
      subject,
      html,
      text: `${isWinner ? `You matched ${matchCount} numbers and WON the ${monthName} ${year} draw!` : `No win this month for the ${monthName} ${year} draw.`} Draw numbers: ${drawNumbers.join(", ")}. Visit ${process.env.CLIENT_URL}/dashboard/draw`,
    });
  }

  /**
   * Winner alert — sent immediately when the draw is run and a winner is identified.
   */
  async sendWinnerAlert({ to, userName, matchCount, month, year }) {
    const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
      month: "long",
    });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;">🏆 You're a winner, ${userName}!</h1>
        <p style="color:#475569;line-height:1.7;">
          You matched <strong>${matchCount} number${matchCount !== 1 ? "s" : ""}</strong> in the
          <strong>${monthName} ${year}</strong> draw.
        </p>
        <p style="color:#475569;line-height:1.7;">
          To claim your prize, please upload a screenshot of your golf scores through your dashboard.
          An admin will verify your submission before the payout is released.
        </p>
        <a href="${process.env.CLIENT_URL}/dashboard/winnings"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          Upload proof now
        </a>
      </div>
    `;

    await this.send({
      to,
      subject: `🏆 You won the ${monthName} ${year} draw — upload your proof`,
      html,
      text: `You matched ${matchCount} numbers in the ${monthName} ${year} draw! Visit ${process.env.CLIENT_URL}/dashboard/winnings to upload your proof.`,
    });
  }

  /**
   * Payout confirmed — sent when admin marks a winning as paid.
   */
  async sendPayoutConfirmation({ to, userName, prizeAmount, month, year }) {
    const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
      month: "long",
    });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;">💸 Payout confirmed, ${userName}!</h1>
        <p style="color:#475569;line-height:1.7;">
          Your prize of <strong>$${Number(prizeAmount).toFixed(2)}</strong> for the
          <strong>${monthName} ${year}</strong> draw has been marked as paid.
        </p>
        <p style="color:#475569;">Thank you for playing and supporting charity through Golf Charity Platform.</p>
        <a href="${process.env.CLIENT_URL}/dashboard/winnings"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          View your winnings
        </a>
      </div>
    `;

    await this.send({
      to,
      subject: `💸 Your $${Number(prizeAmount).toFixed(2)} prize has been paid — ${monthName} ${year}`,
      html,
      text: `Your prize of $${Number(prizeAmount).toFixed(2)} for the ${monthName} ${year} draw has been paid. Visit ${process.env.CLIENT_URL}/dashboard/winnings`,
    });
  }

  /**
   * Proof rejected — sent when admin rejects a winner's proof upload.
   */
  async sendProofRejected({ to, userName, month, year }) {
    const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
      month: "long",
    });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;">Action required, ${userName}</h1>
        <p style="color:#475569;line-height:1.7;">
          Your proof submission for the <strong>${monthName} ${year}</strong> draw could not be verified.
          Please re-upload a clear screenshot of your golf scores.
        </p>
        <a href="${process.env.CLIENT_URL}/dashboard/winnings"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          Re-upload proof
        </a>
      </div>
    `;

    await this.send({
      to,
      subject: `Action required: re-upload your score proof for ${monthName} ${year}`,
      html,
      text: `Your proof for the ${monthName} ${year} draw was rejected. Please re-upload at ${process.env.CLIENT_URL}/dashboard/winnings`,
    });
  }

  /**
   * Subscription activated — sent after Stripe webhook confirms payment.
   */
  async sendSubscriptionActivated({ to, userName, plan, endDate }) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;">Welcome aboard, ${userName}!</h1>
        <p style="color:#475569;line-height:1.7;">
          Your <strong>${plan}</strong> subscription is now active.
          Access expires on <strong>${new Date(endDate).toLocaleDateString()}</strong>.
        </p>
        <p style="color:#475569;line-height:1.7;">
          Head to your dashboard to submit your first Stableford scores and get ready for the next monthly draw.
        </p>
        <a href="${process.env.CLIENT_URL}/dashboard"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          Go to dashboard
        </a>
      </div>
    `;

    await this.send({
      to,
      subject: `Your ${plan} subscription is active — welcome to Golf Charity Platform`,
      html,
      text: `Your ${plan} subscription is active until ${new Date(endDate).toLocaleDateString()}. Visit ${process.env.CLIENT_URL}/dashboard`,
    });
  }

  /**
   * Subscription cancelled / expired — system update.
   */
  async sendSubscriptionEnded({ to, userName, plan, reason = "cancelled" }) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;">Subscription ended, ${userName}</h1>
        <p style="color:#475569;line-height:1.7;">
          Your <strong>${plan}</strong> subscription has been <strong>${reason}</strong>.
          You will no longer be entered in monthly draws.
        </p>
        <p style="color:#475569;line-height:1.7;">
          You can re-subscribe at any time from the pricing page.
        </p>
        <a href="${process.env.CLIENT_URL}/pricing"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          View plans
        </a>
      </div>
    `;

    await this.send({
      to,
      subject: `Your Golf Charity Platform subscription has been ${reason}`,
      html,
      text: `Your ${plan} subscription has been ${reason}. Re-subscribe at ${process.env.CLIENT_URL}/pricing`,
    });
  }
}

// Singleton — import and use across the app
export const emailService = new EmailService();
