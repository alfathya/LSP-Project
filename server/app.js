require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const Router = require("./router");
const errorHandler = require("./middleware/errorHandler");

const port = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(Router);
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`REST API Ready, running on PORT ${port}`);
  try {
    await prisma.$connect();
    console.log({
      status: 'OK',
      message: 'Database connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
});
