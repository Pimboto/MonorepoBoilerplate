export class WorkflowEntity {
  id: string;
  name: string;
  description?: string | null;
  nodes: unknown;
  edges: unknown;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
