const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MealPlanModel {
  static async create(payload, userId) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // Create meal plan
        const mealPlan = await prisma.meal_plan.create({
          data: {
            id_user: userId,
            tanggal: new Date(payload.tanggal),
            hari: payload.hari,
          },
        });

        // Create sessions with menus if provided
        if (payload.sessions && payload.sessions.length > 0) {
          for (const sessionData of payload.sessions) {
            const session = await prisma.meal_plan_session.create({
              data: {
                id_mealplan: mealPlan.id_mealplan,
                waktu_makan: sessionData.waktu_makan,
              },
            });

            // Create menus for this session
            if (sessionData.menus && sessionData.menus.length > 0) {
              await prisma.meal_plan_menu.createMany({
                data: sessionData.menus.map((menu) => ({
                  id_session: session.id_session,
                  nama_menu: menu.nama_menu,
                  catatan_menu: menu.catatan_menu || null,
                })),
              });
            }
          }
        }

        // Get complete data with relations
        const completeData = await prisma.meal_plan.findUnique({
          where: { id_mealplan: mealPlan.id_mealplan },
          include: {
            user: {
              select: { nama_pengguna: true },
            },
            sessions: {
              include: {
                menus: true,
              },
              orderBy: {
                waktu_makan: "asc",
              },
            },
          },
        });

        return completeData;
      });

      return {
        success: true,
        message: "Meal plan successfully created",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while creating meal plan",
      };
    }
  }

  static async update(id, payload, userId) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // Check if meal plan exists and belongs to user
        const existing = await prisma.meal_plan.findUnique({
          where: { id_mealplan: id },
          include: {
            sessions: {
              include: { menus: true },
            },
          },
        });

        if (!existing) {
          throw new Error("Meal plan not found");
        }

        if (userId && existing.id_user !== userId) {
          throw new Error("Unauthorized: You do not own this meal plan");
        }

        // Update meal plan basic info
        const updatedMealPlan = await prisma.meal_plan.update({
          where: { id_mealplan: id },
          data: {
            tanggal: payload.tanggal
              ? new Date(payload.tanggal)
              : existing.tanggal,
            hari: payload.hari || existing.hari,
          },
        });

        // Update sessions if provided
        if (payload.sessions) {
          // Delete existing sessions and menus (cascade)
          await prisma.meal_plan_session.deleteMany({
            where: { id_mealplan: id },
          });

          // Create new sessions
          for (const sessionData of payload.sessions) {
            const session = await prisma.meal_plan_session.create({
              data: {
                id_mealplan: id,
                waktu_makan: sessionData.waktu_makan,
              },
            });

            // Create menus for this session
            if (sessionData.menus && sessionData.menus.length > 0) {
              await prisma.meal_plan_menu.createMany({
                data: sessionData.menus.map((menu) => ({
                  id_session: session.id_session,
                  nama_menu: menu.nama_menu,
                  catatan_menu: menu.catatan_menu || null,
                })),
              });
            }
          }
        }

        // Get complete updated data
        const completeData = await prisma.meal_plan.findUnique({
          where: { id_mealplan: id },
          include: {
            user: {
              select: { nama_pengguna: true },
            },
            sessions: {
              include: {
                menus: true,
              },
              orderBy: {
                waktu_makan: "asc",
              },
            },
          },
        });

        return completeData;
      });

      return {
        success: true,
        message: "Meal plan successfully updated",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while updating meal plan",
      };
    }
  }

  static async getAll(userId) {
    try {
      const mealPlans = await prisma.meal_plan.findMany({
        where: {
          id_user: userId,
        },
        include: {
          user: {
            select: { nama_pengguna: true },
          },
          sessions: {
            include: {
              menus: true,
            },
            orderBy: {
              waktu_makan: "asc",
            },
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      });

      return {
        success: true,
        message: "Meal plans successfully retrieved",
        data: mealPlans,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while retrieving meal plans",
      };
    }
  }

  static async getById(id, userId) {
    try {
      const mealPlan = await prisma.meal_plan.findUnique({
        where: { id_mealplan: id },
        include: {
          user: {
            select: { nama_pengguna: true },
          },
          sessions: {
            include: {
              menus: true,
            },
            orderBy: {
              waktu_makan: "asc",
            },
          },
        },
      });

      if (!mealPlan) {
        throw new Error("Meal plan not found");
      }

      if (userId && mealPlan.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this meal plan");
      }

      return {
        success: true,
        message: "Meal plan successfully retrieved",
        data: mealPlan,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while retrieving meal plan",
      };
    }
  }

  static async delete(id, userId) {
    try {
      // Check if meal plan exists and belongs to user
      const existing = await prisma.meal_plan.findUnique({
        where: { id_mealplan: id },
      });

      if (!existing) {
        throw new Error("Meal plan not found");
      }

      if (userId && existing.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this meal plan");
      }

      // Delete meal plan (will cascade delete sessions and menus)
      await prisma.meal_plan.delete({
        where: { id_mealplan: id },
      });

      return {
        success: true,
        message: "Meal plan successfully deleted",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while deleting meal plan",
      };
    }
  }

  static async getByDateRange(startDate, endDate, userId) {
    try {
      const mealPlans = await prisma.meal_plan.findMany({
        where: {
          id_user: userId,
          tanggal: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          user: {
            select: { nama_pengguna: true },
          },
          sessions: {
            include: {
              menus: true,
            },
            orderBy: {
              waktu_makan: "asc",
            },
          },
        },
        orderBy: {
          tanggal: "asc",
        },
      });

      return {
        success: true,
        message: "Meal plans successfully retrieved",
        data: mealPlans,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Error while retrieving meal plans by date range",
      };
    }
  }

  static async getByDate(date, userId) {
    try {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const mealPlan = await prisma.meal_plan.findFirst({
        where: {
          id_user: userId,
          tanggal: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: {
          user: {
            select: { nama_pengguna: true },
          },
          sessions: {
            include: {
              menus: true,
            },
            orderBy: {
              waktu_makan: "asc",
            },
          },
        },
      });

      return {
        success: true,
        message: mealPlan
          ? "Meal plan successfully retrieved"
          : "No meal plan found for this date",
        data: mealPlan,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while retrieving meal plan by date",
      };
    }
  }

  // Session-specific methods
  static async addSession(mealPlanId, sessionData, userId) {
    try {
      // Check if meal plan exists and belongs to user
      const mealPlan = await prisma.meal_plan.findUnique({
        where: { id_mealplan: mealPlanId },
      });

      if (!mealPlan) {
        throw new Error("Meal plan not found");
      }

      if (userId && mealPlan.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this meal plan");
      }

      const result = await prisma.$transaction(async (prisma) => {
        // Create session
        const session = await prisma.meal_plan_session.create({
          data: {
            id_mealplan: mealPlanId,
            waktu_makan: sessionData.waktu_makan,
          },
        });

        // Create menus for this session
        if (sessionData.menus && sessionData.menus.length > 0) {
          await prisma.meal_plan_menu.createMany({
            data: sessionData.menus.map((menu) => ({
              id_session: session.id_session,
              nama_menu: menu.nama_menu,
              catatan_menu: menu.catatan_menu || null,
            })),
          });
        }

        // Get complete session data
        const completeSession = await prisma.meal_plan_session.findUnique({
          where: { id_session: session.id_session },
          include: {
            menus: true,
          },
        });

        return completeSession;
      });

      return {
        success: true,
        message: "Meal plan session successfully added",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while adding meal plan session",
      };
    }
  }

  // Menu-specific methods
  static async addMenuToSession(sessionId, menuData, userId) {
    try {
      // Check if session exists and belongs to user
      const session = await prisma.meal_plan_session.findUnique({
        where: { id_session: sessionId },
        include: {
          mealPlan: true,
        },
      });

      if (!session) {
        throw new Error("Meal plan session not found");
      }

      if (userId && session.mealPlan.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this meal plan session");
      }

      // Create menu for this session
      const menu = await prisma.meal_plan_menu.create({
        data: {
          id_session: sessionId,
          nama_menu: menuData.nama_menu,
          catatan_menu: menuData.catatan_menu || null,
        },
      });

      return {
        success: true,
        message: "Menu successfully added to session",
        data: menu,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while adding menu to session",
      };
    }
  }
}

module.exports = MealPlanModel;
