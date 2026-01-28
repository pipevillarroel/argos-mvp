import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

/**
 * Buscar usuario por email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Crear usuario
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string = "WORKER"
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });
}

/**
 * Validar contraseña
 */
export async function validatePassword(
  plainPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
