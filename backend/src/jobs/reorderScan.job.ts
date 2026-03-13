// jobs/reorderScan.job.ts
//
// Nightly cron job that scans ALL users' products for reorder alerts.
// Sends emails for any NEW alerts (products that crossed the reorder
// point since the last scan).
//
// Schedule: every night at 2:00 AM
//
// Setup in your app.ts / server.ts:
//   improt { startReorderScanJob } from "./jobs/reorderScan.job";
//   startReorderScanJob();
//
// Dependencies:
//   npm install node-cron
//   npm install -D @types/node-cron

import cron from "node-cron";
import { User } from "../models/user.models";
import { getReorderSuggestions } from "../services/reorder.service";

// ─── Job definition ───────────────────────────────────────────────────────────

async function runReorderScan() {
    console.log(`\n[ReorderScan] ▶ Starting nightly scan at ${new Date().toISOString()}`);

    let totalUsers = 0;
    let totalSuggestions = 0;
    let totalNewAlerts = 0;
    let totalEmailsSent = 0;

    try {
        // Get all active users who have products
        const users = await User.find({ isActive: true, isDeleted: false })
            .select("_id email")
            .lean();

        totalUsers = users.length;
        console.log(`[ReorderScan] Scanning ${totalUsers} users...`);

        for (const user of users) {
            try {
                const result = await getReorderSuggestions(
                    String(user._id),
                    true,   
                    true,   
                );

                if (result.suggestionsFound > 0) {
                    console.log(
                        `[ReorderScan] User ${user.email}: ` +
                        `${result.suggestionsFound} suggestions, ` +
                        `${result.newAlertsCreated} new alerts, ` +
                        `${result.emailsSent} emails sent`
                    );
                }

                totalSuggestions += result.suggestionsFound;
                totalNewAlerts += result.newAlertsCreated;
                totalEmailsSent += result.emailsSent;

            } catch (userErr) {
                // Never let one user's failure stop the whole scan
                console.error(`[ReorderScan] Failed for user ${user.email}:`, userErr);
            }
        }

        console.log(
            `[ReorderScan] ✅ Scan complete.\n` +
            `  Users scanned:    ${totalUsers}\n` +
            `  Total suggestions:${totalSuggestions}\n` +
            `  New alerts:       ${totalNewAlerts}\n` +
            `  Emails sent:      ${totalEmailsSent}\n`
        );

    } catch (err) {
        console.error("[ReorderScan] ❌ Fatal error during scan:", err);
    }
}

// ─── Cron scheduler ───────────────────────────────────────────────────────────

export function startReorderScanJob() {
    // Runs every night at 2:00 AM server time
    // Cron format: second(opt) minute hour day month weekday
    cron.schedule("0 2 * * *", runReorderScan, {
        timezone: "Europe/London",   // ← change to your timezone
    });

    console.log("[ReorderScan] 📅 Nightly scan scheduled for 02:00 AM (Europe/London)");
}

// ─── Manual trigger (for testing) ────────────────────────────────────────────
// Call this from a protected admin endpoint:
//   POST /api/admin/trigger-reorder-scan
export { runReorderScan };