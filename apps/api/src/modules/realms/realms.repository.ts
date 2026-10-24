import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';

@injectable()
export class RealmsRepository {
  async listRealms() {
    return prisma.realm.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findByRealmId(realmId: string) {
    return prisma.realm.findUnique({
      where: { realmId },
    });
  }
}
