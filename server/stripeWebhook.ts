import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { updateUserPlan, getUserByStripeCustomerId } from "./db";

export function registerStripeWebhook(app: Express) {
  // Must be registered BEFORE express.json() middleware
  app.post(
    "/api/stripe/webhook",
    // express.raw is applied inline here — the caller must NOT have json parsed this route
    (req: Request, res: Response) => {
      // If Stripe is not configured, skip
      if (!ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
        res.json({ received: true, skipped: "stripe_not_configured" });
        return;
      }

      const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-03-25.dahlia" });
      const sig = req.headers["stripe-signature"];

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig as string,
          ENV.stripeWebhookSecret
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Stripe Webhook] Signature verification failed:", message);
        res.status(400).json({ error: `Webhook Error: ${message}` });
        return;
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

      // Process events asynchronously
      handleStripeEvent(event).catch((err) => {
        console.error("[Stripe Webhook] Handler error:", err);
      });

      res.json({ received: true });
    }
  );
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id
        ? parseInt(session.metadata.user_id)
        : null;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      if (userId && customerId) {
        await updateUserPlan(userId, "premium", customerId, subscriptionId ?? undefined);
        console.log(`[Stripe] User ${userId} upgraded to premium`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id ?? null;

      if (customerId) {
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          await updateUserPlan(user.id, "free", customerId, undefined);
          console.log(`[Stripe] User ${user.id} downgraded to free (subscription cancelled)`);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`[Stripe] Payment failed for customer: ${invoice.customer}`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}
