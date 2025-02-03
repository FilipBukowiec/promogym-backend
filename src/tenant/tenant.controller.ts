// src/tenant/tenant.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from './tenant.schema';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // Tworzenie nowego tenanta
  @Post()
  async create(@Body() createTenantDto: { name: string; tenantId: string; role: string }): Promise<Tenant> {
    return this.tenantService.createTenant(createTenantDto.name, createTenantDto.tenantId, createTenantDto.role);
  }

  // Pobieranie wszystkich tenantów
  @Get()
  async findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }

  // Pobieranie tenanta po tenantId
  @Get(':tenantId')
  async findByTenantId(@Body('tenantId') tenantId: string): Promise<Tenant | null> {
    return this.tenantService.findByTenantId(tenantId);
  }
}
