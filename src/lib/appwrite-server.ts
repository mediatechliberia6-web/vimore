/**
 * MOCK SERVER SERVICE — Prototype Mode
 * All node-appwrite calls replaced with mock implementations.
 */

export const DATABASE_ID = 'vimoreprod';

export function getAdminDatabases(): any {
  return {
    async listDocuments(_db: string, _col: string, _queries: any[] = []) {
      return { documents: [], total: 0 };
    },
    async createDocument(_db: string, _col: string, _id: string, _data: any) {
      return { $id: 'mock_' + Date.now() };
    },
  };
}

export function getAdminUsers(): any {
  return {
    async create(_id: string, email: string, _phone: undefined, _password: string, name: string) {
      return { $id: 'mock_' + Date.now(), email, name };
    },
    async updateEmailVerification(_userId: string, _verified: boolean) {
      return {};
    },
    async delete(_userId: string) {
      return {};
    },
  };
}
