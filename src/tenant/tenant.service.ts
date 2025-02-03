// src/tenant/tenant.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from './tenant.schema';

@Injectable()
export class TenantService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<Tenant>) {}

  // Dodanie nowego tenanta
  async createTenant(name: string, tenantId: string, role: string): Promise<Tenant> {
    const tenant = new this.tenantModel({ name, tenantId, role });
    return tenant.save();
  }

  // Znajdź tenant po tenantId
  async findByTenantId(tenantId: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ tenantId }).exec();
  }

  // Znajdź wszystkich tenantów
  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }
}
