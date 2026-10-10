This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables Setup
When deploying to Vercel, ensure the following environment variables are strictly configured:

- `DATABASE_URL` & `DIRECT_URL`: Supabase Postgres connection strings.
- `NEXTAUTH_SECRET`: Random 32-character string for NextAuth session encryption.
- `NEXTAUTH_URL`: Your production domain (e.g., `https://echoinsight.in`).
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google Admin Login.
- `CASHFREE_APP_ID`: Your Cashfree API Key (Sandbox or Production).
- `CASHFREE_SECRET_KEY`: Your Cashfree API Secret.
- `CASHFREE_ENVIRONMENT`: Backend environment (`SANDBOX` or `PRODUCTION`).
- `NEXT_PUBLIC_CASHFREE_ENVIRONMENT`: Frontend environment (`sandbox` or `production`) to ensure the SDK opens the correct checkout window.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
