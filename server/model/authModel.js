const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

class AuthModel {
  static async register(data) {
    try {
      // Check if passwords match (optional - handled in client)
      if (data.password !== data.confirmPassword && data.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match",
        };
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: "Email already registered",
        };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const registerData = await prisma.user.create({
        data: {
          email: data.email,
          password_hash: hashedPassword,
          nama_pengguna: data.nama, // Use 'nama' from client
          jenis_kelamin: data.jenis_kelamin || null,
          tahun_lahir: data.tahun_lahir || null,
          tanggal_registrasi: new Date(),
        },
      });

      return {
        success: true,
        message: "User registered successfully",
        data: {
          id: registerData.id_user,
          nama: registerData.nama_pengguna,
          email: registerData.email,
          tanggal_registrasi: registerData.tanggal_registrasi,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  }

  static async login(data) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (!user) {
        throw new Error("Password or Email is invalid!");
      }

      const isValidPassword = await bcrypt.compare(
        data.password,
        user.password_hash
      );

      if (!isValidPassword) {
        throw new Error("Password or Email is invalid!");
      }

      const tokenPayload = {
        id: user.id_user,
        nama: user.nama_pengguna,
        tahun_lahir: user.tahun_lahir,
        jenis_kelamin: user.jenis_kelamin,
        email: user.email,
      };

      const jwtSecret =
        process.env.JWT_SECRET
      const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "24h" });

      return {
        success: true,
        message: "Login successful",
        data: {
          id: user.id_user,
          nama: user.nama_pengguna,
          tahun_lahir: user.tahun_lahir,
          jenis_kelamin: user.jenis_kelamin,
          email: user.email,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "invalid login",
      };
    }
  }

  static async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id_user: id },
        select: {
          id_user: true,
          email: true,
          nama_pengguna: true,
          jenis_kelamin: true,
          tahun_lahir: true,
          tanggal_registrasi: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error fetching user",
      };
    }
  }
}

module.exports = AuthModel;
