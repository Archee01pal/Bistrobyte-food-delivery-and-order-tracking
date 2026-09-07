import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports & Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall executive dashboard analytics and revenue metrics' })
  @Roles('admin', 'restaurant_admin')
  getDashboardMetrics(@Query() query: GetReportsQueryDto) {
    return this.reportsService.getDashboardSummary(query);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get delivery partner performance summary' })
  @Roles('admin', 'restaurant_admin', 'delivery_partner')
  getDriverPerformance(@Param('driverId') driverId: string) {
    return this.reportsService.getDriverPerformanceSummary(driverId);
  }
}