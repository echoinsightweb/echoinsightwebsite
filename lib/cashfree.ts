import { Cashfree as CashfreeClass, CFEnvironment } from "cashfree-pg";

const Cashfree = new CashfreeClass(
  process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID || "",
  process.env.CASHFREE_SECRET_KEY || ""
);

export { Cashfree };
