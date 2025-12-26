
const bcrypt = require('bcrypt');
const prisma = require('../database/prisma');

class User {
  static async create({ email, username, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        isConfirmed: false
      },
      select: {
        id: true,
        email: true,
        username: true,
        isConfirmed: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isConfirmed: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        username: true,
        isConfirmed: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async findByEmailOrUsername(email, username) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async count() {
    return await prisma.user.count();
  }

  static async findAll(limit = 10, offset = 0) {
    return await prisma.user.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        username: true,
        isConfirmed: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = User;
