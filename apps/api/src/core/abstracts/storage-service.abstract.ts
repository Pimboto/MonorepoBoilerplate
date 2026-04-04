export abstract class IStorageService {
  abstract deleteFile(key: string): Promise<void>;
  abstract deleteFiles(keys: string[]): Promise<void>;
}
