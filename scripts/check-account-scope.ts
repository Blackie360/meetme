import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { accounts } from "@/db/schema";

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: tsx scripts/check-account-scope.ts <userId>");
  process.exit(1);
}

async function checkAccountScope() {
  try {
    console.log(`Checking account scope for user: ${userId}\n`);
    
    const userAccounts = await db
      .select({
        id: accounts.id,
        providerId: accounts.providerId,
        scope: accounts.scope,
        hasAccessToken: accounts.accessToken !== null,
        hasRefreshToken: accounts.refreshToken !== null,
      })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    if (userAccounts.length === 0) {
      console.log(`No accounts found for user ${userId}`);
      await pool.end();
      return;
    }

    console.log(`Found ${userAccounts.length} account(s):\n`);
    
    userAccounts.forEach((account, index) => {
      console.log(`Account ${index + 1}:`);
      console.log(`  ID: ${account.id}`);
      console.log(`  Provider: ${account.providerId}`);
      console.log(`  Scope: ${account.scope || "null"}`);
      console.log(`  Has Access Token: ${account.hasAccessToken}`);
      console.log(`  Has Refresh Token: ${account.hasRefreshToken}`);
      
      if (account.scope) {
        const scopes = account.scope.split(" ");
        const hasCalendarScope = scopes.includes("https://www.googleapis.com/auth/calendar");
        console.log(`  Has Calendar Scope: ${hasCalendarScope ? "✅ YES" : "❌ NO"}`);
        console.log(`  All scopes:`, scopes);
      } else {
        console.log(`  Has Calendar Scope: ❌ NO (scope is null)`);
      }
      console.log("");
    });
    
    await pool.end();
  } catch (error) {
    console.error("Error checking account scope:", error);
    await pool.end();
    process.exit(1);
  }
}

checkAccountScope();

