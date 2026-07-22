import { Router } from "express";
import pushRoutes from "./push.js";
import channelsRoutes from "./channels.js";
import ordersRoutes from "./orders.js";
import serviceRequestsRoutes from "./service-requests.js";
import calendarRoutes from "./calendar.js";
import geminiRoutes from "./gemini.js";
import templatesRoutes from "./templates.js";
import conversationsRoutes from "./conversations.js";

const apiRouter = Router();

apiRouter.use("/push", pushRoutes);
apiRouter.use("/channels", channelsRoutes);
apiRouter.use("/orders", ordersRoutes);
apiRouter.use("/service-requests", serviceRequestsRoutes);
apiRouter.use("/calendar", calendarRoutes);
apiRouter.use("/gemini", geminiRoutes);
apiRouter.use("/templates", templatesRoutes);
apiRouter.use("/conversations", conversationsRoutes);

export default apiRouter;
