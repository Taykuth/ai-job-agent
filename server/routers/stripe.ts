import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import { ENV } from "../_core/env";
import { protectedProcedure, router } from "../_core/trpc";
import { updateUserPlan } from "../db";

// Lazy Stripe initialization — only works when keys are available
function getStripe(): Stripe {
  if (!ENV.stripeSecretKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Payment processing is not configured yet. Please check back shortly.",
    });
  }
  return new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-03-25.dahlia" });
}

// Premium monthly price — $19/month
const PREMIUM_PRICE_USD = 1900; // cents

export const stripeRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.plan === "premium") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already on the Premium plan.",
        });
      }

      const stripe = getStripe();

      // Create or retrieve Stripe customer
      let customerId = ctx.user.stripeCustomerId ?? undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email ?? undefined,
          name: ctx.user.name ?? undefined,
          metadata: {
            userId: ctx.user.id.toString(),
            openId: ctx.user.openId,
          },
        });
        customerId = customer.id;
        // Persist customer ID
        await updateUserPlan(ctx.user.id, "free", customerId, undefined);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "JobAgent AI — Premium Plan",
                description: "Unlimited tailored applications, AI CV & cover letter generation",
              },
              unit_amount: PREMIUM_PRICE_USD,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
        },
        success_url: `${input.origin}/dashboard?upgraded=true`,
        cancel_url: `${input.origin}/dashboard/upgrade?cancelled=true`,
      });

      return { url: session.url };
    }),

  getPortalUrl: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No billing account found.",
        });
      }

      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${input.origin}/dashboard/upgrade`,
      });

      return { url: session.url };
    }),
});
