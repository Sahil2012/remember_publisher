import { Router, raw } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { resolveUser } from "../middleware/resolveUser.js";
import { 
    createCheckoutSessionHandler, 
    createPortalSessionHandler, 
    stripeWebhookHandler, 
    syncSubscriptionHandler,
    getSubscriptionDetailsHandler,
    cancelSubscriptionHandler
} from "../controller/stripeController.js";

const stripeRoutes = Router();

stripeRoutes.post("/create-checkout-session", requireAuth, resolveUser, createCheckoutSessionHandler);
stripeRoutes.post("/create-portal-session", requireAuth, resolveUser, createPortalSessionHandler);
stripeRoutes.get("/sync-subscription", requireAuth, resolveUser, syncSubscriptionHandler);
stripeRoutes.get("/details", requireAuth, resolveUser, getSubscriptionDetailsHandler);
stripeRoutes.post("/cancel", requireAuth, resolveUser, cancelSubscriptionHandler);

export default stripeRoutes;
