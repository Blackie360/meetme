import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import type { GoogleProfile } from "next-auth/providers/google";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession, type NextAuthOptions } from "next-auth";

import { db } from "@/db";
import { accounts, users } from "@/db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  );
}

if (!authSecret) {
  throw new Error(
    "Auth secret is not configured. Please set AUTH_SECRET (or NEXTAUTH_SECRET) for NextAuth.js.",
  );
}

type UpsertGoogleAccountParams = {
  account: {
    provider: string;
    providerAccountId: string;
    access_token?: string | null;
    refresh_token?: string | null;
    scope?: stwring | null;
    id_token?: string | null;
    expires_at?: number | null;
  };
  profile?: GoogleProfile | undefined;
};

async function upsertGoogleAccount({
  account,
  profile,
}: UpsertGoogleAccountParams) {
  if (!account.providerAccountId) {
    throw new Error("Google account response is missing providerAccountId.");
  }

  const email = profile?.email;

  if (!email) {
    throw new Error("Google profile does not include an email address.");
  }

  const now = new Date();

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const displayName = profile?.name ?? existingUser?.name ?? null;
  const image = profile?.picture ?? existingUser?.image ?? null;

  const userId = existingUser?.id ?? randomUUID();

  if (existingUser) {
    await db
      .update(users)
      .set({
        name: displayName,
        image,
        updatedAt: now,
      })
      .where(eq(users.id, existingUser.id));
  } else {
    await db.insert(users).values({
      id: userId,
      email,
      name: displayName,
      image,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const [existingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.providerId, account.provider),
        eq(accounts.accountId, account.providerAccountId),
      ),
    )
    .limit(1);

  const accessTokenExpiresAt = account.expires_at
    ? new Date(account.expires_at * 1000)
    : existingAccount?.accessTokenExpiresAt ?? null;

  const accessToken = account.access_token ?? existingAccount?.accessToken ?? null;
  const refreshToken = account.refresh_token ?? existingAccount?.refreshToken ?? null;
  const scope = account.scope ?? existingAccount?.scope ?? null;
  const idToken = account.id_token ?? existingAccount?.idToken ?? null;

  if (existingAccount) {
    await db
      .update(accounts)
      .set({
        accessToken,
        refreshToken,
        scope,
        idToken,
        accessTokenExpiresAt,
        updatedAt: now,
      })
      .where(eq(accounts.id, existingAccount.id));
  } else {
    await db.insert(accounts).values({
      id: randomUUID(),
      userId,
      accountId: account.providerAccountId,
      providerId: account.provider,
      accessToken,
      refreshToken,
      scope,
      idToken,
      accessTokenExpiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("Failed to fetch user after upserting Google account.");
  }

  return user;
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const user = await upsertGoogleAccount({
          account: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            scope: account.scope,
            id_token: account.id_token,
            expires_at: account.expires_at,
          },
          profile: profile as GoogleProfile | undefined,
        });

        token.uid = user.id;
        token.email = user.email;
        token.name = user.name ?? token.name;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        session.user.email = token.email as string | undefined;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
      }

      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
