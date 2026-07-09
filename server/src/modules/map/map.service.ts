import { MapRepository } from './map.repository';
import { NotFoundError } from '../../common/errors/AppError';

export class MapService {
  private repository: MapRepository;

  constructor() {
    this.repository = new MapRepository();
  }

  async getMapData() {
    return this.repository.getHabitatsWithZones();
  }
}
