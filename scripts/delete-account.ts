import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { accounts } from "@/db/schema";

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: tsx scripts/delete-account.ts <userId>");
  process.exit(1);
}

async function deleteAccount() {
  try {
    console.log(`Deleting account for user: ${userId}`);

    const result = await db
      .delete(accounts)
      .where(eq(accounts.userId, userId))
      .returning();

    if (result.length > 0) {
      console.log(
        `Successfully deleted ${result.length} account(s) for user ${userId}`,
      );
      console.log(
        "Deleted accounts:",
        result.map((account) => ({ id: account.id, providerId: account.providerId })),
      );
    } else {
      console.log(`No accounts found for user ${userId}`);
    }

    await pool.end();
  } catch (error) {
    console.error("Error deleting account:", error);
    process.exit(1);
  }
}

deleteAccount();
