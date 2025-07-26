const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class JajanlogModel {
    static async create (payload, userId) {
        try {
            const jajanData = {
              id_user: userId,
              nama_jajan: payload.nama,
              tanggal: payload.tanggal,
              tempat_jajan: payload.tempat,
              kategori_jajan: payload.kategori,
              harga_jajanan: payload.harga,
              foto: payload?.foto
            };

            const createData = await prisma.Jajan_log.create({
                data: jajanData,
            });

            return {
                success: true,
                message: 'jajan log successfully submitted',
                data: createData,
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'invalid while create data'
            }
        }
    }

    static async update (id, payload, userId) {
        try {
            const dataToUpdate = {
                nama_jajan: payload.nama,
                tanggal: payload.tanggal,
                tempat_jajan: payload.tempat,
                kategori_jajan: payload.kategori,
                harga_jajanan: payload.harga,
                foto: payload.foto
            };

            const existing = await prisma.jajan_log.findUnique({
                where: { id_jajan: id }
            });

            if (!existing) {
                throw new Error("Record not found");
            }

            if (userId && existing.id_user !== userId) {
                throw new Error("Unauthorized: You do not own this record");
            }

            const updateData = await prisma.jajan_log.update({
                where: { id_jajan: id },
                data: dataToUpdate,
            });

            return {
                success: true,
                message: 'jajan log successfully updated',
                data: updateData,
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'invalid while update data'
            }
        }
    }

    static async getAll (userId) {
        try {
            const jajanList = await prisma.jajan_log.findMany({
                where: {
                    id_user: userId
                }
            });

             return {
               success: true,
               message: "jajan log successfully retrieved!",
               data: jajanList,
             };
        } catch (error) {
            return {
              success: false,
              message: error.message || "invalid while update data",
            };
        }
    }
}

module.exports = JajanlogModel;