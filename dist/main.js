/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HttpExceptionFilter_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpExceptionFilter = void 0;
const common_1 = __webpack_require__(3);
const core_1 = __webpack_require__(1);
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'object') {
                message = response.message || message;
                error = response.error;
            }
            else {
                message = response;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        const responseBody = {
            success: false,
            message,
            error,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };
        // Log the error
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url}`, exception);
        }
        else if (status >= 400) {
            this.logger.warn(`[${request.method}] ${request.url} - ${message}`);
        }
        httpAdapter.reply(ctx.getResponse(), responseBody, status);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.HttpAdapterHost !== "undefined" && core_1.HttpAdapterHost) === "function" ? _a : Object])
], HttpExceptionFilter);


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(3);
const operators_1 = __webpack_require__(6);
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip } = request;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const duration = Date.now() - startTime;
            const statusCode = context.switchToHttp().getResponse().statusCode;
            this.logger.debug(`[${method}] ${url} - ${statusCode} - ${duration}ms - IP: ${ip}`);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformInterceptor = void 0;
const common_1 = __webpack_require__(3);
const operators_1 = __webpack_require__(6);
const api_response_dto_1 = __webpack_require__(8);
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            // If already wrapped in ApiResponseDto, return as-is
            if (data instanceof api_response_dto_1.ApiResponseDto) {
                return data;
            }
            // Wrap response
            return api_response_dto_1.ApiResponseDto.success(data, 'Success');
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiResponseDto = void 0;
class ApiResponseDto {
    constructor(success, data, message, meta, error) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.meta = meta;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }
    static success(data, message = 'Success', meta) {
        return new ApiResponseDto(true, data, message, meta);
    }
    static error(error, message = 'Error') {
        return new ApiResponseDto(false, undefined, message, undefined, error);
    }
}
exports.ApiResponseDto = ApiResponseDto;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const schedule_1 = __webpack_require__(12);
const typeorm_naming_strategies_1 = __webpack_require__(13);
const configuration_1 = __webpack_require__(14);
const validation_schema_1 = __webpack_require__(15);
// Explicit entity imports (required for webpack bundling)
const user_entity_1 = __webpack_require__(17);
const organization_entity_1 = __webpack_require__(20);
const vehicle_entity_1 = __webpack_require__(21);
const vehicle_group_entity_1 = __webpack_require__(23);
const gps_history_entity_1 = __webpack_require__(24);
const geofence_entity_1 = __webpack_require__(26);
const vehicle_geofence_entity_1 = __webpack_require__(27);
const alert_entity_1 = __webpack_require__(28);
const alert_rule_entity_1 = __webpack_require__(30);
const auth_module_1 = __webpack_require__(31);
const users_module_1 = __webpack_require__(46);
const organizations_module_1 = __webpack_require__(56);
const vehicles_module_1 = __webpack_require__(61);
const gps_history_module_1 = __webpack_require__(66);
const geofences_module_1 = __webpack_require__(70);
const alerts_module_1 = __webpack_require__(75);
const reports_module_1 = __webpack_require__(80);
const gps_providers_module_1 = __webpack_require__(84);
// QueueModule removed: GPS pipeline now persists directly to DB (no Redis needed)
// import { QueueModule } from '@modules/queue/queue.module';
const super_admin_module_1 = __webpack_require__(96);
const entities = [
    user_entity_1.UserEntity,
    organization_entity_1.OrganizationEntity,
    vehicle_entity_1.VehicleEntity,
    vehicle_group_entity_1.VehicleGroupEntity,
    gps_history_entity_1.GpsHistoryEntity,
    geofence_entity_1.GeofenceEntity,
    vehicle_geofence_entity_1.VehicleGeofenceEntity,
    alert_entity_1.AlertEntity,
    alert_rule_entity_1.AlertRuleEntity,
];
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.configuration],
                validate: (config) => {
                    try {
                        return validation_schema_1.configValidationSchema.parse(config);
                    }
                    catch (error) {
                        throw new Error(`Config validation error: ${error}`);
                    }
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    const config = (0, configuration_1.getConfiguration)();
                    return {
                        type: 'postgres',
                        url: config.DATABASE_URL,
                        entities,
                        namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
                        synchronize: false,
                        logging: config.isDevelopment,
                        dropSchema: false,
                        ssl: config.isProduction ? { rejectUnauthorized: false } : false,
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            vehicles_module_1.VehiclesModule,
            gps_history_module_1.GpsHistoryModule,
            geofences_module_1.GeofencesModule,
            alerts_module_1.AlertsModule,
            reports_module_1.ReportsModule,
            gps_providers_module_1.GpsProvidersModule,
            // QueueModule, // Disabled: requires Redis; GPS data pipeline uses direct DB persistence
            super_admin_module_1.SuperAdminModule,
        ],
    })
], AppModule);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("typeorm-naming-strategies");

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getConfiguration = void 0;
exports.configuration = configuration;
const validation_schema_1 = __webpack_require__(15);
function configuration() {
    const envVars = process.env;
    try {
        const validated = validation_schema_1.configValidationSchema.parse(envVars);
        return {
            ...validated,
            isDevelopment: validated.NODE_ENV === 'development',
            isProduction: validated.NODE_ENV === 'production',
        };
    }
    catch (error) {
        console.error('Environment validation failed:', error.errors);
        throw new Error('Invalid environment configuration');
    }
}
const getConfiguration = () => configuration();
exports.getConfiguration = getConfiguration;


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configValidationSchema = void 0;
const zod_1 = __webpack_require__(16);
exports.configValidationSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Database
    DATABASE_URL: zod_1.z.string().optional(),
    DIRECT_URL: zod_1.z.string().optional(),
    // Supabase
    SUPABASE_URL: zod_1.z.string().default(''),
    SUPABASE_ANON_KEY: zod_1.z.string().default(''),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().default(''),
    // Redis
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    REDIS_PASSWORD: zod_1.z.string().default(''),
    REDIS_URL: zod_1.z.string().optional(),
    // JWT
    JWT_SECRET: zod_1.z.string().default('fleet-tracker_jwt_secret_change_in_production'),
    JWT_EXPIRATION: zod_1.z.string().default('24h'),
    JWT_REFRESH_SECRET: zod_1.z.string().default('fleet-tracker_refresh_secret_change_in_production'),
    JWT_REFRESH_EXPIRATION: zod_1.z.string().default('7d'),
    // Frontend
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
    // GPS Providers - all optional (adapters auto-disable if not configured)
    FLESPI_TOKEN: zod_1.z.string().default(''),
    FLESPI_MQTT_HOST: zod_1.z.string().default('mqtt.flespi.io'),
    FLESPI_MQTT_PORT: zod_1.z.coerce.number().default(8883),
    ECHOES_API_URL: zod_1.z.string().default('https://api.neutral-server.com'),
    ECHOES_ACCOUNT_ID: zod_1.z.string().default(''),
    ECHOES_API_KEY: zod_1.z.string().default(''),
    UBIWAN_API_URL: zod_1.z.string().default('https://api.ubiwan.net'),
    UBIWAN_USERNAME: zod_1.z.string().default(''),
    UBIWAN_PASSWORD: zod_1.z.string().default(''),
    UBIWAN_SERVER_NAME: zod_1.z.string().default('Phoenix'),
    UBIWAN_SERVER_KEY: zod_1.z.string().default(''),
    UBIWAN_ACCOUNT_NAME: zod_1.z.string().default(''),
    UBIWAN_LICENSE: zod_1.z.string().default(''),
    KEEPTRACE_API_URL: zod_1.z.string().default('https://customerapi.live.keeptrace.fr'),
    KEEPTRACE_API_KEY: zod_1.z.string().default(''),
    // Mapbox
    MAPBOX_TOKEN: zod_1.z.string().default(''),
    // Email
    SMTP_HOST: zod_1.z.string().default(''),
    SMTP_PORT: zod_1.z.coerce.number().default(587),
    SMTP_USER: zod_1.z.string().default(''),
    SMTP_PASSWORD: zod_1.z.string().default(''),
    SMTP_FROM_EMAIL: zod_1.z.string().default('noreply@fleet-tracker.app'),
    // Workers
    BULL_QUEUE_ATTEMPTS: zod_1.z.coerce.number().default(3),
    BULL_QUEUE_BACKOFF_DELAY: zod_1.z.coerce.number().default(5000),
});


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const role_enum_1 = __webpack_require__(19);
let UserEntity = class UserEntity {
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], UserEntity.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], UserEntity.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: role_enum_1.Role, default: role_enum_1.Role.OPERATOR }),
    __metadata("design:type", typeof (_a = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _a : Object)
], UserEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], UserEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserEntity.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], UserEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], UserEntity.prototype, "updatedAt", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)('users')
], UserEntity);


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["MANAGER"] = "MANAGER";
    Role["OPERATOR"] = "OPERATOR";
    Role["DRIVER"] = "DRIVER";
})(Role || (exports.Role = Role = {}));


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationEntity = void 0;
const typeorm_1 = __webpack_require__(18);
let OrganizationEntity = class OrganizationEntity {
};
exports.OrganizationEntity = OrganizationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], OrganizationEntity.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], OrganizationEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'active' }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], OrganizationEntity.prototype, "apiKeys", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], OrganizationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], OrganizationEntity.prototype, "updatedAt", void 0);
exports.OrganizationEntity = OrganizationEntity = __decorate([
    (0, typeorm_1.Entity)('organizations')
], OrganizationEntity);


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const vehicle_status_enum_1 = __webpack_require__(22);
let VehicleEntity = class VehicleEntity {
};
exports.VehicleEntity = VehicleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VehicleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "plate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "vin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "deviceImei", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "currentLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "currentLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true, default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "currentSpeed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "currentHeading", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], VehicleEntity.prototype, "lastCommunication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: vehicle_status_enum_1.VehicleStatus, default: vehicle_status_enum_1.VehicleStatus.ACTIVE }),
    __metadata("design:type", typeof (_b = typeof vehicle_status_enum_1.VehicleStatus !== "undefined" && vehicle_status_enum_1.VehicleStatus) === "function" ? _b : Object)
], VehicleEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], VehicleEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], VehicleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], VehicleEntity.prototype, "updatedAt", void 0);
exports.VehicleEntity = VehicleEntity = __decorate([
    (0, typeorm_1.Entity)('vehicles'),
    (0, typeorm_1.Index)(['organizationId']),
    (0, typeorm_1.Index)(['groupId']),
    (0, typeorm_1.Index)(['deviceImei'])
], VehicleEntity);


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleStatus = void 0;
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["ACTIVE"] = "ACTIVE";
    VehicleStatus["INACTIVE"] = "INACTIVE";
    VehicleStatus["MAINTENANCE"] = "MAINTENANCE";
})(VehicleStatus || (exports.VehicleStatus = VehicleStatus = {}));


/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleGroupEntity = void 0;
const typeorm_1 = __webpack_require__(18);
let VehicleGroupEntity = class VehicleGroupEntity {
};
exports.VehicleGroupEntity = VehicleGroupEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VehicleGroupEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], VehicleGroupEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VehicleGroupEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], VehicleGroupEntity.prototype, "parentGroupId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], VehicleGroupEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], VehicleGroupEntity.prototype, "updatedAt", void 0);
exports.VehicleGroupEntity = VehicleGroupEntity = __decorate([
    (0, typeorm_1.Entity)('vehicle_groups'),
    (0, typeorm_1.Index)(['organizationId']),
    (0, typeorm_1.Index)(['parentGroupId'])
], VehicleGroupEntity);


/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const provider_enum_1 = __webpack_require__(25);
let GpsHistoryEntity = class GpsHistoryEntity {
};
exports.GpsHistoryEntity = GpsHistoryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GpsHistoryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GpsHistoryEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GpsHistoryEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], GpsHistoryEntity.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], GpsHistoryEntity.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GpsHistoryEntity.prototype, "speed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GpsHistoryEntity.prototype, "heading", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GpsHistoryEntity.prototype, "altitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GpsHistoryEntity.prototype, "accuracy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", typeof (_a = typeof provider_enum_1.Provider !== "undefined" && provider_enum_1.Provider) === "function" ? _a : Object)
], GpsHistoryEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], GpsHistoryEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ precision: 6 }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], GpsHistoryEntity.prototype, "createdAt", void 0);
exports.GpsHistoryEntity = GpsHistoryEntity = __decorate([
    (0, typeorm_1.Entity)('gps_history'),
    (0, typeorm_1.Index)(['vehicleId']),
    (0, typeorm_1.Index)(['organizationId']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['vehicleId', 'createdAt'])
], GpsHistoryEntity);


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Provider = void 0;
var Provider;
(function (Provider) {
    Provider["FLESPI"] = "FLESPI";
    Provider["ECHOES"] = "ECHOES";
    Provider["UBIWAN"] = "UBIWAN";
    Provider["KEEPTRACE"] = "KEEPTRACE";
    Provider["MANUAL"] = "MANUAL";
})(Provider || (exports.Provider = Provider = {}));


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofenceEntity = exports.GeofenceType = void 0;
const typeorm_1 = __webpack_require__(18);
var GeofenceType;
(function (GeofenceType) {
    GeofenceType["CIRCLE"] = "CIRCLE";
    GeofenceType["POLYGON"] = "POLYGON";
    GeofenceType["RECTANGLE"] = "RECTANGLE";
})(GeofenceType || (exports.GeofenceType = GeofenceType = {}));
let GeofenceEntity = class GeofenceEntity {
};
exports.GeofenceEntity = GeofenceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'geometry', spatialFeatureType: 'Geometry', srid: 4326, nullable: true }),
    __metadata("design:type", Object)
], GeofenceEntity.prototype, "geometry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeofenceEntity.prototype, "radius", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], GeofenceEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GeofenceEntity.prototype, "isTemporary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], GeofenceEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], GeofenceEntity.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GeofenceEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], GeofenceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], GeofenceEntity.prototype, "updatedAt", void 0);
exports.GeofenceEntity = GeofenceEntity = __decorate([
    (0, typeorm_1.Entity)('geofences'),
    (0, typeorm_1.Index)(['organizationId'])
], GeofenceEntity);


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleGeofenceEntity = void 0;
const typeorm_1 = __webpack_require__(18);
let VehicleGeofenceEntity = class VehicleGeofenceEntity {
};
exports.VehicleGeofenceEntity = VehicleGeofenceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VehicleGeofenceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VehicleGeofenceEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VehicleGeofenceEntity.prototype, "geofenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], VehicleGeofenceEntity.prototype, "alertOnEntry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], VehicleGeofenceEntity.prototype, "alertOnExit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], VehicleGeofenceEntity.prototype, "createdAt", void 0);
exports.VehicleGeofenceEntity = VehicleGeofenceEntity = __decorate([
    (0, typeorm_1.Entity)('vehicle_geofences'),
    (0, typeorm_1.Index)(['vehicleId']),
    (0, typeorm_1.Index)(['geofenceId']),
    (0, typeorm_1.Index)(['vehicleId', 'geofenceId'], { unique: true })
], VehicleGeofenceEntity);


/***/ }),
/* 28 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const alert_type_enum_1 = __webpack_require__(29);
let AlertEntity = class AlertEntity {
};
exports.AlertEntity = AlertEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AlertEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: alert_type_enum_1.AlertType }),
    __metadata("design:type", typeof (_a = typeof alert_type_enum_1.AlertType !== "undefined" && alert_type_enum_1.AlertType) === "function" ? _a : Object)
], AlertEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: alert_type_enum_1.AlertSeverity }),
    __metadata("design:type", typeof (_b = typeof alert_type_enum_1.AlertSeverity !== "undefined" && alert_type_enum_1.AlertSeverity) === "function" ? _b : Object)
], AlertEntity.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AlertEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AlertEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AlertEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], AlertEntity.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AlertEntity.prototype, "isAcknowledged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AlertEntity.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AlertEntity.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], AlertEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], AlertEntity.prototype, "updatedAt", void 0);
exports.AlertEntity = AlertEntity = __decorate([
    (0, typeorm_1.Entity)('alerts'),
    (0, typeorm_1.Index)(['vehicleId']),
    (0, typeorm_1.Index)(['organizationId']),
    (0, typeorm_1.Index)(['createdAt'])
], AlertEntity);


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertSeverity = exports.AlertType = void 0;
var AlertType;
(function (AlertType) {
    AlertType["GEOFENCE_ENTRY"] = "GEOFENCE_ENTRY";
    AlertType["GEOFENCE_EXIT"] = "GEOFENCE_EXIT";
    AlertType["OVERSPEED"] = "OVERSPEED";
    AlertType["LOW_BATTERY"] = "LOW_BATTERY";
    AlertType["DEVICE_OFFLINE"] = "DEVICE_OFFLINE";
    AlertType["MAINTENANCE"] = "MAINTENANCE";
    AlertType["CUSTOM"] = "CUSTOM";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["CRITICAL"] = "CRITICAL";
    AlertSeverity["HIGH"] = "HIGH";
    AlertSeverity["MEDIUM"] = "MEDIUM";
    AlertSeverity["LOW"] = "LOW";
    AlertSeverity["INFO"] = "INFO";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertRuleEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const alert_type_enum_1 = __webpack_require__(29);
let AlertRuleEntity = class AlertRuleEntity {
};
exports.AlertRuleEntity = AlertRuleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AlertRuleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AlertRuleEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: alert_type_enum_1.AlertType }),
    __metadata("design:type", typeof (_a = typeof alert_type_enum_1.AlertType !== "undefined" && alert_type_enum_1.AlertType) === "function" ? _a : Object)
], AlertRuleEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], AlertRuleEntity.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AlertRuleEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AlertRuleEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], AlertRuleEntity.prototype, "notificationChannels", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AlertRuleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], AlertRuleEntity.prototype, "updatedAt", void 0);
exports.AlertRuleEntity = AlertRuleEntity = __decorate([
    (0, typeorm_1.Entity)('alert_rules'),
    (0, typeorm_1.Index)(['organizationId'])
], AlertRuleEntity);


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const jwt_1 = __webpack_require__(32);
const passport_1 = __webpack_require__(33);
const config_1 = __webpack_require__(10);
const auth_service_1 = __webpack_require__(34);
const auth_controller_1 = __webpack_require__(36);
const jwt_strategy_1 = __webpack_require__(44);
const user_entity_1 = __webpack_require__(17);
const organization_entity_1 = __webpack_require__(20);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity, organization_entity_1.OrganizationEntity]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: configService.get('JWT_EXPIRATION', 3600) + 's' },
                }),
            }),
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule, passport_1.PassportModule],
    })
], AuthModule);


/***/ }),
/* 32 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 33 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 34 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const jwt_1 = __webpack_require__(32);
const config_1 = __webpack_require__(10);
const bcrypt = __importStar(__webpack_require__(35));
const user_entity_1 = __webpack_require__(17);
const organization_entity_1 = __webpack_require__(20);
const role_enum_1 = __webpack_require__(19);
let AuthService = class AuthService {
    constructor(usersRepository, organizationsRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.organizationsRepository = organizationsRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const user = await this.usersRepository.findOne({
            where: { email: loginDto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        // Update last login
        await this.usersRepository.update(user.id, { lastLogin: new Date() });
        return this.generateTokens(user);
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already registered');
        }
        // Create organization
        const slug = registerDto.organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const organization = this.organizationsRepository.create({
            name: registerDto.organizationName,
            slug: slug + '-' + Date.now().toString(36),
            isActive: true,
        });
        const savedOrg = await this.organizationsRepository.save(organization);
        // Create user
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = this.usersRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: role_enum_1.Role.ADMIN,
            organizationId: savedOrg.id,
            isActive: true,
        });
        const savedUser = await this.usersRepository.save(user);
        return this.generateTokens(savedUser);
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        };
        const expiresIn = this.configService.get('JWT_EXPIRATION');
        const accessToken = this.jwtService.sign(payload, { expiresIn });
        return {
            accessToken,
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                organizationId: user.organizationId,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.OrganizationEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], AuthService);


/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 36 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(34);
const login_dto_1 = __webpack_require__(37);
const register_dto_1 = __webpack_require__(39);
const auth_response_dto_1 = __webpack_require__(40);
const jwt_auth_guard_1 = __webpack_require__(41);
const current_user_decorator_1 = __webpack_require__(42);
const user_payload_interface_1 = __webpack_require__(43);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async getMe(user) {
        return {
            id: user.userId,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        };
    }
    async logout() {
        return { message: 'Logged out successfully' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof login_dto_1.LoginDto !== "undefined" && login_dto_1.LoginDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof register_dto_1.RegisterDto !== "undefined" && register_dto_1.RegisterDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user info' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof user_payload_interface_1.UserPayload !== "undefined" && user_payload_interface_1.UserPayload) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Logout' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 37 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);


/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 39 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'my-org', description: 'Organization slug or name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "organizationName", void 0);


/***/ }),
/* 40 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthResponseDto = void 0;
const swagger_1 = __webpack_require__(2);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuthResponseDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "user", void 0);


/***/ }),
/* 41 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(33);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(3);
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (!data) {
        return request.user;
    }
    return request.user?.[data];
});


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 44 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(33);
const passport_jwt_1 = __webpack_require__(45);
const config_1 = __webpack_require__(10);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || '',
        });
        this.configService = configService;
    }
    async validate(payload) {
        if (!payload.userId || !payload.email || !payload.organizationId) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return payload;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 45 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 46 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const users_service_1 = __webpack_require__(47);
const users_controller_1 = __webpack_require__(48);
const user_entity_1 = __webpack_require__(17);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity])],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),
/* 47 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const bcrypt = __importStar(__webpack_require__(35));
const user_entity_1 = __webpack_require__(17);
const role_enum_1 = __webpack_require__(19);
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto, organizationId) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            password: hashedPassword,
            role: createUserDto.role || role_enum_1.Role.OPERATOR,
            organizationId,
            isActive: true,
        });
        const savedUser = await this.usersRepository.save(user);
        return this.sanitizeUser(savedUser);
    }
    async findAll(organizationId, paginationDto) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.usersRepository.findAndCount({
            where: { organizationId },
            order: { [sort]: order },
            skip,
            take: limit,
        });
        return {
            data: data.map((u) => this.sanitizeUser(u)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        };
    }
    async findById(id, organizationId) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.organizationId !== organizationId) {
            throw new common_1.ForbiddenException('Cannot access user from another organization');
        }
        return this.sanitizeUser(user);
    }
    async update(id, organizationId, updateUserDto) {
        const user = await this.findById(id, organizationId);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email already in use');
            }
        }
        await this.usersRepository.update(id, updateUserDto);
        const updated = await this.usersRepository.findOne({ where: { id } });
        return this.sanitizeUser(updated);
    }
    async remove(id, organizationId) {
        await this.findById(id, organizationId);
        await this.usersRepository.delete(id);
    }
    sanitizeUser(user) {
        const { password, ...rest } = user;
        return rest;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], UsersService);


/***/ }),
/* 48 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const users_service_1 = __webpack_require__(47);
const create_user_dto_1 = __webpack_require__(49);
const update_user_dto_1 = __webpack_require__(50);
const user_entity_1 = __webpack_require__(17);
const jwt_auth_guard_1 = __webpack_require__(41);
const tenant_guard_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
const pagination_dto_1 = __webpack_require__(54);
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(organizationId, createUserDto) {
        return this.usersService.create(createUserDto, organizationId);
    }
    async findAll(organizationId, paginationDto) {
        return this.usersService.findAll(organizationId, paginationDto);
    }
    async findOne(organizationId, id) {
        return this.usersService.findById(id, organizationId);
    }
    async update(organizationId, id, updateUserDto) {
        return this.usersService.update(id, organizationId, updateUserDto);
    }
    async remove(organizationId, id) {
        return this.usersService.remove(id, organizationId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: user_entity_1.UserEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'List users' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof pagination_dto_1.PaginationDto !== "undefined" && pagination_dto_1.PaginationDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_entity_1.UserEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_entity_1.UserEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_f = typeof update_user_dto_1.UpdateUserDto !== "undefined" && update_user_dto_1.UpdateUserDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('organizations/:organizationId/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),
/* 49 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const role_enum_1 = __webpack_require__(19);
class CreateUserDto {
    constructor() {
        this.role = role_enum_1.Role.OPERATOR;
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: role_enum_1.Role, default: role_enum_1.Role.OPERATOR }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    __metadata("design:type", typeof (_a = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _a : Object)
], CreateUserDto.prototype, "role", void 0);


/***/ }),
/* 50 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateUserDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const role_enum_1 = __webpack_require__(19);
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: role_enum_1.Role }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    __metadata("design:type", typeof (_a = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _a : Object)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);


/***/ }),
/* 51 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantGuard = void 0;
const common_1 = __webpack_require__(3);
let TenantGuard = class TenantGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user || !user.organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        // Extract organizationId from request params or query
        const organizationIdParam = request.params.organizationId || request.query.organizationId;
        // If specific org is being accessed, verify user belongs to it
        if (organizationIdParam && organizationIdParam !== user.organizationId) {
            throw new common_1.ForbiddenException('Cannot access other organizations');
        }
        // Attach organization context to request
        request.organizationId = user.organizationId;
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)()
], TenantGuard);


/***/ }),
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(3);
const core_1 = __webpack_require__(1);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        // SUPER_ADMIN bypasses all role checks
        if (user.role === role_enum_1.Role.SUPER_ADMIN) {
            return true;
        }
        const hasRole = () => requiredRoles.some((role) => user.role === role);
        if (!hasRole()) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(3);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 54 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationDto = exports.SortOrder = void 0;
const class_validator_1 = __webpack_require__(38);
const class_transformer_1 = __webpack_require__(55);
const swagger_1 = __webpack_require__(2);
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
class PaginationDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.order = SortOrder.DESC;
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by field' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SortOrder, default: SortOrder.DESC }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], PaginationDto.prototype, "order", void 0);


/***/ }),
/* 55 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 56 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const organizations_service_1 = __webpack_require__(57);
const organizations_controller_1 = __webpack_require__(58);
const organization_entity_1 = __webpack_require__(20);
let OrganizationsModule = class OrganizationsModule {
};
exports.OrganizationsModule = OrganizationsModule;
exports.OrganizationsModule = OrganizationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([organization_entity_1.OrganizationEntity])],
        controllers: [organizations_controller_1.OrganizationsController],
        providers: [organizations_service_1.OrganizationsService],
        exports: [organizations_service_1.OrganizationsService],
    })
], OrganizationsModule);


/***/ }),
/* 57 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const organization_entity_1 = __webpack_require__(20);
let OrganizationsService = class OrganizationsService {
    constructor(organizationsRepository) {
        this.organizationsRepository = organizationsRepository;
    }
    async create(createDto) {
        const existing = await this.organizationsRepository.findOne({
            where: { slug: createDto.slug },
        });
        if (existing) {
            throw new common_1.BadRequestException('Organization with this slug already exists');
        }
        const org = this.organizationsRepository.create(createDto);
        return this.organizationsRepository.save(org);
    }
    async findAll() {
        return this.organizationsRepository.find({ order: { createdAt: 'DESC' } });
    }
    async findById(id) {
        const org = await this.organizationsRepository.findOne({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async update(id, updateDto) {
        const org = await this.findById(id);
        await this.organizationsRepository.update(id, updateDto);
        const result = await this.organizationsRepository.findOne({ where: { id } });
        return result;
    }
    async remove(id) {
        await this.findById(id);
        await this.organizationsRepository.delete(id);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.OrganizationEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], OrganizationsService);


/***/ }),
/* 58 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const organizations_service_1 = __webpack_require__(57);
const create_organization_dto_1 = __webpack_require__(59);
const update_organization_dto_1 = __webpack_require__(60);
const organization_entity_1 = __webpack_require__(20);
const jwt_auth_guard_1 = __webpack_require__(41);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
let OrganizationsController = class OrganizationsController {
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    async create(createOrgDto) {
        return this.organizationsService.create(createOrgDto);
    }
    async findAll() {
        return this.organizationsService.findAll();
    }
    async findOne(id) {
        return this.organizationsService.findById(id);
    }
    async update(id, updateOrgDto) {
        return this.organizationsService.update(id, updateOrgDto);
    }
    async remove(id) {
        return this.organizationsService.remove(id);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create organization' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: organization_entity_1.OrganizationEntity }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_organization_dto_1.CreateOrganizationDto !== "undefined" && create_organization_dto_1.CreateOrganizationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List all organizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_entity_1.OrganizationEntity }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_entity_1.OrganizationEntity }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof update_organization_dto_1.UpdateOrganizationDto !== "undefined" && update_organization_dto_1.UpdateOrganizationDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete organization' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], OrganizationsController.prototype, "remove", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('organizations'),
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _a : Object])
], OrganizationsController);


/***/ }),
/* 59 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateOrganizationDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class CreateOrganizationDto {
}
exports.CreateOrganizationDto = CreateOrganizationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'slug must contain only lowercase letters, numbers, and hyphens' }),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateOrganizationDto.prototype, "settings", void 0);


/***/ }),
/* 60 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateOrganizationDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class UpdateOrganizationDto {
}
exports.UpdateOrganizationDto = UpdateOrganizationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrganizationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], UpdateOrganizationDto.prototype, "settings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateOrganizationDto.prototype, "isActive", void 0);


/***/ }),
/* 61 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const vehicles_service_1 = __webpack_require__(62);
const vehicles_controller_1 = __webpack_require__(63);
const vehicle_entity_1 = __webpack_require__(21);
const vehicle_group_entity_1 = __webpack_require__(23);
let VehiclesModule = class VehiclesModule {
};
exports.VehiclesModule = VehiclesModule;
exports.VehiclesModule = VehiclesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vehicle_entity_1.VehicleEntity, vehicle_group_entity_1.VehicleGroupEntity])],
        controllers: [vehicles_controller_1.VehiclesController],
        providers: [vehicles_service_1.VehiclesService],
        exports: [vehicles_service_1.VehiclesService],
    })
], VehiclesModule);


/***/ }),
/* 62 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const vehicle_entity_1 = __webpack_require__(21);
const vehicle_group_entity_1 = __webpack_require__(23);
let VehiclesService = class VehiclesService {
    constructor(vehiclesRepository, vehicleGroupsRepository) {
        this.vehiclesRepository = vehiclesRepository;
        this.vehicleGroupsRepository = vehicleGroupsRepository;
    }
    async create(createDto, organizationId) {
        const existing = await this.vehiclesRepository.findOne({
            where: { plate: createDto.plate, organizationId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Vehicle with this plate already exists in your organization');
        }
        const vehicle = this.vehiclesRepository.create({
            ...createDto,
            organizationId,
        });
        return this.vehiclesRepository.save(vehicle);
    }
    async findAll(organizationId, paginationDto) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.vehiclesRepository.findAndCount({
            where: { organizationId },
            order: { [sort]: order },
            skip,
            take: limit,
        });
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        };
    }
    async findById(id, organizationId) {
        const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        if (vehicle.organizationId !== organizationId) {
            throw new common_1.ForbiddenException('Cannot access vehicle from another organization');
        }
        return vehicle;
    }
    async update(id, organizationId, updateDto) {
        await this.findById(id, organizationId);
        await this.vehiclesRepository.update(id, updateDto);
        const result = await this.vehiclesRepository.findOne({ where: { id } });
        return result;
    }
    async updatePosition(id, lat, lng, speed, heading) {
        await this.vehiclesRepository.update(id, {
            currentLat: lat,
            currentLng: lng,
            currentSpeed: speed || 0,
            currentHeading: heading,
            lastCommunication: new Date(),
        });
        const result = await this.vehiclesRepository.findOne({ where: { id } });
        return result;
    }
    async remove(id, organizationId) {
        await this.findById(id, organizationId);
        await this.vehiclesRepository.delete(id);
    }
    // Vehicle Groups
    async createGroup(name, organizationId, parentGroupId) {
        const group = this.vehicleGroupsRepository.create({
            name,
            organizationId,
            parentGroupId,
        });
        return this.vehicleGroupsRepository.save(group);
    }
    async findAllGroups(organizationId) {
        return this.vehicleGroupsRepository.find({
            where: { organizationId },
            order: { name: 'ASC' },
        });
    }
    async findGroupById(id, organizationId) {
        const group = await this.vehicleGroupsRepository.findOne({ where: { id } });
        if (!group || group.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Vehicle group not found');
        }
        return group;
    }
    async removeGroup(id, organizationId) {
        await this.findGroupById(id, organizationId);
        await this.vehicleGroupsRepository.delete(id);
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_group_entity_1.VehicleGroupEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], VehiclesService);


/***/ }),
/* 63 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const vehicles_service_1 = __webpack_require__(62);
const create_vehicle_dto_1 = __webpack_require__(64);
const update_vehicle_dto_1 = __webpack_require__(65);
const vehicle_entity_1 = __webpack_require__(21);
const jwt_auth_guard_1 = __webpack_require__(41);
const tenant_guard_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
const pagination_dto_1 = __webpack_require__(54);
let VehiclesController = class VehiclesController {
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    async create(organizationId, createVehicleDto) {
        return this.vehiclesService.create(createVehicleDto, organizationId);
    }
    async findAll(organizationId, paginationDto) {
        return this.vehiclesService.findAll(organizationId, paginationDto);
    }
    async findOne(organizationId, id) {
        return this.vehiclesService.findById(id, organizationId);
    }
    async getCurrentPosition(organizationId, id) {
        const vehicle = await this.vehiclesService.findById(id, organizationId);
        return {
            lat: vehicle.currentLat,
            lng: vehicle.currentLng,
            speed: vehicle.currentSpeed,
            heading: vehicle.currentHeading,
            timestamp: vehicle.lastCommunication,
        };
    }
    async update(organizationId, id, updateVehicleDto) {
        return this.vehiclesService.update(id, organizationId, updateVehicleDto);
    }
    async remove(organizationId, id) {
        return this.vehiclesService.remove(id, organizationId);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create vehicle' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: vehicle_entity_1.VehicleEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof create_vehicle_dto_1.CreateVehicleDto !== "undefined" && create_vehicle_dto_1.CreateVehicleDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'List vehicles' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof pagination_dto_1.PaginationDto !== "undefined" && pagination_dto_1.PaginationDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: vehicle_entity_1.VehicleEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/position'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get current vehicle position' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], VehiclesController.prototype, "getCurrentPosition", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update vehicle' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: vehicle_entity_1.VehicleEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_g = typeof update_vehicle_dto_1.UpdateVehicleDto !== "undefined" && update_vehicle_dto_1.UpdateVehicleDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete vehicle' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('vehicles'),
    (0, common_1.Controller)('organizations/:organizationId/vehicles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof vehicles_service_1.VehiclesService !== "undefined" && vehicles_service_1.VehiclesService) === "function" ? _a : Object])
], VehiclesController);


/***/ }),
/* 64 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateVehicleDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const vehicle_status_enum_1 = __webpack_require__(22);
class CreateVehicleDto {
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "deviceImei", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: vehicle_status_enum_1.VehicleStatus, default: vehicle_status_enum_1.VehicleStatus.ACTIVE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vehicle_status_enum_1.VehicleStatus),
    __metadata("design:type", typeof (_a = typeof vehicle_status_enum_1.VehicleStatus !== "undefined" && vehicle_status_enum_1.VehicleStatus) === "function" ? _a : Object)
], CreateVehicleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Provider-specific metadata (flespiChannelId, keeptraceId, echoesUid, etc.)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateVehicleDto.prototype, "metadata", void 0);


/***/ }),
/* 65 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateVehicleDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const vehicle_status_enum_1 = __webpack_require__(22);
class UpdateVehicleDto {
}
exports.UpdateVehicleDto = UpdateVehicleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: vehicle_status_enum_1.VehicleStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vehicle_status_enum_1.VehicleStatus),
    __metadata("design:type", typeof (_a = typeof vehicle_status_enum_1.VehicleStatus !== "undefined" && vehicle_status_enum_1.VehicleStatus) === "function" ? _a : Object)
], UpdateVehicleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], UpdateVehicleDto.prototype, "metadata", void 0);


/***/ }),
/* 66 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const gps_history_service_1 = __webpack_require__(67);
const gps_history_controller_1 = __webpack_require__(68);
const gps_history_entity_1 = __webpack_require__(24);
let GpsHistoryModule = class GpsHistoryModule {
};
exports.GpsHistoryModule = GpsHistoryModule;
exports.GpsHistoryModule = GpsHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([gps_history_entity_1.GpsHistoryEntity])],
        controllers: [gps_history_controller_1.GpsHistoryController],
        providers: [gps_history_service_1.GpsHistoryService],
        exports: [gps_history_service_1.GpsHistoryService],
    })
], GpsHistoryModule);


/***/ }),
/* 67 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const gps_history_entity_1 = __webpack_require__(24);
let GpsHistoryService = class GpsHistoryService {
    constructor(gpsHistoryRepository) {
        this.gpsHistoryRepository = gpsHistoryRepository;
    }
    async recordPosition(data) {
        const record = this.gpsHistoryRepository.create(data);
        return this.gpsHistoryRepository.save(record);
    }
    async getHistory(vehicleId, startDate, endDate, page = 1, limit = 100, interval) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.gpsHistoryRepository.findAndCount({
            where: {
                vehicleId,
                createdAt: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
            },
            order: { createdAt: 'ASC' },
            skip,
            take: limit,
        });
        if (interval && interval > 0 && data.length > 0) {
            return { data: this.applyIntervalSampling(data, interval), total };
        }
        return { data, total };
    }
    applyIntervalSampling(records, intervalSeconds) {
        if (records.length === 0)
            return records;
        const sampled = [records[0]];
        let lastTime = new Date(records[0].createdAt).getTime();
        const intervalMs = intervalSeconds * 1000;
        for (let i = 1; i < records.length; i++) {
            const currentTime = new Date(records[i].createdAt).getTime();
            if (currentTime - lastTime >= intervalMs) {
                sampled.push(records[i]);
                lastTime = currentTime;
            }
        }
        return sampled;
    }
};
exports.GpsHistoryService = GpsHistoryService;
exports.GpsHistoryService = GpsHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gps_history_entity_1.GpsHistoryEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], GpsHistoryService);


/***/ }),
/* 68 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const gps_history_service_1 = __webpack_require__(67);
const query_history_dto_1 = __webpack_require__(69);
const jwt_auth_guard_1 = __webpack_require__(41);
const tenant_guard_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
let GpsHistoryController = class GpsHistoryController {
    constructor(gpsHistoryService) {
        this.gpsHistoryService = gpsHistoryService;
    }
    async getHistory(organizationId, query) {
        return this.gpsHistoryService.getHistory(query.vehicleId, query.startDate, query.endDate, query.page, query.limit, query.interval);
    }
    async getPlaybackData(organizationId, vehicleId, query) {
        const result = await this.gpsHistoryService.getHistory(vehicleId, query.startDate, query.endDate, query.page, query.limit, query.interval);
        return {
            vehicleId,
            data: result.data,
            total: result.total,
        };
    }
};
exports.GpsHistoryController = GpsHistoryController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Query GPS history by vehicle and date range' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof query_history_dto_1.QueryHistoryDto !== "undefined" && query_history_dto_1.QueryHistoryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], GpsHistoryController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':vehicleId/playback'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get playback data for vehicle' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_c = typeof query_history_dto_1.QueryHistoryDto !== "undefined" && query_history_dto_1.QueryHistoryDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], GpsHistoryController.prototype, "getPlaybackData", null);
exports.GpsHistoryController = GpsHistoryController = __decorate([
    (0, swagger_1.ApiTags)('gps-history'),
    (0, common_1.Controller)('organizations/:organizationId/gps-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof gps_history_service_1.GpsHistoryService !== "undefined" && gps_history_service_1.GpsHistoryService) === "function" ? _a : Object])
], GpsHistoryController);


/***/ }),
/* 69 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryHistoryDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(55);
class QueryHistoryDto {
    constructor() {
        this.page = 1;
        this.limit = 100;
    }
}
exports.QueryHistoryDto = QueryHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryHistoryDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date (ISO 8601)' }),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], QueryHistoryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date (ISO 8601)' }),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], QueryHistoryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interval in seconds to aggregate data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryHistoryDto.prototype, "interval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryHistoryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryHistoryDto.prototype, "limit", void 0);


/***/ }),
/* 70 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const geofences_service_1 = __webpack_require__(71);
const geofences_controller_1 = __webpack_require__(72);
const geofence_entity_1 = __webpack_require__(26);
const vehicle_geofence_entity_1 = __webpack_require__(27);
let GeofencesModule = class GeofencesModule {
};
exports.GeofencesModule = GeofencesModule;
exports.GeofencesModule = GeofencesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([geofence_entity_1.GeofenceEntity, vehicle_geofence_entity_1.VehicleGeofenceEntity])],
        controllers: [geofences_controller_1.GeofencesController],
        providers: [geofences_service_1.GeofencesService],
        exports: [geofences_service_1.GeofencesService],
    })
], GeofencesModule);


/***/ }),
/* 71 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const geofence_entity_1 = __webpack_require__(26);
const vehicle_geofence_entity_1 = __webpack_require__(27);
let GeofencesService = class GeofencesService {
    constructor(geofencesRepository, vehicleGeofencesRepository) {
        this.geofencesRepository = geofencesRepository;
        this.vehicleGeofencesRepository = vehicleGeofencesRepository;
    }
    async create(createDto, organizationId) {
        const { center, radius, coordinates, ...rest } = createDto;
        // Build PostGIS geometry from input
        let geometrySql;
        const params = [];
        if (createDto.type === 'CIRCLE' && center) {
            // For circles, store as a Point geometry + radius column
            geometrySql = `ST_SetSRID(ST_MakePoint($1, $2), 4326)`;
            params.push(center.lng, center.lat);
        }
        else if ((createDto.type === 'POLYGON' || createDto.type === 'RECTANGLE') && coordinates && coordinates.length >= 3) {
            // Build polygon from coordinate array
            const coordStr = coordinates
                .map((c) => `${c.lng} ${c.lat}`)
                .join(', ');
            // Close the ring
            const firstCoord = coordinates[0];
            geometrySql = `ST_SetSRID(ST_GeomFromText('POLYGON((${coordStr}, ${firstCoord.lng} ${firstCoord.lat}))'), 4326)`;
        }
        else {
            // Store NULL geometry if no valid input
            geometrySql = 'NULL';
        }
        // Use raw query for PostGIS geometry insertion
        const result = await this.geofencesRepository.query(`INSERT INTO geofences (name, description, type, geometry, radius, color, organization_id, is_active, schedule, priority)
       VALUES ($${params.length + 1}, $${params.length + 2}, $${params.length + 3}, ${geometrySql}, $${params.length + 4}, $${params.length + 5}, $${params.length + 6}, $${params.length + 7}, $${params.length + 8}, $${params.length + 9})
       RETURNING id, name, description, type, radius, color, organization_id as "organizationId", is_active as "isActive", schedule, priority, created_at as "createdAt", updated_at as "updatedAt"`, [
            ...params,
            rest.name,
            rest.description || null,
            rest.type,
            radius || null,
            rest.color || null,
            organizationId,
            rest.isActive !== undefined ? rest.isActive : true,
            rest.schedule ? JSON.stringify(rest.schedule) : null,
            rest.priority || 0,
        ]);
        return result[0];
    }
    async findAll(organizationId, paginationDto) {
        const { page = 1, limit = 20, order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        // Use raw query to convert PostGIS geometry to GeoJSON for the response
        const [data, countResult] = await Promise.all([
            this.geofencesRepository.query(`SELECT id, name, description, type,
                ST_AsGeoJSON(geometry)::jsonb as geometry,
                radius, color, organization_id as "organizationId",
                is_active as "isActive", schedule, priority,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM geofences
         WHERE organization_id = $1
         ORDER BY created_at ${order === 'ASC' ? 'ASC' : 'DESC'}
         LIMIT $2 OFFSET $3`, [organizationId, limit, skip]),
            this.geofencesRepository.query(`SELECT COUNT(*) as total FROM geofences WHERE organization_id = $1`, [organizationId]),
        ]);
        const total = parseInt(countResult[0]?.total || '0', 10);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        };
    }
    async findById(id, organizationId) {
        const results = await this.geofencesRepository.query(`SELECT id, name, description, type,
              ST_AsGeoJSON(geometry)::jsonb as geometry,
              radius, color, organization_id as "organizationId",
              is_active as "isActive", schedule, priority,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM geofences WHERE id = $1`, [id]);
        if (!results || results.length === 0) {
            throw new common_1.NotFoundException('Geofence not found');
        }
        const geofence = results[0];
        if (geofence.organizationId !== organizationId) {
            throw new common_1.ForbiddenException('Cannot access geofence from another organization');
        }
        return geofence;
    }
    async update(id, organizationId, updateDto) {
        await this.findById(id, organizationId);
        const setClauses = [];
        const params = [id];
        let paramIndex = 2;
        if (updateDto.name !== undefined) {
            setClauses.push(`name = $${paramIndex++}`);
            params.push(updateDto.name);
        }
        if (updateDto.description !== undefined) {
            setClauses.push(`description = $${paramIndex++}`);
            params.push(updateDto.description);
        }
        if (updateDto.type !== undefined) {
            setClauses.push(`type = $${paramIndex++}`);
            params.push(updateDto.type);
        }
        if (updateDto.color !== undefined) {
            setClauses.push(`color = $${paramIndex++}`);
            params.push(updateDto.color);
        }
        if (updateDto.isActive !== undefined) {
            setClauses.push(`is_active = $${paramIndex++}`);
            params.push(updateDto.isActive);
        }
        if (updateDto.schedule !== undefined) {
            setClauses.push(`schedule = $${paramIndex++}`);
            params.push(JSON.stringify(updateDto.schedule));
        }
        setClauses.push('updated_at = NOW()');
        if (setClauses.length > 1) {
            await this.geofencesRepository.query(`UPDATE geofences SET ${setClauses.join(', ')} WHERE id = $1`, params);
        }
        return this.findById(id, organizationId);
    }
    async remove(id, organizationId) {
        await this.findById(id, organizationId);
        await this.vehicleGeofencesRepository.delete({ geofenceId: id });
        await this.geofencesRepository.delete(id);
    }
    async assignToVehicle(geofenceId, vehicleId, alertOnEntry = true, alertOnExit = true) {
        const existing = await this.vehicleGeofencesRepository.findOne({
            where: { geofenceId, vehicleId },
        });
        if (existing) {
            await this.vehicleGeofencesRepository.update(existing.id, { alertOnEntry, alertOnExit });
            const result = await this.vehicleGeofencesRepository.findOne({ where: { id: existing.id } });
            return result;
        }
        const vg = this.vehicleGeofencesRepository.create({
            geofenceId,
            vehicleId,
            alertOnEntry,
            alertOnExit,
        });
        return this.vehicleGeofencesRepository.save(vg);
    }
    /**
     * Check which active geofences contain the given point.
     * Uses PostGIS ST_DWithin for circles and ST_Contains for polygons.
     */
    async checkContainment(lat, lng, organizationId) {
        const results = await this.geofencesRepository.query(`SELECT id, name, description, type,
              ST_AsGeoJSON(geometry)::jsonb as geometry,
              radius, color, organization_id as "organizationId",
              is_active as "isActive", priority,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM geofences
       WHERE organization_id = $1
         AND is_active = true
         AND (
           (type = 'CIRCLE' AND ST_DWithin(
             geometry::geography,
             ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
             COALESCE(radius, 0)
           ))
           OR
           (type IN ('POLYGON', 'RECTANGLE') AND ST_Contains(
             geometry,
             ST_SetSRID(ST_MakePoint($2, $3), 4326)
           ))
         )`, [organizationId, lng, lat]);
        return results;
    }
};
exports.GeofencesService = GeofencesService;
exports.GeofencesService = GeofencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(geofence_entity_1.GeofenceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_geofence_entity_1.VehicleGeofenceEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], GeofencesService);


/***/ }),
/* 72 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const geofences_service_1 = __webpack_require__(71);
const create_geofence_dto_1 = __webpack_require__(73);
const update_geofence_dto_1 = __webpack_require__(74);
const geofence_entity_1 = __webpack_require__(26);
const jwt_auth_guard_1 = __webpack_require__(41);
const tenant_guard_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
const pagination_dto_1 = __webpack_require__(54);
let GeofencesController = class GeofencesController {
    constructor(geofencesService) {
        this.geofencesService = geofencesService;
    }
    async create(organizationId, createGeofenceDto) {
        return this.geofencesService.create(createGeofenceDto, organizationId);
    }
    async findAll(organizationId, paginationDto) {
        return this.geofencesService.findAll(organizationId, paginationDto);
    }
    async findOne(organizationId, id) {
        return this.geofencesService.findById(id, organizationId);
    }
    async update(organizationId, id, updateGeofenceDto) {
        return this.geofencesService.update(id, organizationId, updateGeofenceDto);
    }
    async remove(organizationId, id) {
        return this.geofencesService.remove(id, organizationId);
    }
    async assignToVehicle(organizationId, geofenceId, vehicleId) {
        return this.geofencesService.assignToVehicle(geofenceId, vehicleId);
    }
};
exports.GeofencesController = GeofencesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create geofence' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: geofence_entity_1.GeofenceEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof create_geofence_dto_1.CreateGeofenceDto !== "undefined" && create_geofence_dto_1.CreateGeofenceDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], GeofencesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'List geofences' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof pagination_dto_1.PaginationDto !== "undefined" && pagination_dto_1.PaginationDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], GeofencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get geofence by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: geofence_entity_1.GeofenceEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], GeofencesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update geofence' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: geofence_entity_1.GeofenceEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_f = typeof update_geofence_dto_1.UpdateGeofenceDto !== "undefined" && update_geofence_dto_1.UpdateGeofenceDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], GeofencesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete geofence' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], GeofencesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign-vehicle/:vehicleId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Assign geofence to vehicle' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], GeofencesController.prototype, "assignToVehicle", null);
exports.GeofencesController = GeofencesController = __decorate([
    (0, swagger_1.ApiTags)('geofences'),
    (0, common_1.Controller)('organizations/:organizationId/geofences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof geofences_service_1.GeofencesService !== "undefined" && geofences_service_1.GeofencesService) === "function" ? _a : Object])
], GeofencesController);


/***/ }),
/* 73 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateGeofenceDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class CreateGeofenceDto {
}
exports.CreateGeofenceDto = CreateGeofenceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGeofenceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGeofenceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['CIRCLE', 'POLYGON', 'RECTANGLE'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGeofenceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Center point for circle geofences: { lat, lng }' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateGeofenceDto.prototype, "center", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Radius in meters for circle geofences' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGeofenceDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of {lat, lng} points for polygon geofences' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGeofenceDto.prototype, "coordinates", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGeofenceDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateGeofenceDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateGeofenceDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGeofenceDto.prototype, "priority", void 0);


/***/ }),
/* 74 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateGeofenceDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class UpdateGeofenceDto {
}
exports.UpdateGeofenceDto = UpdateGeofenceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGeofenceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGeofenceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['CIRCLE', 'POLYGON', 'RECTANGLE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGeofenceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGeofenceDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateGeofenceDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], UpdateGeofenceDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateGeofenceDto.prototype, "priority", void 0);


/***/ }),
/* 75 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const alerts_service_1 = __webpack_require__(76);
const alerts_controller_1 = __webpack_require__(77);
const alert_entity_1 = __webpack_require__(28);
const alert_rule_entity_1 = __webpack_require__(30);
let AlertsModule = class AlertsModule {
};
exports.AlertsModule = AlertsModule;
exports.AlertsModule = AlertsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([alert_entity_1.AlertEntity, alert_rule_entity_1.AlertRuleEntity])],
        controllers: [alerts_controller_1.AlertsController],
        providers: [alerts_service_1.AlertsService],
        exports: [alerts_service_1.AlertsService],
    })
], AlertsModule);


/***/ }),
/* 76 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const alert_entity_1 = __webpack_require__(28);
const alert_rule_entity_1 = __webpack_require__(30);
let AlertsService = class AlertsService {
    constructor(alertsRepository, alertRulesRepository) {
        this.alertsRepository = alertsRepository;
        this.alertRulesRepository = alertRulesRepository;
    }
    async createAlert(data) {
        const alert = this.alertsRepository.create(data);
        return this.alertsRepository.save(alert);
    }
    async getAlerts(organizationId, filters, paginationDto) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        const where = { organizationId };
        if (filters.vehicleId)
            where.vehicleId = filters.vehicleId;
        if (filters.type)
            where.type = filters.type;
        if (filters.severity)
            where.severity = filters.severity;
        if (filters.isAcknowledged !== undefined)
            where.isAcknowledged = filters.isAcknowledged;
        const [data, total] = await this.alertsRepository.findAndCount({
            where,
            order: { [sort]: order },
            skip,
            take: limit,
        });
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        };
    }
    async acknowledgeAlert(id, userId) {
        const alert = await this.alertsRepository.findOne({ where: { id } });
        if (!alert)
            throw new common_1.NotFoundException('Alert not found');
        await this.alertsRepository.update(id, {
            isAcknowledged: true,
            acknowledgedBy: userId,
            acknowledgedAt: new Date(),
        });
        const result = await this.alertsRepository.findOne({ where: { id } });
        return result;
    }
    async acknowledgeMultiple(ids, userId) {
        await this.alertsRepository
            .createQueryBuilder()
            .update()
            .set({
            isAcknowledged: true,
            acknowledgedBy: userId,
            acknowledgedAt: new Date(),
        })
            .whereInIds(ids)
            .execute();
    }
    // Alert Rules
    async createAlertRule(data, organizationId) {
        const rule = this.alertRulesRepository.create({
            ...data,
            organizationId,
        });
        return this.alertRulesRepository.save(rule);
    }
    async getAlertRules(organizationId) {
        return this.alertRulesRepository.find({
            where: { organizationId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateAlertRule(id, data) {
        const rule = await this.alertRulesRepository.findOne({ where: { id } });
        if (!rule)
            throw new common_1.NotFoundException('Alert rule not found');
        await this.alertRulesRepository.update(id, data);
        const result = await this.alertRulesRepository.findOne({ where: { id } });
        return result;
    }
    async deleteAlertRule(id) {
        const rule = await this.alertRulesRepository.findOne({ where: { id } });
        if (!rule)
            throw new common_1.NotFoundException('Alert rule not found');
        await this.alertRulesRepository.delete(id);
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alert_entity_1.AlertEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(alert_rule_entity_1.AlertRuleEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], AlertsService);


/***/ }),
/* 77 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const alerts_service_1 = __webpack_require__(76);
const alert_entity_1 = __webpack_require__(28);
const alert_rule_entity_1 = __webpack_require__(30);
const create_alert_rule_dto_1 = __webpack_require__(78);
const query_alerts_dto_1 = __webpack_require__(79);
const jwt_auth_guard_1 = __webpack_require__(41);
const tenant_guard_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const current_user_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(19);
const user_payload_interface_1 = __webpack_require__(43);
let AlertsController = class AlertsController {
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    async getAlerts(organizationId, query) {
        const { vehicleId, type, severity, isAcknowledged, ...pagination } = query;
        const filters = { vehicleId, type, severity, isAcknowledged };
        return this.alertsService.getAlerts(organizationId, filters, pagination);
    }
    async acknowledgeAlert(organizationId, id, user) {
        return this.alertsService.acknowledgeAlert(id, user.userId);
    }
    async acknowledgeMultiple(organizationId, body, user) {
        return this.alertsService.acknowledgeMultiple(body.ids, user.userId);
    }
    async createRule(organizationId, createRuleDto) {
        return this.alertsService.createAlertRule(createRuleDto, organizationId);
    }
    async getRules(organizationId) {
        return this.alertsService.getAlertRules(organizationId);
    }
    async updateRule(organizationId, ruleId, updates) {
        return this.alertsService.updateAlertRule(ruleId, updates);
    }
    async deleteRule(organizationId, ruleId) {
        return this.alertsService.deleteAlertRule(ruleId);
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'List alerts' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof query_alerts_dto_1.QueryAlertsDto !== "undefined" && query_alerts_dto_1.QueryAlertsDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Patch)(':id/acknowledge'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge alert' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: alert_entity_1.AlertEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_c = typeof user_payload_interface_1.UserPayload !== "undefined" && user_payload_interface_1.UserPayload) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AlertsController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Post)('acknowledge-multiple'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge multiple alerts' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_e = typeof user_payload_interface_1.UserPayload !== "undefined" && user_payload_interface_1.UserPayload) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AlertsController.prototype, "acknowledgeMultiple", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create alert rule' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: alert_rule_entity_1.AlertRuleEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_g = typeof create_alert_rule_dto_1.CreateAlertRuleDto !== "undefined" && create_alert_rule_dto_1.CreateAlertRuleDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AlertsController.prototype, "createRule", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get alert rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AlertsController.prototype, "getRules", null);
__decorate([
    (0, common_1.Patch)('rules/:ruleId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update alert rule' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('ruleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_k = typeof Partial !== "undefined" && Partial) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AlertsController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:ruleId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete alert rule' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], AlertsController.prototype, "deleteRule", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)('alerts'),
    (0, common_1.Controller)('organizations/:organizationId/alerts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof alerts_service_1.AlertsService !== "undefined" && alerts_service_1.AlertsService) === "function" ? _a : Object])
], AlertsController);


/***/ }),
/* 78 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateAlertRuleDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const alert_type_enum_1 = __webpack_require__(29);
class CreateAlertRuleDto {
}
exports.CreateAlertRuleDto = CreateAlertRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: alert_type_enum_1.AlertType }),
    (0, class_validator_1.IsEnum)(alert_type_enum_1.AlertType),
    __metadata("design:type", typeof (_a = typeof alert_type_enum_1.AlertType !== "undefined" && alert_type_enum_1.AlertType) === "function" ? _a : Object)
], CreateAlertRuleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conditions for alert trigger' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateAlertRuleDto.prototype, "conditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAlertRuleDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], CreateAlertRuleDto.prototype, "notificationChannels", void 0);


/***/ }),
/* 79 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryAlertsDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(55);
const pagination_dto_1 = __webpack_require__(54);
const alert_type_enum_1 = __webpack_require__(29);
class QueryAlertsDto extends pagination_dto_1.PaginationDto {
}
exports.QueryAlertsDto = QueryAlertsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryAlertsDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: alert_type_enum_1.AlertType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(alert_type_enum_1.AlertType),
    __metadata("design:type", typeof (_a = typeof alert_type_enum_1.AlertType !== "undefined" && alert_type_enum_1.AlertType) === "function" ? _a : Object)
], QueryAlertsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: alert_type_enum_1.AlertSeverity }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(alert_type_enum_1.AlertSeverity),
    __metadata("design:type", typeof (_b = typeof alert_type_enum_1.AlertSeverity !== "undefined" && alert_type_enum_1.AlertSeverity) === "function" ? _b : Object)
], QueryAlertsDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryAlertsDto.prototype, "isAcknowledged", void 0);


/***/ }),
/* 80 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsModule = void 0;
const common_1 = __webpack_require__(3);
const reports_service_1 = __webpack_require__(81);
const reports_controller_1 = __webpack_require__(83);
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
        exports: [reports_service_1.ReportsService],
    })
], ReportsModule);


/***/ }),
/* 81 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsService = void 0;
const common_1 = __webpack_require__(3);
const generate_report_dto_1 = __webpack_require__(82);
let ReportsService = class ReportsService {
    async generateReport(organizationId, generateReportDto) {
        const { type, format, startDate, endDate, vehicleIds, includeGeofences, includeAlerts, includeMetrics } = generateReportDto;
        // Parse dates
        const start = startDate ? new Date(startDate) : this.getDefaultStartDate(type);
        const end = endDate ? new Date(endDate) : new Date();
        // Build report structure
        const report = {
            id: this.generateId(),
            organizationId,
            type,
            format,
            generatedAt: new Date(),
            period: {
                start,
                end,
            },
            summary: {
                totalVehicles: vehicleIds?.length || 0,
                distanceTraveled: 0,
                durationTracked: 0,
                averageSpeed: 0,
            },
            vehicles: [],
            geofenceSummary: null,
            alertsSummary: null,
            metrics: null,
        };
        // Add sections if requested
        if (includeGeofences) {
            report.geofenceSummary = {
                totalGeofences: 0,
                entries: 0,
                exits: 0,
            };
        }
        if (includeAlerts) {
            report.alertsSummary = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            };
        }
        if (includeMetrics) {
            report.metrics = {
                fuelConsumed: 0,
                maintenanceCost: 0,
                driverBehavior: {
                    harshBraking: 0,
                    speeding: 0,
                    hardAcceleration: 0,
                },
            };
        }
        return report;
    }
    getDefaultStartDate(type) {
        const now = new Date();
        switch (type) {
            case generate_report_dto_1.ReportType.DAILY:
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case generate_report_dto_1.ReportType.WEEKLY:
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                return weekStart;
            case generate_report_dto_1.ReportType.MONTHLY:
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case generate_report_dto_1.ReportType.CUSTOM:
            default:
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)()
], ReportsService);


/***/ }),
/* 82 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateReportDto = exports.ReportFormat = exports.ReportType = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
var ReportType;
(function (ReportType) {
    ReportType["DAILY"] = "DAILY";
    ReportType["WEEKLY"] = "WEEKLY";
    ReportType["MONTHLY"] = "MONTHLY";
    ReportType["CUSTOM"] = "CUSTOM";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "PDF";
    ReportFormat["CSV"] = "CSV";
    ReportFormat["JSON"] = "JSON";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
class GenerateReportDto {
    constructor() {
        this.format = ReportFormat.PDF;
    }
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ReportType }),
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ReportFormat, default: ReportFormat.PDF }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportFormat),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Vehicle IDs to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], GenerateReportDto.prototype, "vehicleIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include geofence summary' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GenerateReportDto.prototype, "includeGeofences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include alerts summary' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GenerateReportDto.prototype, "includeAlerts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include distance and fuel metrics' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GenerateReportDto.prototype, "includeMetrics", void 0);


/***/ }),
/* 83 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const reports_service_1 = __webpack_require__(81);
const generate_report_dto_1 = __webpack_require__(82);
const jwt_auth_guard_1 = __webpack_require__(41);
const tenant_guard_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async generateReport(organizationId, generateReportDto) {
        return this.reportsService.generateReport(organizationId, generateReportDto);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Generate report' }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof generate_report_dto_1.GenerateReportDto !== "undefined" && generate_report_dto_1.GenerateReportDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ReportsController.prototype, "generateReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('organizations/:organizationId/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof reports_service_1.ReportsService !== "undefined" && reports_service_1.ReportsService) === "function" ? _a : Object])
], ReportsController);


/***/ }),
/* 84 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsProvidersModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const schedule_1 = __webpack_require__(12);
const gps_providers_service_1 = __webpack_require__(85);
const gps_data_pipeline_service_1 = __webpack_require__(91);
const flespi_adapter_1 = __webpack_require__(86);
const echoes_adapter_1 = __webpack_require__(88);
const ubiwan_adapter_1 = __webpack_require__(89);
const keeptrace_adapter_1 = __webpack_require__(90);
const data_normalizer_service_1 = __webpack_require__(87);
const tracker_discovery_service_1 = __webpack_require__(95);
const gps_gateway_1 = __webpack_require__(92);
const vehicle_entity_1 = __webpack_require__(21);
const gps_history_entity_1 = __webpack_require__(24);
let GpsProvidersModule = class GpsProvidersModule {
};
exports.GpsProvidersModule = GpsProvidersModule;
exports.GpsProvidersModule = GpsProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([vehicle_entity_1.VehicleEntity, gps_history_entity_1.GpsHistoryEntity]),
        ],
        providers: [
            gps_providers_service_1.GpsProvidersService,
            gps_data_pipeline_service_1.GpsDataPipelineService,
            flespi_adapter_1.FlespiAdapter,
            echoes_adapter_1.EchoesAdapter,
            ubiwan_adapter_1.UbiwanAdapter,
            keeptrace_adapter_1.KeepTraceAdapter,
            data_normalizer_service_1.DataNormalizerService,
            tracker_discovery_service_1.TrackerDiscoveryService,
            gps_gateway_1.GpsGateway,
        ],
        exports: [
            gps_providers_service_1.GpsProvidersService,
            gps_data_pipeline_service_1.GpsDataPipelineService,
            data_normalizer_service_1.DataNormalizerService,
            flespi_adapter_1.FlespiAdapter,
            echoes_adapter_1.EchoesAdapter,
            ubiwan_adapter_1.UbiwanAdapter,
            keeptrace_adapter_1.KeepTraceAdapter,
        ],
    })
], GpsProvidersModule);


/***/ }),
/* 85 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GpsProvidersService_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsProvidersService = void 0;
const common_1 = __webpack_require__(3);
const flespi_adapter_1 = __webpack_require__(86);
const echoes_adapter_1 = __webpack_require__(88);
const ubiwan_adapter_1 = __webpack_require__(89);
const keeptrace_adapter_1 = __webpack_require__(90);
const data_normalizer_service_1 = __webpack_require__(87);
const gps_data_pipeline_service_1 = __webpack_require__(91);
let GpsProvidersService = GpsProvidersService_1 = class GpsProvidersService {
    constructor(flespiAdapter, echoesAdapter, ubiwanAdapter, keepTraceAdapter, normalizer, pipeline) {
        this.flespiAdapter = flespiAdapter;
        this.echoesAdapter = echoesAdapter;
        this.ubiwanAdapter = ubiwanAdapter;
        this.keepTraceAdapter = keepTraceAdapter;
        this.normalizer = normalizer;
        this.pipeline = pipeline;
        this.providers = new Map();
        this.logger = new common_1.Logger(GpsProvidersService_1.name);
        this.registerProviders();
    }
    registerProviders() {
        this.providers.set('FLESPI', this.flespiAdapter);
        this.providers.set('ECHOES', this.echoesAdapter);
        this.providers.set('UBIWAN', this.ubiwanAdapter);
        this.providers.set('KEEPTRACE', this.keepTraceAdapter);
    }
    /**
     * Wire all providers' onData callbacks to the data pipeline.
     * Called after module initialization.
     */
    async onModuleInit() {
        this.logger.log('Wiring GPS providers to data pipeline...');
        const dataHandler = async (data) => {
            try {
                await this.pipeline.processGpsData(data);
            }
            catch (error) {
                this.logger.error(`Pipeline error for ${data.provider}:`, error);
            }
        };
        // Wire each adapter's onData to the pipeline
        for (const [name, provider] of this.providers) {
            provider.onData(dataHandler);
            this.logger.log(`${name} adapter wired to data pipeline`);
        }
        this.logger.log(`${this.providers.size} GPS providers configured`);
    }
    async onModuleDestroy() {
        await this.shutdownProviders();
    }
    async shutdownProviders() {
        for (const [name, provider] of this.providers) {
            try {
                await provider.disconnect();
                this.logger.log(`${name} provider shut down`);
            }
            catch (error) {
                this.logger.error(`Failed to shutdown ${name} provider:`, error);
            }
        }
    }
    getProvider(name) {
        return this.providers.get(name.toUpperCase());
    }
    async getProvidersStatus() {
        const status = {};
        for (const [name, provider] of this.providers) {
            try {
                status[name] = await provider.getStatus();
            }
            catch (error) {
                status[name] = { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }
        status.pipeline = {
            cacheSize: this.pipeline.getCacheSize(),
        };
        return status;
    }
    getNormalizer() {
        return this.normalizer;
    }
};
exports.GpsProvidersService = GpsProvidersService;
exports.GpsProvidersService = GpsProvidersService = GpsProvidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof flespi_adapter_1.FlespiAdapter !== "undefined" && flespi_adapter_1.FlespiAdapter) === "function" ? _a : Object, typeof (_b = typeof echoes_adapter_1.EchoesAdapter !== "undefined" && echoes_adapter_1.EchoesAdapter) === "function" ? _b : Object, typeof (_c = typeof ubiwan_adapter_1.UbiwanAdapter !== "undefined" && ubiwan_adapter_1.UbiwanAdapter) === "function" ? _c : Object, typeof (_d = typeof keeptrace_adapter_1.KeepTraceAdapter !== "undefined" && keeptrace_adapter_1.KeepTraceAdapter) === "function" ? _d : Object, typeof (_e = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _e : Object, typeof (_f = typeof gps_data_pipeline_service_1.GpsDataPipelineService !== "undefined" && gps_data_pipeline_service_1.GpsDataPipelineService) === "function" ? _f : Object])
], GpsProvidersService);


/***/ }),
/* 86 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FlespiAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FlespiAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(87);
/**
 * Flespi GPS Adapter — HTTP REST polling mode
 *
 * Uses the Flespi REST API to poll device telemetry instead of MQTT,
 * since MQTT (port 8883) is blocked on many PaaS hosts (Railway, etc.)
 *
 * API: GET /gw/devices/all/telemetry/all
 * Auth: Header "Authorization: FlespiToken <token>"
 * Docs: https://flespi.io/docs/#/gw/devices
 */
let FlespiAdapter = FlespiAdapter_1 = class FlespiAdapter {
    constructor(configService, normalizer) {
        this.configService = configService;
        this.normalizer = normalizer;
        this.dataCallback = null;
        this.connected = false;
        this.lastUpdate = null;
        this.vehicleCount = 0;
        this.logger = new common_1.Logger(FlespiAdapter_1.name);
        this.apiUrl = 'https://flespi.io';
        this.token = this.configService.get('FLESPI_TOKEN') || '';
    }
    async onModuleInit() {
        if (this.token) {
            await this.connect();
        }
        else {
            this.logger.warn('Flespi token not configured, adapter disabled');
        }
    }
    async connect() {
        try {
            // Test connection by fetching account info
            const response = await fetch(`${this.apiUrl}/platform/customer`, {
                headers: this.getAuthHeaders(),
            });
            if (response.ok) {
                const data = (await response.json());
                const customer = data.result?.[0];
                this.connected = true;
                this.logger.log(`Flespi adapter connected (Account: ${customer?.name || 'unknown'}, CID: ${customer?.id || 'unknown'})`);
            }
            else {
                const body = await response.text();
                this.logger.error(`Flespi connection failed: ${response.status} - ${body.substring(0, 200)}`);
            }
        }
        catch (error) {
            this.logger.error('Flespi connection error:', error);
        }
    }
    async disconnect() {
        this.connected = false;
        this.logger.log('Flespi adapter disconnected');
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    getAuthHeaders() {
        return {
            'Authorization': `FlespiToken ${this.token}`,
            'Accept': 'application/json',
        };
    }
    /**
     * Poll Flespi REST API every 2 minutes
     * Fetches all devices with their latest telemetry
     */
    async pollFlespiApi() {
        if (!this.connected || !this.dataCallback)
            return;
        try {
            // Fetch all devices with their latest telemetry
            const response = await fetch(`${this.apiUrl}/gw/devices/all/telemetry/position`, { headers: this.getAuthHeaders() });
            if (!response.ok) {
                if (response.status === 401) {
                    this.logger.warn('Flespi token may be expired');
                    this.connected = false;
                }
                this.logger.error(`Flespi API error: ${response.status}`);
                return;
            }
            const data = (await response.json());
            const devices = data.result || [];
            let totalProcessed = 0;
            for (const device of devices) {
                try {
                    const normalized = this.normalizeFlespiData(device);
                    if (normalized && this.normalizer.validate(normalized)) {
                        this.dataCallback(normalized);
                        totalProcessed++;
                    }
                }
                catch (err) {
                    this.logger.warn(`Failed to normalize Flespi device ${device.id}: ${err}`);
                }
            }
            this.vehicleCount = totalProcessed;
            this.lastUpdate = new Date();
            this.logger.debug(`Flespi poll complete: ${totalProcessed} devices processed`);
        }
        catch (error) {
            this.logger.error('Flespi polling error:', error);
        }
    }
    /**
     * Normalize Flespi device telemetry to standard GPS format
     */
    normalizeFlespiData(device) {
        const telemetry = device.telemetry?.position?.value || device.telemetry || device;
        // Flespi puts timestamp at device.telemetry.position.ts (Unix seconds)
        const positionTs = device.telemetry?.position?.ts;
        const lat = telemetry.latitude || telemetry.lat;
        const lng = telemetry.longitude || telemetry.lng || telemetry.lon;
        if (!lat || !lng)
            return null;
        return {
            vehicleId: String(device.id || device.device_id),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            speed: parseFloat(telemetry.speed || 0),
            heading: parseFloat(telemetry.direction || telemetry.heading || telemetry.course || 0),
            altitude: telemetry.altitude ? parseFloat(telemetry.altitude) : undefined,
            timestamp: positionTs
                ? new Date(positionTs * 1000)
                : telemetry.timestamp
                    ? new Date(telemetry.timestamp * 1000)
                    : new Date(),
            provider: 'FLESPI',
            raw: device,
        };
    }
    async getStatus() {
        return {
            connected: this.connected,
            lastUpdate: this.lastUpdate || undefined,
            vehicleCount: this.vehicleCount,
        };
    }
};
exports.FlespiAdapter = FlespiAdapter;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], FlespiAdapter.prototype, "pollFlespiApi", null);
exports.FlespiAdapter = FlespiAdapter = FlespiAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], FlespiAdapter);


/***/ }),
/* 87 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataNormalizerService = void 0;
const common_1 = __webpack_require__(3);
const provider_enum_1 = __webpack_require__(25);
let DataNormalizerService = class DataNormalizerService {
    normalizeFromFlespi(data, vehicleId) {
        return {
            vehicleId,
            lat: data.position?.latitude || 0,
            lng: data.position?.longitude || 0,
            speed: this.convertSpeed(data.position?.speed || 0, 'kmh'),
            heading: data.position?.direction || 0,
            altitude: data.position?.altitude,
            accuracy: data.position?.accuracy,
            timestamp: new Date(data.timestamp || Date.now()),
            provider: provider_enum_1.Provider.FLESPI,
            raw: data,
        };
    }
    normalizeFromEchoes(data, vehicleId) {
        return {
            vehicleId,
            lat: data.lat || 0,
            lng: data.lng || 0,
            speed: this.convertSpeed(data.speed || 0, 'kmh'),
            heading: data.heading || 0,
            altitude: data.altitude,
            accuracy: data.accuracy,
            timestamp: new Date(data.timestamp || Date.now()),
            provider: provider_enum_1.Provider.ECHOES,
            raw: data,
        };
    }
    normalizeFromUbiwan(data, vehicleId) {
        return {
            vehicleId,
            lat: data.gps?.latitude || 0,
            lng: data.gps?.longitude || 0,
            speed: this.convertSpeed(data.gps?.speed || 0, 'kmh'),
            heading: data.gps?.heading || 0,
            altitude: data.gps?.altitude,
            accuracy: data.gps?.accuracy,
            timestamp: new Date(data.gps?.timestamp || Date.now()),
            provider: provider_enum_1.Provider.UBIWAN,
            raw: data,
        };
    }
    normalizeFromKeepTrace(data, vehicleId) {
        return {
            vehicleId,
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
            speed: this.convertSpeed(data.location?.speed || 0, 'kmh'),
            heading: data.location?.heading || 0,
            altitude: data.location?.altitude,
            accuracy: data.location?.accuracy,
            timestamp: new Date(data.location?.timestamp || Date.now()),
            provider: provider_enum_1.Provider.KEEPTRACE,
            raw: data,
        };
    }
    validate(data) {
        if (!data.vehicleId)
            return false;
        if (typeof data.lat !== 'number' || typeof data.lng !== 'number')
            return false;
        if (data.lat < -90 || data.lat > 90 || data.lng < -180 || data.lng > 180)
            return false;
        if (typeof data.speed !== 'number' || data.speed < 0)
            return false;
        if (typeof data.heading !== 'number' || data.heading < 0 || data.heading > 360)
            return false;
        return true;
    }
    convertSpeed(speed, unit) {
        // Convert to km/h
        switch (unit) {
            case 'kmh':
                return speed;
            case 'ms':
                return speed * 3.6;
            case 'mph':
                return speed * 1.60934;
            default:
                return speed;
        }
    }
};
exports.DataNormalizerService = DataNormalizerService;
exports.DataNormalizerService = DataNormalizerService = __decorate([
    (0, common_1.Injectable)()
], DataNormalizerService);


/***/ }),
/* 88 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EchoesAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EchoesAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(87);
/**
 * Echoes GPS Adapter (Neutral Server API)
 *
 * Swagger: https://api.neutral-server.com/
 * 2-step authentication:
 *   1. API Key → GET /api/accounts/{id}/privacy_key to list keys,
 *      or POST with {"features":[...]} to create one
 *   2. Privacy Key → all subsequent calls with "Authorization: Privacykey <token>"
 *
 * Endpoints:
 *   - Assets:          GET /api/accounts/{id}/assets
 *   - Last positions:  GET /api/accounts/{id}/reports/assets/{assetId}/last_locations?nbLocations=1
 *   - Locations:       GET /api/accounts/{id}/assets/{assetId}/locations?period={"start":ms,"end":ms}
 *   - Trips:           GET /api/accounts/{id}/assets/{assetId}/trips?period={"start":ms,"end":ms}
 */
let EchoesAdapter = EchoesAdapter_1 = class EchoesAdapter {
    constructor(configService, normalizer) {
        this.configService = configService;
        this.normalizer = normalizer;
        this.dataCallback = null;
        this.connected = false;
        this.lastUpdate = null;
        this.vehicleCount = 0;
        this.logger = new common_1.Logger(EchoesAdapter_1.name);
        // Privacy Key cache (valid for 24h, we refresh at 20h)
        this.privacyKey = null;
        this.privacyKeyExpiry = 0;
        this.PRIVACY_KEY_REFRESH_MS = 20 * 60 * 60 * 1000; // 20 hours
        // Asset ID list cache (refreshed every poll)
        this.assetIds = [];
        this.apiUrl = this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com');
        this.apiKey = this.configService.get('ECHOES_API_KEY', '');
        this.accountId = this.configService.get('ECHOES_ACCOUNT_ID', '');
    }
    async onModuleInit() {
        if (this.apiKey && this.accountId) {
            await this.connect();
        }
        else {
            this.logger.warn('Echoes API key or account ID not configured, adapter disabled');
        }
    }
    /**
     * Get a valid Privacy Key, reusing cached one if not expired.
     * Step 1: GET existing keys with Apikey auth
     * Step 2: Pick the latest valid key, or create a new one
     */
    async getPrivacyKey() {
        const now = Date.now();
        // Return cached key if still valid
        if (this.privacyKey && now < this.privacyKeyExpiry) {
            return this.privacyKey;
        }
        this.logger.log('Refreshing Echoes Privacy Key...');
        // List existing privacy keys
        const listResponse = await fetch(`${this.apiUrl}/api/accounts/${this.accountId}/privacy_key`, {
            headers: {
                Authorization: `Apikey ${this.apiKey}`,
                Accept: 'application/json',
            },
        });
        if (!listResponse.ok) {
            throw new Error(`Failed to list privacy keys: ${listResponse.status}`);
        }
        const keys = (await listResponse.json());
        // Find valid key with LOCATION feature, expiring furthest in the future
        const validKeys = keys
            .filter((k) => k.expiredAt > now &&
            k.features &&
            k.features.includes('LOCATION'))
            .sort((a, b) => b.expiredAt - a.expiredAt);
        if (validKeys.length > 0) {
            const best = validKeys[0];
            this.privacyKey = best.token;
            // Refresh when the key is 80% through its lifetime or after 20h, whichever is sooner
            this.privacyKeyExpiry = Math.min(now + this.PRIVACY_KEY_REFRESH_MS, best.expiredAt - 3600000);
            this.logger.log(`Using existing Privacy Key (expires at ${new Date(best.expiredAt).toISOString()})`);
            return this.privacyKey;
        }
        // No valid key found — create a new one with LOCATION feature
        this.logger.log('Creating new Echoes Privacy Key...');
        const createResponse = await fetch(`${this.apiUrl}/api/accounts/${this.accountId}/privacy_key`, {
            method: 'POST',
            headers: {
                Authorization: `Apikey ${this.apiKey}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                features: [
                    'LOCATION',
                    'TRIPS',
                    'SPEED',
                    'ODOMETER',
                    'GEOFENCING',
                    'ENERGY',
                ],
            }),
        });
        if (!createResponse.ok) {
            const body = await createResponse.text();
            throw new Error(`Failed to create privacy key: ${createResponse.status} - ${body}`);
        }
        const newKey = (await createResponse.json());
        this.privacyKey = newKey.token;
        this.privacyKeyExpiry = now + this.PRIVACY_KEY_REFRESH_MS;
        this.logger.log(`Created new Privacy Key: ${newKey.token?.substring(0, 8)}...`);
        return this.privacyKey;
    }
    /**
     * Make an authenticated API call using the Privacy Key
     */
    async apiCall(path) {
        const token = await this.getPrivacyKey();
        const response = await fetch(`${this.apiUrl}${path}`, {
            headers: {
                Authorization: `Privacykey ${token}`,
                Accept: 'application/json',
            },
        });
        if (response.status === 401) {
            // Privacy key expired, clear cache and retry once
            this.privacyKey = null;
            this.privacyKeyExpiry = 0;
            const newToken = await this.getPrivacyKey();
            const retryResponse = await fetch(`${this.apiUrl}${path}`, {
                headers: {
                    Authorization: `Privacykey ${newToken}`,
                    Accept: 'application/json',
                },
            });
            if (!retryResponse.ok) {
                throw new Error(`Echoes API error after retry: ${retryResponse.status}`);
            }
            return retryResponse.json();
        }
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Echoes API error: ${response.status} - ${body.substring(0, 200)}`);
        }
        return response.json();
    }
    /**
     * Fetch all assets with pagination (100 per page).
     */
    async fetchAllAssetIds() {
        const ids = [];
        let offset = 0;
        const limit = 100;
        while (true) {
            const assets = await this.apiCall(`/api/accounts/${this.accountId}/assets?limit=${limit}&offset=${offset}`);
            if (!Array.isArray(assets) || assets.length === 0)
                break;
            for (const a of assets) {
                ids.push(a.id);
            }
            if (assets.length < limit)
                break;
            offset += limit;
        }
        return ids;
    }
    async connect() {
        try {
            // Verify we can get a privacy key and list all assets (paginated)
            await this.getPrivacyKey();
            this.assetIds = await this.fetchAllAssetIds();
            this.connected = true;
            this.logger.log(`Echoes adapter connected (Account: ${this.accountId}, ${this.assetIds.length} assets)`);
        }
        catch (error) {
            this.logger.error('Echoes connection error:', error);
        }
    }
    async disconnect() {
        this.connected = false;
        this.privacyKey = null;
        this.privacyKeyExpiry = 0;
        this.logger.log('Echoes adapter disconnected');
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    /**
     * Poll Echoes API every 2 minutes.
     * Uses /reports/assets/{id}/last_locations for each asset to get latest position.
     * Processes assets in batches to avoid overwhelming the API.
     */
    async pollEchoesApi() {
        if (!this.connected || !this.dataCallback)
            return;
        try {
            // Refresh asset list if empty (paginated fetch)
            if (this.assetIds.length === 0) {
                this.assetIds = await this.fetchAllAssetIds();
                this.logger.log(`Echoes: refreshed asset list, ${this.assetIds.length} assets`);
            }
            let totalProcessed = 0;
            // Fetch last_locations for each asset (batch of 5 concurrent)
            const batchSize = 5;
            for (let i = 0; i < this.assetIds.length; i += batchSize) {
                const batch = this.assetIds.slice(i, i + batchSize);
                const results = await Promise.allSettled(batch.map(async (assetId) => {
                    try {
                        const data = await this.apiCall(`/api/accounts/${this.accountId}/reports/assets/${assetId}/last_locations?nbLocations=1`);
                        if (Array.isArray(data) && data.length > 0) {
                            const entry = data[0];
                            const loc = entry.location || entry;
                            const lat = loc.latitude;
                            const lng = loc.longitude;
                            if (lat && lng) {
                                const normalized = {
                                    vehicleId: String(assetId),
                                    lat: parseFloat(lat),
                                    lng: parseFloat(lng),
                                    speed: loc.speed ? parseFloat(loc.speed) : 0,
                                    heading: loc.heading ? parseFloat(loc.heading) : 0,
                                    altitude: loc.altitude ? parseFloat(loc.altitude) : undefined,
                                    timestamp: loc.dateTime
                                        ? new Date(loc.dateTime)
                                        : new Date(),
                                    provider: 'ECHOES',
                                    raw: entry,
                                };
                                if (this.normalizer.validate(normalized) && this.dataCallback) {
                                    this.dataCallback(normalized);
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    catch {
                        return false;
                    }
                }));
                for (const r of results) {
                    if (r.status === 'fulfilled' && r.value)
                        totalProcessed++;
                }
            }
            this.vehicleCount = totalProcessed;
            this.lastUpdate = new Date();
            this.logger.debug(`Echoes poll complete: ${totalProcessed}/${this.assetIds.length} assets with positions`);
        }
        catch (error) {
            this.logger.error('Echoes polling error:', error);
        }
    }
    async getStatus() {
        return {
            connected: this.connected,
            lastUpdate: this.lastUpdate || undefined,
            vehicleCount: this.vehicleCount,
        };
    }
};
exports.EchoesAdapter = EchoesAdapter;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], EchoesAdapter.prototype, "pollEchoesApi", null);
exports.EchoesAdapter = EchoesAdapter = EchoesAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], EchoesAdapter);


/***/ }),
/* 89 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UbiwanAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UbiwanAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(87);
/**
 * Ubiwan GPS Adapter (api-fleet.moncoyote.com / api.ubiwan.net v53)
 *
 * Auth: GET /v53/auth?u={username}&l={license}&k={serverKey}&p={md5password}
 * Returns { result: 201, token: "...", auth: { ... } }
 *
 * Positions: GET /v53/location?token={token}&timestamp=0
 * Returns { location: { data: [ { uid, registration, latitude, longitude, speed_current, course, location_date, dev_hw_id, ... } ] } }
 *
 * The password is already MD5-hashed in the env var.
 */
let UbiwanAdapter = UbiwanAdapter_1 = class UbiwanAdapter {
    constructor(configService, normalizer) {
        this.configService = configService;
        this.normalizer = normalizer;
        this.dataCallback = null;
        this.connected = false;
        this.lastUpdate = null;
        this.vehicleCount = 0;
        this.authToken = null;
        this.tokenExpiry = 0; // re-auth every 4 hours
        this.logger = new common_1.Logger(UbiwanAdapter_1.name);
        // api.ubiwan.net redirects 301 → api-fleet.moncoyote.com
        this.apiUrl = this.configService.get('UBIWAN_API_URL', 'https://api-fleet.moncoyote.com');
        this.username = this.configService.get('UBIWAN_USERNAME', '');
        // The password env var stores the MD5 hash directly
        this.md5Password = this.configService.get('UBIWAN_PASSWORD', '');
        this.serverKey = this.configService.get('UBIWAN_SERVER_KEY', '');
        this.license = this.configService.get('UBIWAN_LICENSE', '');
    }
    async onModuleInit() {
        if (this.username && this.md5Password && this.license) {
            await this.connect();
        }
        else {
            this.logger.warn('Ubiwan credentials not configured, adapter disabled');
        }
    }
    /**
     * Authenticate with Ubiwan API
     * GET /v53/auth?u={username}&l={license}&k={serverKey}&p={md5password}
     * Response: { result: 201, token: "hex", auth: { uid, company, ... } }
     */
    async connect() {
        try {
            const authUrl = `${this.apiUrl}/v53/auth?u=${encodeURIComponent(this.username)}&l=${encodeURIComponent(this.license)}&k=${encodeURIComponent(this.serverKey)}&p=${this.md5Password}`;
            this.logger.log(`Ubiwan: authenticating as ${this.username}...`);
            const response = await fetch(authUrl, {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) {
                const body = await response.text();
                this.logger.error(`Ubiwan auth failed: ${response.status} - ${body.substring(0, 300)}`);
                return;
            }
            const authData = (await response.json());
            if (authData.result === 201 && authData.token) {
                this.authToken = authData.token;
                this.connected = true;
                this.tokenExpiry = Date.now() + 4 * 60 * 60 * 1000; // 4h
                const company = authData.auth?.company || 'unknown';
                this.logger.log(`Ubiwan adapter connected (company: ${company}, uid: ${authData.auth?.uid})`);
            }
            else {
                this.logger.error(`Ubiwan auth unexpected result: ${JSON.stringify(authData).substring(0, 300)}`);
            }
        }
        catch (error) {
            this.logger.error('Ubiwan connection error:', error);
        }
    }
    async disconnect() {
        this.connected = false;
        this.authToken = null;
        this.logger.log('Ubiwan adapter disconnected');
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    /**
     * Ensure we have a valid token, re-auth if expired
     */
    async ensureAuth() {
        if (!this.authToken || Date.now() > this.tokenExpiry) {
            this.logger.log('Ubiwan: token expired or missing, re-authenticating...');
            await this.connect();
        }
        return !!this.authToken;
    }
    /**
     * Poll Ubiwan API every 2 minutes using the /location endpoint
     * GET /v53/location?token={token}&timestamp=0
     *
     * Returns all devices with their last known position:
     * {
     *   location: {
     *     data: [{
     *       uid, registration, summary, latitude, longitude,
     *       speed_current, course, location_date, dev_hw_id,
     *       mileage, battery_level, address, ...
     *     }]
     *   }
     * }
     */
    async pollUbiwanApi() {
        if (!this.dataCallback)
            return;
        const hasAuth = await this.ensureAuth();
        if (!hasAuth)
            return;
        try {
            const response = await fetch(`${this.apiUrl}/v53/location?token=${encodeURIComponent(this.authToken)}&timestamp=0`, { headers: { Accept: 'application/json' } });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.logger.warn('Ubiwan session expired, reconnecting...');
                    this.authToken = null;
                    await this.connect();
                    return;
                }
                this.logger.error(`Ubiwan API error: ${response.status} ${response.statusText}`);
                return;
            }
            const data = (await response.json());
            // /location returns { result, location: { data: [...], summary: [...] } }
            const devices = data.location?.data || [];
            let totalProcessed = 0;
            for (const device of devices) {
                try {
                    const normalized = this.normalizeUbiwanData(device);
                    if (normalized && this.normalizer.validate(normalized)) {
                        this.dataCallback(normalized);
                        totalProcessed++;
                    }
                }
                catch (err) {
                    this.logger.warn(`Failed to normalize Ubiwan device ${device.uid}: ${err}`);
                }
            }
            this.vehicleCount = totalProcessed;
            this.lastUpdate = new Date();
            this.logger.log(`Ubiwan poll complete: ${totalProcessed}/${devices.length} vehicles with GPS`);
        }
        catch (error) {
            this.logger.error('Ubiwan polling error:', error);
        }
    }
    /**
     * Normalize Ubiwan /location device data to standard GPS format
     *
     * Key fields from Ubiwan:
     *   uid          - device UID (used as vehicleId → maps to metadata.ubiwanId)
     *   latitude     - decimal
     *   longitude    - decimal
     *   speed_current - km/h
     *   course       - heading in degrees
     *   location_date - Unix timestamp (seconds)
     *   dev_hw_id    - IMEI
     *   registration - license plate
     *   summary      - vehicle description
     */
    normalizeUbiwanData(device) {
        const lat = device.latitude;
        const lng = device.longitude;
        // Skip devices without GPS position
        if (lat == null || lng == null)
            return null;
        return {
            vehicleId: String(device.uid),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            speed: parseFloat(device.speed_current || 0),
            heading: parseFloat(device.course || 0),
            altitude: undefined,
            timestamp: device.location_date
                ? new Date(device.location_date * 1000)
                : new Date(),
            provider: 'UBIWAN',
            raw: {
                uid: device.uid,
                registration: device.registration,
                summary: device.summary,
                dev_hw_id: device.dev_hw_id,
                mileage: device.mileage,
                battery_level: device.battery_level,
                battery_volt: device.battery_volt,
                address: device.address,
                hardware: device.hardware,
            },
        };
    }
    async getStatus() {
        return {
            connected: this.connected,
            lastUpdate: this.lastUpdate || undefined,
            vehicleCount: this.vehicleCount,
        };
    }
};
exports.UbiwanAdapter = UbiwanAdapter;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UbiwanAdapter.prototype, "pollUbiwanApi", null);
exports.UbiwanAdapter = UbiwanAdapter = UbiwanAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], UbiwanAdapter);


/***/ }),
/* 90 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KeepTraceAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeepTraceAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(87);
/**
 * KeepTrace GPS Adapter
 *
 * API Documentation: https://customerapi.live.keeptrace.fr/Help
 * Auth: Header "Authorization-Key: <apiKey>"
 *
 * Endpoints:
 *   GET  api/Vehicle/GetVehicles         - List equipped vehicles
 *   POST api/RealTime/GetLastPositions   - Last positions for all vehicles
 *   POST api/RealTime/GetLastPosition    - Last position for one vehicle
 *   POST api/RealTime/GetAllPositions    - Positions since a date/ID
 *   POST api/History/GetJourneys         - Journey history for a vehicle
 *   POST api/History/GetJourneysLocations - GPS locations during journeys
 */
let KeepTraceAdapter = KeepTraceAdapter_1 = class KeepTraceAdapter {
    constructor(configService, normalizer) {
        this.configService = configService;
        this.normalizer = normalizer;
        this.dataCallback = null;
        this.connected = false;
        this.lastUpdate = null;
        this.vehicleCount = 0;
        this.logger = new common_1.Logger(KeepTraceAdapter_1.name);
        this.apiUrl = this.configService.get('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr');
        this.apiKey = this.configService.get('KEEPTRACE_API_KEY', '');
    }
    async onModuleInit() {
        if (this.apiKey) {
            await this.connect();
        }
        else {
            this.logger.warn('KeepTrace API key not configured, adapter disabled');
        }
    }
    async connect() {
        try {
            // Test connection by fetching vehicle list
            const response = await fetch(`${this.apiUrl}/api/Vehicle/GetVehicles`, {
                headers: this.getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                this.connected = true;
                const count = Array.isArray(data) ? data.length : 0;
                this.logger.log(`KeepTrace adapter connected (${count} vehicles found)`);
            }
            else {
                const body = await response.text();
                this.logger.error(`KeepTrace connection failed: ${response.status} ${response.statusText} - ${body}`);
            }
        }
        catch (error) {
            this.logger.error('KeepTrace connection error:', error);
        }
    }
    async disconnect() {
        this.connected = false;
        this.logger.log('KeepTrace adapter disconnected');
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    /**
     * Build auth headers for KeepTrace API
     * Uses "Authorization-Key" header as per official docs
     */
    getAuthHeaders() {
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization-Key': this.apiKey,
        };
    }
    /**
     * Poll KeepTrace API every 2 minutes
     * Uses POST api/RealTime/GetLastPositions for real-time positions
     */
    async pollKeepTraceApi() {
        if (!this.connected || !this.dataCallback)
            return;
        try {
            // Use GetLastPositions for all vehicle positions
            const response = await fetch(`${this.apiUrl}/api/RealTime/GetLastPositions`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({}),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    this.logger.warn('KeepTrace API key may be expired');
                    this.connected = false;
                }
                this.logger.error(`KeepTrace API error: ${response.status} ${response.statusText}`);
                return;
            }
            const data = (await response.json());
            const vehicles = Array.isArray(data) ? data : (data.Positions || data.positions || data.vehicles || data.items || data.results || []);
            let totalProcessed = 0;
            for (const vehicle of vehicles) {
                try {
                    const normalized = this.normalizeKeepTraceData(vehicle);
                    if (normalized && this.normalizer.validate(normalized)) {
                        this.dataCallback(normalized);
                        totalProcessed++;
                    }
                }
                catch (err) {
                    this.logger.warn(`Failed to normalize KeepTrace vehicle ${vehicle.id || vehicle.VehicleId}: ${err}`);
                }
            }
            this.vehicleCount = totalProcessed;
            this.lastUpdate = new Date();
            this.logger.debug(`KeepTrace poll complete: ${totalProcessed} vehicles processed`);
        }
        catch (error) {
            this.logger.error('KeepTrace polling error:', error);
        }
    }
    /**
     * Fetch a single vehicle's latest position
     */
    async getVehiclePosition(vehicleId) {
        const response = await fetch(`${this.apiUrl}/api/RealTime/GetLastPosition`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ VehicleId: vehicleId }),
        });
        if (!response.ok) {
            throw new Error(`KeepTrace API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Fetch vehicle journey history
     */
    async getVehicleHistory(vehicleId, startDate, endDate) {
        const response = await fetch(`${this.apiUrl}/api/History/GetJourneys`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                VehicleId: vehicleId,
                StartDate: startDate,
                EndDate: endDate,
            }),
        });
        if (!response.ok) {
            throw new Error(`KeepTrace API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Normalize KeepTrace vehicle data to standard GPS format
     * KeepTrace returns fields like: VehicleId, Latitude, Longitude, Speed, Direction, Date
     */
    normalizeKeepTraceData(vehicle) {
        const lat = vehicle.Latitude || vehicle.latitude || vehicle.lat || vehicle.lastPosition?.latitude;
        const lng = vehicle.Longitude || vehicle.longitude || vehicle.lng || vehicle.lon || vehicle.lastPosition?.longitude;
        if (!lat || !lng)
            return null;
        return {
            vehicleId: String(vehicle.VehicleId || vehicle.Id || vehicle.id || vehicle.trackerId || vehicle.imei),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            speed: parseFloat(vehicle.GpsSpeed || vehicle.Speed || vehicle.speed || vehicle.lastPosition?.speed || 0),
            heading: parseFloat(vehicle.Heading || vehicle.Direction || vehicle.heading || vehicle.direction || 0),
            altitude: vehicle.Altitude || vehicle.altitude ? parseFloat(vehicle.Altitude || vehicle.altitude) : undefined,
            timestamp: vehicle.TimeStamp
                ? new Date(vehicle.TimeStamp)
                : vehicle.Date
                    ? new Date(vehicle.Date)
                    : new Date(),
            provider: 'KEEPTRACE',
            raw: vehicle,
        };
    }
    async getStatus() {
        return {
            connected: this.connected,
            lastUpdate: this.lastUpdate || undefined,
            vehicleCount: this.vehicleCount,
        };
    }
};
exports.KeepTraceAdapter = KeepTraceAdapter;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], KeepTraceAdapter.prototype, "pollKeepTraceApi", null);
exports.KeepTraceAdapter = KeepTraceAdapter = KeepTraceAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], KeepTraceAdapter);


/***/ }),
/* 91 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GpsDataPipelineService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsDataPipelineService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const vehicle_entity_1 = __webpack_require__(21);
const gps_history_entity_1 = __webpack_require__(24);
const gps_gateway_1 = __webpack_require__(92);
/**
 * Direct GPS data pipeline - persists GPS positions to the database
 * without requiring Redis/Bull queues.
 *
 * Flow: GPS Adapter → onData callback → GpsDataPipelineService.processGpsData()
 *   1. Looks up the vehicle by external ID (deviceImei or metadata mapping)
 *   2. Updates the vehicle's current position
 *   3. Records the position in gps_history
 */
let GpsDataPipelineService = GpsDataPipelineService_1 = class GpsDataPipelineService {
    constructor(vehiclesRepository, gpsHistoryRepository, gpsGateway) {
        this.vehiclesRepository = vehiclesRepository;
        this.gpsHistoryRepository = gpsHistoryRepository;
        this.gpsGateway = gpsGateway;
        this.logger = new common_1.Logger(GpsDataPipelineService_1.name);
        // Cache: externalId → { vehicleId, organizationId }
        // Refreshed periodically to avoid DB lookups on every GPS event
        this.vehicleCache = new Map();
        this.cacheRefreshInterval = null;
    }
    async onModuleInit() {
        await this.refreshVehicleCache();
        // Refresh cache every 5 minutes
        this.cacheRefreshInterval = setInterval(() => {
            this.refreshVehicleCache().catch((err) => this.logger.error('Failed to refresh vehicle cache:', err));
        }, 5 * 60 * 1000);
    }
    /**
     * Load all vehicles with device IMEIs into a lookup cache.
     * Maps both deviceImei and vehicle ID for flexible matching.
     */
    async refreshVehicleCache() {
        try {
            const vehicles = await this.vehiclesRepository.find({
                select: ['id', 'organizationId', 'deviceImei', 'metadata'],
            });
            this.vehicleCache.clear();
            for (const v of vehicles) {
                // Map by deviceImei (primary lookup key for GPS trackers)
                if (v.deviceImei) {
                    this.vehicleCache.set(v.deviceImei, {
                        vehicleId: v.id,
                        organizationId: v.organizationId,
                    });
                }
                // Also map by vehicle UUID for direct references
                this.vehicleCache.set(v.id, {
                    vehicleId: v.id,
                    organizationId: v.organizationId,
                });
                // Map by external provider IDs stored in metadata
                if (v.metadata) {
                    const externalIds = [
                        v.metadata.echoesUid,
                        v.metadata.ubiwanId,
                        v.metadata.keeptraceId,
                        v.metadata.flespiChannelId,
                    ].filter(Boolean);
                    for (const extId of externalIds) {
                        this.vehicleCache.set(String(extId), {
                            vehicleId: v.id,
                            organizationId: v.organizationId,
                        });
                    }
                }
            }
            this.logger.log(`Vehicle cache refreshed: ${this.vehicleCache.size} entries`);
        }
        catch (error) {
            this.logger.error('Failed to refresh vehicle cache:', error);
        }
    }
    /**
     * Main entry point: process a normalized GPS data point.
     * Called by GPS adapters via onData callback.
     */
    async processGpsData(data) {
        try {
            // Look up internal vehicle by external ID
            const mapping = this.vehicleCache.get(data.vehicleId);
            if (!mapping) {
                this.logger.debug(`No vehicle mapping for external ID "${data.vehicleId}" from ${data.provider} - skipping`);
                return;
            }
            const { vehicleId, organizationId } = mapping;
            // 1. Update vehicle's current position
            await this.vehiclesRepository.update(vehicleId, {
                currentLat: data.lat,
                currentLng: data.lng,
                currentSpeed: data.speed || 0,
                currentHeading: data.heading,
                lastCommunication: new Date(),
            });
            // 2. Record position in GPS history
            const historyRecord = this.gpsHistoryRepository.create({
                vehicleId,
                organizationId,
                lat: data.lat,
                lng: data.lng,
                speed: data.speed,
                heading: data.heading,
                altitude: data.altitude,
                accuracy: data.accuracy,
                provider: data.provider,
                metadata: data.raw ? { raw: data.raw } : undefined,
            });
            await this.gpsHistoryRepository.save(historyRecord);
            // Broadcast via WebSocket to connected clients
            try {
                this.gpsGateway.broadcastPosition({
                    vehicleId,
                    lat: data.lat,
                    lng: data.lng,
                    speed: data.speed || 0,
                    heading: data.heading || 0,
                    timestamp: data.timestamp,
                    provider: data.provider,
                });
            }
            catch {
                // Gateway may not be ready yet
            }
            this.logger.debug(`GPS data persisted for vehicle ${vehicleId} (${data.provider}): ${data.lat},${data.lng} @ ${data.speed} km/h`);
        }
        catch (error) {
            this.logger.error(`Failed to process GPS data for ${data.vehicleId} (${data.provider}):`, error);
        }
    }
    /**
     * Process a batch of GPS data points.
     */
    async processGpsBatch(dataPoints) {
        for (const data of dataPoints) {
            await this.processGpsData(data);
        }
    }
    /**
     * Get the current vehicle cache size (for monitoring).
     */
    getCacheSize() {
        return this.vehicleCache.size;
    }
};
exports.GpsDataPipelineService = GpsDataPipelineService;
exports.GpsDataPipelineService = GpsDataPipelineService = GpsDataPipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(gps_history_entity_1.GpsHistoryEntity)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => gps_gateway_1.GpsGateway))),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof gps_gateway_1.GpsGateway !== "undefined" && gps_gateway_1.GpsGateway) === "function" ? _c : Object])
], GpsDataPipelineService);


/***/ }),
/* 92 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GpsGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsGateway = void 0;
const websockets_1 = __webpack_require__(93);
const common_1 = __webpack_require__(3);
const socket_io_1 = __webpack_require__(94);
/**
 * GPS WebSocket Gateway
 *
 * Broadcasts real-time vehicle position updates to all connected clients.
 * The GpsDataPipelineService calls broadcastPosition() whenever a new
 * GPS data point is processed.
 *
 * Events:
 *   - vehicle:position  → { vehicleId, lat, lng, speed, heading, timestamp, provider }
 *   - fleet:stats       → { total, moving, stopped, withGps } (every 30s)
 */
let GpsGateway = GpsGateway_1 = class GpsGateway {
    constructor() {
        this.logger = new common_1.Logger(GpsGateway_1.name);
        this.connectedClients = 0;
    }
    afterInit() {
        this.logger.log('GPS WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.connectedClients++;
        this.logger.debug(`Client connected: ${client.id} (total: ${this.connectedClients})`);
    }
    handleDisconnect(client) {
        this.connectedClients--;
        this.logger.debug(`Client disconnected: ${client.id} (total: ${this.connectedClients})`);
    }
    /**
     * Broadcast a vehicle position update to all connected clients
     */
    broadcastPosition(data) {
        if (this.connectedClients > 0) {
            this.server.emit('vehicle:position', data);
        }
    }
    /**
     * Broadcast fleet statistics
     */
    broadcastFleetStats(stats) {
        if (this.connectedClients > 0) {
            this.server.emit('fleet:stats', stats);
        }
    }
    getConnectedClients() {
        return this.connectedClients;
    }
};
exports.GpsGateway = GpsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], GpsGateway.prototype, "server", void 0);
exports.GpsGateway = GpsGateway = GpsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        namespace: '/gps',
    })
], GpsGateway);


/***/ }),
/* 93 */
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),
/* 94 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 95 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TrackerDiscoveryService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackerDiscoveryService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const vehicle_entity_1 = __webpack_require__(21);
const gps_history_entity_1 = __webpack_require__(24);
const provider_enum_1 = __webpack_require__(25);
const gps_data_pipeline_service_1 = __webpack_require__(91);
/**
 * TrackerDiscoveryService
 *
 * Scans all GPS providers every 12 hours to detect new trackers/devices
 * that are not yet in the database. When a new device is found, it is
 * automatically imported with proper metadata mapping so the pipeline
 * can start persisting GPS data immediately.
 *
 * Provider discovery methods:
 *   - Flespi:    GET /gw/devices/all           → device.id, device.name, device.configuration.ident (IMEI)
 *   - Echoes:    GET /api/accounts/{id}/assets  → paginated, asset.id, asset.name, asset.registration
 *   - KeepTrace: GET api/Vehicle/GetVehicles    → VehicleId, Name, Registration
 *   - Ubiwan:    GET /v53/location?timestamp=0  → uid, registration, summary, dev_hw_id
 */
let TrackerDiscoveryService = TrackerDiscoveryService_1 = class TrackerDiscoveryService {
    constructor(vehiclesRepository, gpsHistoryRepository, configService, pipeline) {
        this.vehiclesRepository = vehiclesRepository;
        this.gpsHistoryRepository = gpsHistoryRepository;
        this.configService = configService;
        this.pipeline = pipeline;
        this.logger = new common_1.Logger(TrackerDiscoveryService_1.name);
        // How many days of history to fetch for new trackers
        this.HISTORY_BACKFILL_DAYS = 30;
        // Default org for auto-imported vehicles
        this.orgId = this.configService.get('DEFAULT_ORG_ID', 'a040ba4f-e427-4a9c-abc4-dce3dc05d24f');
    }
    /**
     * Run discovery every 12 hours (at 00:30 and 12:30)
     */
    async discoverNewTrackers() {
        this.logger.log('=== Tracker Discovery: scanning all providers for new devices ===');
        const results = await Promise.allSettled([
            this.discoverFlespi(),
            this.discoverEchoes(),
            this.discoverKeepTrace(),
            this.discoverUbiwan(),
        ]);
        let totalNew = 0;
        const providerNames = ['FLESPI', 'ECHOES', 'KEEPTRACE', 'UBIWAN'];
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            if (r.status === 'fulfilled') {
                totalNew += r.value;
                if (r.value > 0) {
                    this.logger.log(`${providerNames[i]}: ${r.value} new tracker(s) imported`);
                }
            }
            else {
                this.logger.error(`${providerNames[i]} discovery failed: ${r.reason}`);
            }
        }
        if (totalNew > 0) {
            this.logger.log(`Discovery complete: ${totalNew} new tracker(s) imported. Refreshing pipeline cache...`);
            await this.pipeline.refreshVehicleCache();
        }
        else {
            this.logger.log('Discovery complete: no new trackers found.');
        }
    }
    // ─── FLESPI ───────────────────────────────────────────────────────────
    async discoverFlespi() {
        const token = this.configService.get('FLESPI_TOKEN', '');
        if (!token)
            return 0;
        const response = await fetch('https://flespi.io/gw/devices/all', {
            headers: {
                Authorization: `FlespiToken ${token}`,
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Flespi API ${response.status}`);
        }
        const data = (await response.json());
        const devices = data.result || [];
        // Get existing flespiChannelIds
        const existing = await this.getExistingMetadataKeys('flespiChannelId');
        let imported = 0;
        for (const device of devices) {
            const deviceId = String(device.id);
            if (existing.has(deviceId))
                continue;
            const ident = device.configuration?.ident || '';
            const name = device.name || `Flespi Device ${deviceId}`;
            const vehicle = await this.vehiclesRepository.save(this.vehiclesRepository.create({
                organizationId: this.orgId,
                name,
                plate: ident || `FLESPI-${deviceId}`,
                deviceImei: ident,
                status: 'active',
                metadata: { flespiChannelId: deviceId },
            }));
            imported++;
            this.logger.log(`  [FLESPI] New device: ${name} (id=${deviceId}, imei=${ident})`);
            // Backfill GPS history for this new device
            this.backfillFlespiHistory(vehicle.id, deviceId, token).catch((err) => this.logger.error(`  [FLESPI] History backfill failed for ${deviceId}: ${err.message}`));
        }
        return imported;
    }
    /**
     * Fetch Flespi device messages (GPS history) and store in gps_history.
     * API: GET /gw/devices/{deviceId}/messages?data={"from":ts,"to":ts}
     */
    async backfillFlespiHistory(vehicleId, deviceId, token) {
        const now = Math.floor(Date.now() / 1000);
        const from = now - this.HISTORY_BACKFILL_DAYS * 86400;
        const response = await fetch(`https://flespi.io/gw/devices/${deviceId}/messages?data={"from":${from},"to":${now}}`, {
            headers: {
                Authorization: `FlespiToken ${token}`,
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            this.logger.warn(`  [FLESPI] History API ${response.status} for device ${deviceId}`);
            return;
        }
        const data = (await response.json());
        const messages = data.result || [];
        if (messages.length === 0) {
            this.logger.log(`  [FLESPI] No history for device ${deviceId}`);
            return;
        }
        const records = [];
        for (const msg of messages) {
            const lat = msg['position.latitude'] || msg.latitude;
            const lng = msg['position.longitude'] || msg.longitude;
            if (!lat || !lng)
                continue;
            records.push({
                vehicleId,
                organizationId: this.orgId,
                lat,
                lng,
                speed: msg['position.speed'] || msg.speed || 0,
                heading: msg['position.direction'] || msg.heading || 0,
                altitude: msg['position.altitude'] || msg.altitude,
                provider: provider_enum_1.Provider.FLESPI,
                createdAt: new Date((msg.timestamp || msg['server.timestamp'] || now) * 1000),
                metadata: { source: 'backfill' },
            });
        }
        if (records.length > 0) {
            // Insert in batches of 500
            for (let i = 0; i < records.length; i += 500) {
                const batch = records.slice(i, i + 500);
                await this.gpsHistoryRepository.save(batch.map((r) => this.gpsHistoryRepository.create(r)));
            }
            this.logger.log(`  [FLESPI] Backfilled ${records.length} positions for device ${deviceId}`);
        }
    }
    // ─── ECHOES ───────────────────────────────────────────────────────────
    async discoverEchoes() {
        const apiKey = this.configService.get('ECHOES_API_KEY', '');
        const accountId = this.configService.get('ECHOES_ACCOUNT_ID', '');
        if (!apiKey || !accountId)
            return 0;
        // Step 1: get a privacy key
        const privacyKey = await this.getEchoesPrivacyKey(apiKey, accountId);
        // Step 2: fetch all assets with pagination
        const allAssets = [];
        let offset = 0;
        const limit = 100;
        while (true) {
            const response = await fetch(`https://api.neutral-server.com/api/accounts/${accountId}/assets?limit=${limit}&offset=${offset}`, {
                headers: {
                    Authorization: `Privacykey ${privacyKey}`,
                    Accept: 'application/json',
                },
            });
            if (!response.ok)
                throw new Error(`Echoes API ${response.status}`);
            const assets = (await response.json());
            if (!Array.isArray(assets) || assets.length === 0)
                break;
            allAssets.push(...assets);
            if (assets.length < limit)
                break;
            offset += limit;
        }
        // Get existing echoesUids
        const existing = await this.getExistingMetadataKeys('echoesUid');
        let imported = 0;
        for (const asset of allAssets) {
            const assetId = String(asset.id);
            if (existing.has(assetId))
                continue;
            const name = asset.name || asset.registration || `Echoes Asset ${assetId}`;
            const plate = asset.registration || `ECHOES-${assetId}`;
            const vehicle = await this.vehiclesRepository.save(this.vehiclesRepository.create({
                organizationId: this.orgId,
                name,
                plate,
                status: 'active',
                metadata: { echoesUid: assetId },
            }));
            imported++;
            this.logger.log(`  [ECHOES] New asset: ${name} (id=${assetId})`);
            // Backfill GPS history
            this.backfillEchoesHistory(vehicle.id, assetId, privacyKey).catch((err) => this.logger.error(`  [ECHOES] History backfill failed for ${assetId}: ${err.message}`));
        }
        return imported;
    }
    /**
     * Fetch Echoes location history and store in gps_history.
     * API: GET /api/accounts/{id}/assets/{assetId}/locations?period={"start":ms,"end":ms}
     */
    async backfillEchoesHistory(vehicleId, assetId, privacyKey) {
        const now = Date.now();
        const from = now - this.HISTORY_BACKFILL_DAYS * 86400 * 1000;
        const period = JSON.stringify({ start: from, end: now });
        const accountId = this.configService.get('ECHOES_ACCOUNT_ID', '');
        const apiUrl = this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com');
        const response = await fetch(`${apiUrl}/api/accounts/${accountId}/assets/${assetId}/locations?period=${encodeURIComponent(period)}`, {
            headers: {
                Authorization: `Privacykey ${privacyKey}`,
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            this.logger.warn(`  [ECHOES] History API ${response.status} for asset ${assetId}`);
            return;
        }
        const locations = (await response.json());
        if (!Array.isArray(locations) || locations.length === 0) {
            this.logger.log(`  [ECHOES] No history for asset ${assetId}`);
            return;
        }
        const records = [];
        for (const loc of locations) {
            const lat = loc.latitude || loc.lat;
            const lng = loc.longitude || loc.lng || loc.lon;
            if (!lat || !lng)
                continue;
            records.push({
                vehicleId,
                organizationId: this.orgId,
                lat,
                lng,
                speed: loc.speed || 0,
                heading: loc.heading || loc.direction || 0,
                altitude: loc.altitude,
                provider: provider_enum_1.Provider.ECHOES,
                createdAt: new Date(loc.timestamp || loc.date || loc.time || Date.now()),
                metadata: { source: 'backfill' },
            });
        }
        if (records.length > 0) {
            for (let i = 0; i < records.length; i += 500) {
                const batch = records.slice(i, i + 500);
                await this.gpsHistoryRepository.save(batch.map((r) => this.gpsHistoryRepository.create(r)));
            }
            this.logger.log(`  [ECHOES] Backfilled ${records.length} positions for asset ${assetId}`);
        }
    }
    async getEchoesPrivacyKey(apiKey, accountId) {
        const listResponse = await fetch(`https://api.neutral-server.com/api/accounts/${accountId}/privacy_key`, {
            headers: {
                Authorization: `Apikey ${apiKey}`,
                Accept: 'application/json',
            },
        });
        if (!listResponse.ok)
            throw new Error(`Echoes privacy key list: ${listResponse.status}`);
        const keys = (await listResponse.json());
        const now = Date.now();
        const valid = keys
            .filter((k) => k.expiredAt > now && k.features?.includes('LOCATION'))
            .sort((a, b) => b.expiredAt - a.expiredAt);
        if (valid.length > 0)
            return valid[0].token;
        // Create new key
        const createResponse = await fetch(`https://api.neutral-server.com/api/accounts/${accountId}/privacy_key`, {
            method: 'POST',
            headers: {
                Authorization: `Apikey ${apiKey}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                features: ['LOCATION', 'TRIPS', 'SPEED', 'ODOMETER', 'GEOFENCING', 'ENERGY'],
            }),
        });
        if (!createResponse.ok)
            throw new Error(`Echoes create key: ${createResponse.status}`);
        const newKey = (await createResponse.json());
        return newKey.token;
    }
    // ─── KEEPTRACE ────────────────────────────────────────────────────────
    async discoverKeepTrace() {
        const apiKey = this.configService.get('KEEPTRACE_API_KEY', '');
        if (!apiKey)
            return 0;
        const apiUrl = this.configService.get('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr');
        const response = await fetch(`${apiUrl}/api/Vehicle/GetVehicles`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization-Key': apiKey,
            },
        });
        if (!response.ok)
            throw new Error(`KeepTrace API ${response.status}`);
        const vehicles = (await response.json());
        if (!Array.isArray(vehicles))
            return 0;
        // Get existing keeptraceIds
        const existing = await this.getExistingMetadataKeys('keeptraceId');
        let imported = 0;
        for (const v of vehicles) {
            const vid = String(v.VehicleId || v.Id || v.id);
            if (existing.has(vid))
                continue;
            const name = v.Name || v.name || `KeepTrace ${vid}`;
            const plate = v.Registration || v.registration || v.LicensePlate || `KT-${vid}`;
            const imei = v.Imei || v.imei || '';
            const vehicle = await this.vehiclesRepository.save(this.vehiclesRepository.create({
                organizationId: this.orgId,
                name,
                plate,
                deviceImei: imei || undefined,
                status: 'active',
                metadata: { keeptraceId: vid },
            }));
            imported++;
            this.logger.log(`  [KEEPTRACE] New vehicle: ${name} (id=${vid}, plate=${plate})`);
            // Backfill GPS history
            this.backfillKeepTraceHistory(vehicle.id, vid, apiUrl, apiKey).catch((err) => this.logger.error(`  [KEEPTRACE] History backfill failed for ${vid}: ${err.message}`));
        }
        return imported;
    }
    /**
     * Fetch KeepTrace journey locations history and store in gps_history.
     * API: POST api/History/GetJourneysLocations { VehicleId, StartDate, EndDate }
     */
    async backfillKeepTraceHistory(vehicleId, keeptraceVehicleId, apiUrl, apiKey) {
        const now = new Date();
        const from = new Date(now.getTime() - this.HISTORY_BACKFILL_DAYS * 86400 * 1000);
        const response = await fetch(`${apiUrl}/api/History/GetJourneysLocations`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization-Key': apiKey,
            },
            body: JSON.stringify({
                VehicleId: keeptraceVehicleId,
                StartDate: from.toISOString(),
                EndDate: now.toISOString(),
            }),
        });
        if (!response.ok) {
            this.logger.warn(`  [KEEPTRACE] History API ${response.status} for vehicle ${keeptraceVehicleId}`);
            return;
        }
        const data = (await response.json());
        // Response can be an array of journeys, each containing locations
        const journeys = Array.isArray(data) ? data : (data.Journeys || data.journeys || []);
        const records = [];
        for (const journey of journeys) {
            const locations = journey.Locations || journey.locations || journey.Points || journey.points || [];
            for (const loc of locations) {
                const lat = loc.Latitude || loc.latitude || loc.lat;
                const lng = loc.Longitude || loc.longitude || loc.lng || loc.lon;
                if (!lat || !lng)
                    continue;
                records.push({
                    vehicleId,
                    organizationId: this.orgId,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    speed: parseFloat(loc.GpsSpeed || loc.Speed || loc.speed || 0),
                    heading: parseFloat(loc.Heading || loc.Direction || loc.heading || loc.direction || 0),
                    altitude: loc.Altitude || loc.altitude ? parseFloat(loc.Altitude || loc.altitude) : undefined,
                    provider: provider_enum_1.Provider.KEEPTRACE,
                    createdAt: new Date(loc.TimeStamp || loc.Date || loc.date || loc.timestamp || Date.now()),
                    metadata: { source: 'backfill' },
                });
            }
        }
        // Also handle flat array response (locations directly, not wrapped in journeys)
        if (records.length === 0 && Array.isArray(data)) {
            for (const loc of data) {
                const lat = loc.Latitude || loc.latitude || loc.lat;
                const lng = loc.Longitude || loc.longitude || loc.lng || loc.lon;
                if (!lat || !lng)
                    continue;
                records.push({
                    vehicleId,
                    organizationId: this.orgId,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    speed: parseFloat(loc.GpsSpeed || loc.Speed || loc.speed || 0),
                    heading: parseFloat(loc.Heading || loc.Direction || loc.heading || loc.direction || 0),
                    altitude: loc.Altitude || loc.altitude ? parseFloat(loc.Altitude || loc.altitude) : undefined,
                    provider: provider_enum_1.Provider.KEEPTRACE,
                    createdAt: new Date(loc.TimeStamp || loc.Date || loc.date || loc.timestamp || Date.now()),
                    metadata: { source: 'backfill' },
                });
            }
        }
        if (records.length > 0) {
            for (let i = 0; i < records.length; i += 500) {
                const batch = records.slice(i, i + 500);
                await this.gpsHistoryRepository.save(batch.map((r) => this.gpsHistoryRepository.create(r)));
            }
            this.logger.log(`  [KEEPTRACE] Backfilled ${records.length} positions for vehicle ${keeptraceVehicleId}`);
        }
        else {
            this.logger.log(`  [KEEPTRACE] No history for vehicle ${keeptraceVehicleId}`);
        }
    }
    // ─── UBIWAN ───────────────────────────────────────────────────────────
    async discoverUbiwan() {
        const username = this.configService.get('UBIWAN_USERNAME', '');
        const md5Password = this.configService.get('UBIWAN_PASSWORD', '');
        const license = this.configService.get('UBIWAN_LICENSE', '');
        const serverKey = this.configService.get('UBIWAN_SERVER_KEY', '');
        const apiUrl = this.configService.get('UBIWAN_API_URL', 'https://api-fleet.moncoyote.com');
        if (!username || !md5Password || !license)
            return 0;
        // Authenticate
        const authResponse = await fetch(`${apiUrl}/v53/auth?u=${encodeURIComponent(username)}&l=${encodeURIComponent(license)}&k=${encodeURIComponent(serverKey)}&p=${md5Password}`, { headers: { Accept: 'application/json' } });
        if (!authResponse.ok)
            throw new Error(`Ubiwan auth ${authResponse.status}`);
        const authData = (await authResponse.json());
        if (authData.result !== 201 || !authData.token) {
            throw new Error(`Ubiwan auth failed: result=${authData.result}`);
        }
        const token = authData.token;
        // Fetch all devices via /location
        const locResponse = await fetch(`${apiUrl}/v53/location?token=${encodeURIComponent(token)}&timestamp=0`, { headers: { Accept: 'application/json' } });
        if (!locResponse.ok)
            throw new Error(`Ubiwan location ${locResponse.status}`);
        const locData = (await locResponse.json());
        const devices = locData.location?.data || [];
        // Get existing ubiwanIds
        const existing = await this.getExistingMetadataKeys('ubiwanId');
        let imported = 0;
        for (const dev of devices) {
            const uid = String(dev.uid);
            if (existing.has(uid))
                continue;
            const registration = dev.registration || '';
            const summary = dev.summary || '';
            const imei = dev.dev_hw_id || '';
            const brand = summary.split(' ')[0] || '';
            const model = summary.split(' ').slice(1).join(' ') || '';
            const name = summary || `Ubiwan Device ${uid}`;
            const plate = registration || `UBIWAN-${uid}`;
            const vehicle = await this.vehiclesRepository.save(this.vehiclesRepository.create({
                organizationId: this.orgId,
                name,
                plate,
                brand: brand || undefined,
                model: model || undefined,
                deviceImei: imei || undefined,
                status: 'active',
                metadata: {
                    ubiwanId: uid,
                    ubiwanParent: String(dev.uid_parent || ''),
                    hardware: dev.hardware || '',
                },
            }));
            imported++;
            this.logger.log(`  [UBIWAN] New device: ${name} (uid=${uid}, plate=${plate})`);
            // Ubiwan API only provides current positions (no history endpoint).
            // Store the current position as the initial GPS history record.
            this.seedUbiwanInitialPosition(vehicle.id, dev).catch((err) => this.logger.error(`  [UBIWAN] Initial position seed failed for ${uid}: ${err.message}`));
        }
        return imported;
    }
    /**
     * Ubiwan does not expose a GPS history API — only real-time positions.
     * We store the current position from the discovery response as the
     * first GPS history record. Subsequent positions will be added by
     * the polling pipeline (UbiwanAdapter).
     */
    async seedUbiwanInitialPosition(vehicleId, device) {
        const lat = parseFloat(device.latitude);
        const lng = parseFloat(device.longitude);
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            this.logger.log(`  [UBIWAN] No position data for device ${device.uid}, skipping seed`);
            return;
        }
        await this.gpsHistoryRepository.save(this.gpsHistoryRepository.create({
            vehicleId,
            organizationId: this.orgId,
            lat,
            lng,
            speed: parseFloat(device.speed_current || 0),
            heading: parseFloat(device.course || 0),
            provider: provider_enum_1.Provider.UBIWAN,
            createdAt: device.location_date
                ? new Date(device.location_date * 1000)
                : new Date(),
            metadata: { source: 'discovery_seed' },
        }));
        this.logger.log(`  [UBIWAN] Seeded initial position for device ${device.uid}`);
    }
    // ─── HELPERS ──────────────────────────────────────────────────────────
    /**
     * Get all existing metadata values for a given key to avoid duplicate imports.
     * Returns a Set of string values.
     */
    async getExistingMetadataKeys(key) {
        const results = await this.vehiclesRepository
            .createQueryBuilder('v')
            .select(`v.metadata->>'${key}'`, 'extId')
            .where(`v.metadata->>'${key}' IS NOT NULL`)
            .getRawMany();
        return new Set(results.map((r) => r.extId));
    }
};
exports.TrackerDiscoveryService = TrackerDiscoveryService;
__decorate([
    (0, schedule_1.Cron)('30 0,12 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], TrackerDiscoveryService.prototype, "discoverNewTrackers", null);
exports.TrackerDiscoveryService = TrackerDiscoveryService = TrackerDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(gps_history_entity_1.GpsHistoryEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object, typeof (_d = typeof gps_data_pipeline_service_1.GpsDataPipelineService !== "undefined" && gps_data_pipeline_service_1.GpsDataPipelineService) === "function" ? _d : Object])
], TrackerDiscoveryService);


/***/ }),
/* 96 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuperAdminModule = void 0;
const common_1 = __webpack_require__(3);
const super_admin_service_1 = __webpack_require__(97);
const super_admin_controller_1 = __webpack_require__(98);
const gps_providers_module_1 = __webpack_require__(84);
let SuperAdminModule = class SuperAdminModule {
};
exports.SuperAdminModule = SuperAdminModule;
exports.SuperAdminModule = SuperAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [gps_providers_module_1.GpsProvidersModule],
        controllers: [super_admin_controller_1.SuperAdminController],
        providers: [super_admin_service_1.SuperAdminService],
        exports: [super_admin_service_1.SuperAdminService],
    })
], SuperAdminModule);


/***/ }),
/* 97 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SuperAdminService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuperAdminService = void 0;
const common_1 = __webpack_require__(3);
const gps_providers_service_1 = __webpack_require__(85);
let SuperAdminService = SuperAdminService_1 = class SuperAdminService {
    constructor(gpsProvidersService) {
        this.gpsProvidersService = gpsProvidersService;
        this.logger = new common_1.Logger(SuperAdminService_1.name);
    }
    async getSystemHealth() {
        const providersStatus = await this.gpsProvidersService.getProvidersStatus();
        return {
            status: 'healthy',
            timestamp: new Date(),
            components: {
                database: { status: 'connected' },
                gpsPipeline: { status: 'direct_db', description: 'GPS data persisted directly to PostgreSQL' },
                gpsProviders: providersStatus,
            },
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    }
    async updateSystemConfig(config) {
        this.logger.log('System configuration updated');
        return {
            success: true,
            message: 'System configuration updated',
            config,
        };
    }
    async getAuditLogs(limit = 100, offset = 0) {
        // TODO: Implement audit log retrieval
        return {
            logs: [],
            total: 0,
            limit,
            offset,
        };
    }
    async getSystemStats() {
        return {
            totalOrganizations: 0,
            totalUsers: 0,
            totalVehicles: 0,
            totalAlerts: 0,
            apiCallsToday: 0,
            dataPointsProcessed: 0,
        };
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = SuperAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof gps_providers_service_1.GpsProvidersService !== "undefined" && gps_providers_service_1.GpsProvidersService) === "function" ? _a : Object])
], SuperAdminService);


/***/ }),
/* 98 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuperAdminController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const super_admin_service_1 = __webpack_require__(97);
const system_config_dto_1 = __webpack_require__(99);
const jwt_auth_guard_1 = __webpack_require__(41);
const roles_guard_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(53);
const role_enum_1 = __webpack_require__(19);
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    async getHealth() {
        return this.superAdminService.getSystemHealth();
    }
    async getStats() {
        return this.superAdminService.getSystemStats();
    }
    async getAuditLogs() {
        return this.superAdminService.getAuditLogs();
    }
    async updateConfig(config) {
        return this.superAdminService.updateSystemConfig(config);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], SuperAdminController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], SuperAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], SuperAdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Patch)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Update system configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof system_config_dto_1.SystemConfigDto !== "undefined" && system_config_dto_1.SystemConfigDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], SuperAdminController.prototype, "updateConfig", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, swagger_1.ApiTags)('super-admin'),
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof super_admin_service_1.SuperAdminService !== "undefined" && super_admin_service_1.SuperAdminService) === "function" ? _a : Object])
], SuperAdminController);


/***/ }),
/* 99 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SystemConfigDto = void 0;
const class_validator_1 = __webpack_require__(38);
const swagger_1 = __webpack_require__(2);
class SystemConfigDto {
}
exports.SystemConfigDto = SystemConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], SystemConfigDto.prototype, "gpsProviders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], SystemConfigDto.prototype, "queue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], SystemConfigDto.prototype, "notifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], SystemConfigDto.prototype, "retention", void 0);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(2);
const common_1 = __webpack_require__(3);
const http_exception_filter_1 = __webpack_require__(4);
const logging_interceptor_1 = __webpack_require__(5);
const transform_interceptor_1 = __webpack_require__(7);
const app_module_1 = __webpack_require__(9);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global API prefix
    app.setGlobalPrefix('api', {
        exclude: ['/'],
    });
    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
            : '*',
        credentials: true,
    });
    // Global pipes
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    // Global filters
    const httpAdapterHost = app.get(core_1.HttpAdapterHost);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(httpAdapterHost));
    // Global interceptors
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Fleet Tracker GPS Fleet Management API')
        .setDescription('Complete GPS fleet tracking and management platform')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('organizations', 'Organization management')
        .addTag('vehicles', 'Vehicle management')
        .addTag('gps-history', 'GPS history and tracking')
        .addTag('geofences', 'Geofence management')
        .addTag('alerts', 'Alerts and rules')
        .addTag('reports', 'Report generation')
        .addTag('super-admin', 'Super admin endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            defaultModelsExpandDepth: 2,
        },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`\n🚀 Fleet Tracker API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/docs\n`);
}
bootstrap().catch((error) => {
    console.error('Application bootstrap failed:', error);
    process.exit(1);
});

})();

/******/ })()
;