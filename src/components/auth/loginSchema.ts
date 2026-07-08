import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa tu correo electrónico"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type SignInFormData = z.infer<typeof loginSchema>;
