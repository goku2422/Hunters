import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { createToken } from "@/lib/auth";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "scratch-offer-secret-key-change-in-production",
  pages: {
    signIn: "/merchant/login",
    error: "/merchant/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const merchant = await db.getMerchantByGoogleEmail(user.email ?? "");
        if (!merchant) return "/merchant/login?error=NotRegistered";
        if (!merchant.isActive) return "/merchant/login?error=Deactivated";
        if (!merchant.googleId && user.id) {
          await db.saveMerchant({ ...merchant, googleId: user.id, passwordHash: merchant.passwordHash });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const merchant = await db.getMerchantByGoogleEmail(user.email);
        if (merchant) {
          const shop = await db.getShopById(merchant.shopId);
          await db.registerOrUpdateSession(merchant.id, merchant.shopId, true, "Google OAuth Login");
          const customToken = createToken({
            type: "merchant",
            id: merchant.id,
            email: merchant.email,
            name: merchant.name,
            shopId: merchant.shopId,
            shopName: shop?.name,
          });
          token.merchantToken = customToken;
          token.merchantId = merchant.id;
          token.shopId = merchant.shopId;
          token.shopName = shop?.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.merchantToken) {
        (session as any).merchantToken = token.merchantToken;
        (session as any).merchantId = token.merchantId;
        (session as any).shopId = token.shopId;
        (session as any).shopName = token.shopName;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/merchant/login") || url === baseUrl) {
        return `${baseUrl}/merchant/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : `${baseUrl}/merchant/dashboard`;
    },
  },
});

export { handler as GET, handler as POST };