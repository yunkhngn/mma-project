"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_service_1 = require("./config/config.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    const configService = app.get(config_service_1.AppConfigService);
    const port = configService.port;
    await app.listen(port);
    console.log(`🚀 NestJS Server running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map