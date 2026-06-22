# Free deployment: daily Atlas careers check (studio writes the posts)

This runs your midday roles check for free using GitHub Actions. No server to host,
no always-on instance, and no API cost. The writing happens in the studio on your
Claude plan, so the automated side costs nothing at all.

## What happens
Once a day, a GitHub Action reads your active Atlas roles. For any role it has not seen
before, it sends you a Telegram ping with the role details and link. You open the studio
Careers tab, add the role (the ping gives you exactly the fields to paste), write the
posts there, and post them. Roles already handled are remembered so you never get pinged
about the same one twice.

## One time setup

1. Create a GitHub repository (private is fine) and add these files to it:
   - jobs.js
   - gh-daily.js
   - package.json
   - seen-jobs.json
   - .github/workflows/careers.yml

2. In the repo, go to Settings, then Secrets and variables, then Actions, and add two
   repository secrets (that is all):
   - TELEGRAM_BOT_TOKEN  your fresh bot token from BotFather
   - TELEGRAM_CHAT_ID    your own chat id (message @getidsbot, or send /start to your bot)

3. Open the Actions tab. Find "Daily Atlas careers check" and click "Run workflow" to test
   it now. Within a minute you should get a ping for each current role.

From then on it runs every day at about 12:05 Gulf time on its own.

## The daily flow
1. Ping arrives: "New role on Atlas" with role, location, salary, link.
2. Open the studio, go to Careers, tap Add a role, paste those fields.
3. Tap Write posts, review, then post where you want.

## Good to know
- Completely free: GitHub Actions, Telegram, and Atlas cost nothing, and the writing runs
  in the studio on your existing plan.
- GitHub Actions runs in UTC. The schedule is 08:05 UTC, which is 12:05 in Dubai.
- Scheduled runs can be a few minutes late at busy times. Fine for a daily check.
- The job saves seen-jobs.json back to the repo each run. This remembers handled roles and
  keeps the repo active, so GitHub does not disable the schedule after 60 days idle.

## When you want more
If you ever decide to spend a little, the same repo can write the posts automatically and
post to your channel on one tap. Until then, this free notifier plus the studio covers the
whole loop with no cost.
