export const ProgramerInterface = Symbol("ProgramerInterface");
export interface ProgramerInterface {
  burn(): Promise<boolean>;
}
