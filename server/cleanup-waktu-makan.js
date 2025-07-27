const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupWaktuMakan() {
  try {
    console.log("🔧 Starting waktu_makan cleanup...");

    // Find sessions with null waktu_makan
    const sessionsWithNullWaktuMakan = await prisma.meal_plan_session.findMany({
      where: {
        waktu_makan: null,
      },
      include: {
        mealPlan: true,
        menus: true,
      },
    });

    console.log(
      `Found ${sessionsWithNullWaktuMakan.length} sessions with null waktu_makan`
    );

    if (sessionsWithNullWaktuMakan.length === 0) {
      console.log("✅ No cleanup needed - all sessions have valid waktu_makan");
      return;
    }

    // Delete sessions with null waktu_makan (this will cascade delete menus)
    const deleteResult = await prisma.meal_plan_session.deleteMany({
      where: {
        waktu_makan: null,
      },
    });

    console.log(
      `🗑️  Deleted ${deleteResult.count} sessions with null waktu_makan`
    );

    // Also clean up any meal plans that now have no sessions
    const mealPlansWithoutSessions = await prisma.meal_plan.findMany({
      where: {
        sessions: {
          none: {},
        },
      },
    });

    if (mealPlansWithoutSessions.length > 0) {
      const deleteMealPlansResult = await prisma.meal_plan.deleteMany({
        where: {
          sessions: {
            none: {},
          },
        },
      });

      console.log(
        `🗑️  Deleted ${deleteMealPlansResult.count} meal plans with no sessions`
      );
    }

    console.log("✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupWaktuMakan();
