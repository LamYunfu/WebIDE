export const FileTemplateInterface = Symbol("FileTemplateInterface");
export interface FileTemplateInterface {
  buildProblemFileStructure: (
    ppid: string,
    targetPath: string
  ) => Promise<boolean>;
}
