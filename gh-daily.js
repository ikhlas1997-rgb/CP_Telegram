// Runs once a day inside a free GitHub Action. Cost: nothing.
// Reads active Atlas roles and pings you on Telegram about any NEW role,
// with the details ready to paste into the studio's Careers tab, where you
// write and post it (that writing runs on your Claude plan, so no API cost).
// Remembers handled roles in seen-jobs.json, which the workflow commits back.
//
// Needs two environment variables (set as GitHub repo secrets):
//   TELEGRAM_BOT_TOKEN  - your bot token from BotFather
//   TELEGRAM_CHAT_ID    - where pings are sent (your own chat id)
// Optional: AGENCY_ALIAS (defaults to Cordell-Partners inside jobs.js)

import fs from "fs";
import { fetchActiveJobs } from "./jobs.js";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const SEEN_FILE = process.env.SEEN_FILE || "./seen-jobs.json";

function loadSeen() {
  try { return new Set(JSON.parse(fs.readFileSync(SEEN_FILE, "utf8"))); } catch (e) { return new Set(); }
}
function saveSeen(set) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify([...set], null, 2));
}

async function notify(job) {
  const text = [
    "New role on Atlas",
    "",
    "Role: " + job.role,
    "Location: " + (job.location || "not specified"),
    "Salary: " + (job.salary ? job.salary + " " + job.salaryCurrency : "on application"),
    "Link: " + job.url,
    "",
    "Open the studio Careers tab, add this role, and write the posts.",
  ].join("\n");
  await fetch("https://api.telegram.org/bot" + TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text: text, disable_web_page_preview: false }),
  });
}

async function main() {
  if (!TOKEN || !CHAT) { console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID."); process.exit(1); }
  const seen = loadSeen();
  const jobs = await fetchActiveJobs();
  const fresh = jobs.filter((j) => !seen.has(j.id));
  console.log("Active roles: " + jobs.length + ", new: " + fresh.length);
  for (const job of fresh) {
    try { await notify(job); seen.add(job.id); } catch (e) { console.error("Failed on " + job.role + ": " + e.message); }
  }
  saveSeen(seen);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
