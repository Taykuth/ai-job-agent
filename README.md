# JobAgent AI 🚀

JobAgent AI is a comprehensive, full-stack SaaS application designed to streamline and supercharge the job application process. By leveraging the power of LLMs (Large Language Models), JobAgent AI helps job seekers tailor their CVs and Cover Letters for specific roles, track applications, and optimize their chances of landing their dream job.

![JobAgent AI](https://aijobagent-kwkntto4.manus.space/favicon.ico)

## 🌟 Key Features

*   **Intelligent CV Parsing:** Upload your existing CV (PDF/DOCX). The AI automatically parses and understands your professional profile.
*   **Job-Specific Tailoring:** Paste a job description or URL, and the AI generates a customized, tailored CV highlighting your most relevant experience.
*   **Personalized Cover Letters:** Automatically generate compelling, authentic cover letters that match the tone and requirements of the target company.
*   **Application Tracking (CRM for Job Seekers):** A built-in Kanban-style board to track the status of your applications (Applied, Interviewing, Offer, Rejected).
*   **Freemium Model & Stripe Integration:** Users get a trial limit (e.g., 5 free tailored applications). Premium subscriptions are handled seamlessly via Stripe.
*   **Secure File Storage:** CV uploads are securely accommodated via AWS S3 integrations.

## 🛠️ Technology Stack

This project is built with a modern, high-performance web stack:

**Frontend:**
*   [React](https://reactjs.org/) (v19)
*   [Vite](https://vitejs.dev/) - Blazing fast frontend tooling
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
*   [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/) - Accessible, unstyled UI components
*   [Framer Motion](https://www.framer.com/motion/) - Smooth animations

**Backend:**
*   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - Server environment
*   [tRPC](https://trpc.io/) - End-to-end typesafe APIs
*   [Drizzle ORM](https://orm.drizzle.team/) - Lightweight, performant TypeScript ORM
*   [Zod](https://zod.dev/) - Schema validation

**Integrations:**
*   **LLM Provider** for text generation and CV parsing
*   **Stripe API** for payment processing and subscription webhook handling
*   **AWS S3** for resume storage

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/en/download/) (v18 or higher recommended)
*   [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Taykuth/ai-job-agent.git
   cd ai-job-agent
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the necessary environment variables:
   ```env
   # Database connection
   DATABASE_URL=your_database_url
   
   # Stripe configuration
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # AWS S3 (for CV uploads)
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET_NAME=your_bucket_name
   ```

4. **Initialize the Database:**
   Push the schema to your database.
   ```bash
   pnpm run db:push
   ```

### Running the Application

To start the development server (both frontend and backend concurrently via Vite & tsx):

```bash
pnpm run dev
```

The application should now be running locally. By default, Vite will start the frontend on `http://localhost:5000` (or another available port).

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for blazing-fast unit and integration testing. Run the test suite using:

```bash
pnpm run test
```

## 🏗️ Build for Production

To create a production-ready build of both the frontend (Vite) and backend (esbuild):

```bash
pnpm run build
```

Then, you can start the production server:

```bash
pnpm run start
```

## 📜 License

This project is licensed under the MIT License - see the `package.json` for details.
