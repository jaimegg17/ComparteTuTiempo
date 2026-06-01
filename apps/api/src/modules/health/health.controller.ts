import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Comprobar estado de la API' })
  @ApiResponse({ status: 200, description: 'API disponible' })
  getHealth() {
    return {
      status: 'ok',
      service: 'comparte-tu-tiempo-api',
      timestamp: new Date().toISOString(),
    };
  }
}
