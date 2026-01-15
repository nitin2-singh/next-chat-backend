import { userRepository } from "../repository/user.repository";
import { comparePassword, hashPassword } from "../util/hash";
import { HttpError } from "../util/http-error";
import { signToken } from "../util/jwt";

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const existing = await userRepository.findByEmail(email);

  if (existing) {
    throw new HttpError("User already exists", 401);
  }

  const hashed = await hashPassword(password);
  const user = await userRepository.create(email, hashed, firstName, lastName);

  return {
    token: signToken({ userId: user.id }),
    user: {
      id: user.id,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
    },
  };
}

export async function login(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new HttpError("Invalid credentials", 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new HttpError("Invalid credentials", 403);
  }

  return {
    token: signToken({ userId: user.id }),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}

export async function getUser(id: string) {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  return {
    token: signToken({ userId: user.id }),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}
