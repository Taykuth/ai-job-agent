# JobAgent AI

Web app prototype for job seekers: upload a CV, paste a job posting, and get a CV and cover letter rewritten for that posting, plus a board to track applications. Free users get 5 tailored applications; a Stripe subscription removes the limit.

> **How this was built:** the app was generated with [Manus](https://manus.im), an AI app builder. It runs on Manus platform services (sign-in, LLM gateway, file storage), so it does not run standalone from this repository without replacing those parts. I keep it here as a product prototype, not as an example of code I wrote by hand.

## What it does

- **CV parsing:** a PDF or DOCX CV is sent to the LLM, which returns structured JSON (experience, skills, education).
- **Tailored CV:** the parsed CV and the job posting go to the LLM with a rule to use only information from the original CV and not invent experience or skills. Output is Markdown.
- **Cover letter:** generated from the same inputs.
- **Application tracking:** applications with status (applied, interview, rejected, offer).
- **Freemium limit and billing:** 5 free generations, then Stripe Checkout; a webhook upgrades or downgrades the user's plan.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| API | Express, tRPC, Zod |
| Database | MySQL via Drizzle ORM |
| LLM | `gemini-2.5-flash` through the Manus Forge gateway (`server/_core/llm.ts`) |
| Auth and file storage | Manus OAuth and the Manus storage proxy (`server/_core/`, `server/storage.ts`) |
| Payments | Stripe Checkout, Customer Portal and webhooks (`server/stripeWebhook.ts`) |
| Tests | Vitest (`server/*.test.ts`) |

## Running it outside Manus

`server/_core/env.ts` expects these variables: `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`.

The OAuth, Forge and storage values only exist inside Manus. To run it elsewhere you would need to:

1. replace `invokeLLM` in `server/_core/llm.ts` with a direct OpenAI or Gemini client,
2. replace the storage helpers in `server/storage.ts` with S3 or local storage,
3. replace Manus OAuth with your own sign-in.

```bash
pnpm install
pnpm run db:push
pnpm run dev
pnpm run test
```

## Status

Prototype. The Stripe keys and webhook endpoint are still listed as pending in `todo.md`, so payments have not been set up for a live account.

MIT License.
