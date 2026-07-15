import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual."),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula.")
      .regex(/[0-9]/, "Debe contener al menos un número.")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un símbolo."),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
