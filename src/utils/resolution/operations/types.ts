export type OperationTransform = (text: string) => string;

export interface OperationDefinition {
  parse: (operation: string) => OperationTransform | null;
}
