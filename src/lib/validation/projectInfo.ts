import { z } from "zod";
import type { NewProjectInfoDto } from "@/lib/api/projects";

export const projectInfoSchema = z.object({
  name: z.string().trim().min(1, "Campo requerido"),
  visibility: z.enum(["PRIVATE", "ORGANIZATION"]),
  companyName: z.string().trim().min(1, "Campo requerido"),
  oilField: z.string().trim().min(1, "Campo requerido"),
  location: z.string().trim().min(1, "Campo requerido"),
  wellName: z.string().trim().min(1, "Campo requerido"),
  sandType: z.string().trim().min(1, "Campo requerido"),
  date: z.string().trim().min(1, "Campo requerido"),
  analystName: z.string().trim().min(1, "Campo requerido"),
  wellType: z.string().trim().min(1, "Campo requerido"),
  commentaries: z.string(),
});

export type ProjectInfoFormValues = z.infer<typeof projectInfoSchema>;

type ProjectInfoDetails = Omit<ProjectInfoFormValues, "name" | "visibility">;

// `details` only needs to structurally satisfy ProjectInfoDetails — passing the full
// ProjectInfoFormValues (which also has `name`/`visibility`) works fine here.
export const toNewProjectInfoDto = (name: string, details: ProjectInfoDetails): NewProjectInfoDto => ({
  newProjectName: name,
  companyName: details.companyName,
  oilField: details.oilField,
  location: details.location,
  wellName: details.wellName,
  sandType: details.sandType,
  date: details.date,
  analystName: details.analystName,
  wellType: details.wellType,
  commentaries: details.commentaries,
});

export const fromNewProjectInfoDto = (info: NewProjectInfoDto | undefined): ProjectInfoDetails => ({
  companyName: info?.companyName ?? "",
  oilField: info?.oilField ?? "",
  location: info?.location ?? "",
  wellName: info?.wellName ?? "",
  sandType: info?.sandType ?? "",
  date: info?.date ?? "",
  analystName: info?.analystName ?? "",
  wellType: info?.wellType ?? "",
  commentaries: info?.commentaries ?? "",
});
