
export type CopperObjectType = "lead" | "person" | "company" | "opportunity" | "project" | "task"

export const capitalise = (w: string)  => w[0].toUpperCase() + w.slice(1)