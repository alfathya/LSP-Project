const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ShoppingModel {
  static async create(payload, userId) {
    try {
      // Buat shopping log dengan details menggunakan transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Create shopping log
        const shoppingLog = await prisma.shopping_log.create({
          data: {
            topik_belanja: payload.topik_belanja,
            nama_toko: payload.nama_toko,
            tanggal_belanja: payload.tanggal_belanja
              ? new Date(payload.tanggal_belanja)
              : null,
            status: payload.status || "Direncanakan",
            struk: payload.struk || null,
            total_belanja: payload.total_belanja || null,
            id_user: userId,
          },
        });

        // Create shopping details jika ada
        if (payload.items && payload.items.length > 0) {
          const shoppingDetails = await prisma.shopping_details.createMany({
            data: payload.items.map((item) => ({
              nama_item: item.nama_item,
              jumlah_item: item.jumlah_item,
              satuan: item.satuan,
              harga: item.harga || 0,
              id_shoppinglog: shoppingLog.id_shoppinglog,
            })),
          });

          // Get complete data with details
          const completeData = await prisma.shopping_log.findUnique({
            where: { id_shoppinglog: shoppingLog.id_shoppinglog },
            include: {
              shoppingDetails: true,
              user: {
                select: { nama_pengguna: true },
              },
            },
          });

          return completeData;
        }

        return shoppingLog;
      });

      return {
        success: true,
        message: "Shopping log successfully created",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while creating shopping log",
      };
    }
  }

  static async update(id, payload, userId) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // Check if shopping log exists and belongs to user
        const existing = await prisma.shopping_log.findUnique({
          where: { id_shoppinglog: id },
          include: { shoppingDetails: true },
        });

        if (!existing) {
          throw new Error("Shopping log not found");
        }

        if (userId && existing.id_user !== userId) {
          throw new Error("Unauthorized: You do not own this record");
        }

        // Update shopping log only
        const updatedLog = await prisma.shopping_log.update({
          where: { id_shoppinglog: id },
          data: {
            topik_belanja: payload.topik_belanja,
            nama_toko: payload.nama_toko,
            tanggal_belanja: payload.tanggal_belanja
              ? new Date(payload.tanggal_belanja)
              : null,
            status: payload.status,
            struk: payload.struk,
            total_belanja: payload.total_belanja,
          },
        });

        const completeData = await prisma.shopping_log.findUnique({
          where: { id_shoppinglog: id },
          include: {
            shoppingDetails: true,
            user: {
              select: { nama_pengguna: true },
            },
          },
        });

        return completeData;
      });

      return {
        success: true,
        message: "Shopping log successfully updated",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while updating shopping log",
      };
    }
  }

  static async getAll(userId) {
    try {
      const shoppingLogs = await prisma.shopping_log.findMany({
        where: {
          id_user: userId,
        },
        include: {
          shoppingDetails: true,
          user: {
            select: { nama_pengguna: true },
          },
        },
        orderBy: {
          tanggal_belanja: "desc",
        },
      });

      return {
        success: true,
        message: "Shopping logs successfully retrieved",
        data: shoppingLogs,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while retrieving shopping logs",
      };
    }
  }

  static async getById(id, userId) {
    try {
      const shoppingLog = await prisma.shopping_log.findUnique({
        where: { id_shoppinglog: id },
        include: {
          shoppingDetails: true,
          user: {
            select: { nama_pengguna: true },
          },
        },
      });

      if (!shoppingLog) {
        throw new Error("Shopping log not found");
      }

      if (userId && shoppingLog.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this record");
      }

      return {
        success: true,
        message: "Shopping log successfully retrieved",
        data: shoppingLog,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while retrieving shopping log",
      };
    }
  }

  static async delete(id, userId) {
    try {
      const existing = await prisma.shopping_log.findUnique({
        where: { id_shoppinglog: id },
      });

      if (!existing) {
        throw new Error("Shopping log not found");
      }

      if (userId && existing.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this record");
      }

      await prisma.shopping_log.delete({
        where: { id_shoppinglog: id },
      });

      return {
        success: true,
        message: "Shopping log successfully deleted",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while deleting shopping log",
      };
    }
  }

  static async getByStatus(status, userId) {
    try {
      const shoppingLogs = await prisma.shopping_log.findMany({
        where: {
          id_user: userId,
          status: status,
        },
        include: {
          shoppingDetails: true,
          user: {
            select: { nama_pengguna: true },
          },
        },
        orderBy: {
          tanggal_belanja: "desc",
        },
      });

      return {
        success: true,
        message: `Shopping logs with status ${status} successfully retrieved`,
        data: shoppingLogs,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Error while retrieving shopping logs by status",
      };
    }
  }

  static async createShoppingDetails(shoppingLogId, items, userId) {
    try {
      const shoppingLog = await prisma.shopping_log.findUnique({
        where: { id_shoppinglog: shoppingLogId },
      });

      if (!shoppingLog) {
        throw new Error("Shopping log not found");
      }

      if (userId && shoppingLog.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this shopping log");
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items must be a non-empty array");
      }

      const dataToCreate = items.map((item) => ({
        nama_item: item.nama_item,
        jumlah_item: item.jumlah_item,
        satuan: item.satuan,
        harga: item.harga || 0,
        id_shoppinglog: shoppingLogId,
      }));

      const created = await prisma.shopping_details.createMany({
        data: dataToCreate,
      });

      const shoppingDetails = await prisma.shopping_details.findMany({
        where: { id_shoppinglog: shoppingLogId },
        orderBy: { id_shoppingDetail: "asc" },
      });

      return {
        success: true,
        message: "Shopping details successfully created",
        data: shoppingDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while creating shopping details",
      };
    }
  }

  static async updateShoppingDetail(detailId, payload, userId) {
    try {
      const shoppingDetail = await prisma.shopping_details.findUnique({
        where: { id_shoppingDetail: detailId },
        include: {
          shoppingLog: true,
        },
      });

      if (!shoppingDetail) {
        throw new Error("Shopping detail with that id not found");
      }

      if (userId && shoppingDetail.shoppingLog.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this shopping detail");
      }

      const updatedDetail = await prisma.shopping_details.update({
        where: { id_shoppingDetail: detailId },
        data: {
          nama_item: payload.nama_item,
          jumlah_item: payload.jumlah_item,
          satuan: payload.satuan,
          harga: payload.harga,
        },
      });

      return {
        success: true,
        message: "Shopping detail successfully updated",
        data: updatedDetail,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while updating shopping detail",
      };
    }
  }

  static async deleteShoppingDetail(detailId, userId) {
    try {
      const shoppingDetail = await prisma.shopping_details.findUnique({
        where: { id_shoppingDetail: detailId },
        include: {
          shoppingLog: true,
        },
      });

      if (!shoppingDetail) {
        throw new Error("Shopping detail not found");
      }

      if (userId && shoppingDetail.shoppingLog.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this shopping detail");
      }

      await prisma.shopping_details.delete({
        where: { id_shoppingDetail: detailId },
      });

      return {
        success: true,
        message: "Shopping detail successfully deleted",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while deleting shopping detail",
      };
    }
  }

  static async getShoppingDetails(shoppingLogId, userId) {
    try {
      const shoppingLog = await prisma.shopping_log.findUnique({
        where: { id_shoppinglog: shoppingLogId },
      });

      if (!shoppingLog) {
        throw new Error("Shopping log not found");
      }

      if (userId && shoppingLog.id_user !== userId) {
        throw new Error("Unauthorized: You do not own this shopping log");
      }

      const shoppingDetails = await prisma.shopping_details.findMany({
        where: { id_shoppinglog: shoppingLogId },
        orderBy: { id_shoppingDetail: "asc" },
      });

      return {
        success: true,
        message: "Shopping details successfully retrieved",
        data: shoppingDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error while retrieving shopping details",
      };
    }
  }
}

module.exports = ShoppingModel;
