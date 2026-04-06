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
const user_organization_entity_1 = __webpack_require__(20);
const organization_entity_1 = __webpack_require__(21);
const vehicle_entity_1 = __webpack_require__(22);
const vehicle_group_entity_1 = __webpack_require__(24);
const gps_history_entity_1 = __webpack_require__(25);
const geofence_entity_1 = __webpack_require__(27);
const vehicle_geofence_entity_1 = __webpack_require__(28);
const alert_entity_1 = __webpack_require__(29);
const alert_rule_entity_1 = __webpack_require__(31);
const provider_credentials_entity_1 = __webpack_require__(32);
const trip_entity_1 = __webpack_require__(33);
const guards_module_1 = __webpack_require__(34);
const auth_module_1 = __webpack_require__(36);
const users_module_1 = __webpack_require__(51);
const organizations_module_1 = __webpack_require__(60);
const vehicles_module_1 = __webpack_require__(67);
const gps_history_module_1 = __webpack_require__(73);
const geofences_module_1 = __webpack_require__(77);
const alerts_module_1 = __webpack_require__(82);
const reports_module_1 = __webpack_require__(87);
const gps_providers_module_1 = __webpack_require__(91);
// QueueModule removed: GPS pipeline now persists directly to DB (no Redis needed)
// import { QueueModule } from '@modules/queue/queue.module';
const super_admin_module_1 = __webpack_require__(103);
const trips_module_1 = __webpack_require__(107);
const entities = [
    user_entity_1.UserEntity,
    user_organization_entity_1.UserOrganizationEntity,
    organization_entity_1.OrganizationEntity,
    vehicle_entity_1.VehicleEntity,
    vehicle_group_entity_1.VehicleGroupEntity,
    gps_history_entity_1.GpsHistoryEntity,
    geofence_entity_1.GeofenceEntity,
    vehicle_geofence_entity_1.VehicleGeofenceEntity,
    alert_entity_1.AlertEntity,
    alert_rule_entity_1.AlertRuleEntity,
    provider_credentials_entity_1.ProviderCredentialsEntity,
    trip_entity_1.TripEntity,
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
            guards_module_1.GuardsModule,
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
            trips_module_1.TripsModule,
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
const user_organization_entity_1 = __webpack_require__(20);
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
    (0, typeorm_1.OneToMany)(() => user_organization_entity_1.UserOrganizationEntity, (uo) => uo.userId),
    __metadata("design:type", Array)
], UserEntity.prototype, "organizationMemberships", void 0);
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserOrganizationEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const role_enum_1 = __webpack_require__(19);
/**
 * UserOrganizationEntity
 *
 * Junction table enabling many-to-many relationship between users and organizations.
 * Each row represents a user's membership in one organization, with a role specific
 * to that organization. A user can belong to multiple organizations with different
 * roles in each.
 */
let UserOrganizationEntity = class UserOrganizationEntity {
};
exports.UserOrganizationEntity = UserOrganizationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserOrganizationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserOrganizationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserOrganizationEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: role_enum_1.Role, default: role_enum_1.Role.OPERATOR }),
    __metadata("design:type", typeof (_a = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _a : Object)
], UserOrganizationEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], UserOrganizationEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserOrganizationEntity.prototype, "createdAt", void 0);
exports.UserOrganizationEntity = UserOrganizationEntity = __decorate([
    (0, typeorm_1.Entity)('user_organizations'),
    (0, typeorm_1.Unique)(['userId', 'organizationId'])
], UserOrganizationEntity);


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
    (0, typeorm_1.Column)({ name: 'parent_organization_id', type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "parentOrganizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => OrganizationEntity, (org) => org.children, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_organization_id' }),
    __metadata("design:type", OrganizationEntity)
], OrganizationEntity.prototype, "parentOrganization", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrganizationEntity, (org) => org.parentOrganization),
    __metadata("design:type", Array)
], OrganizationEntity.prototype, "children", void 0);
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
/* 22 */
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
const vehicle_status_enum_1 = __webpack_require__(23);
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
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "currentAltitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], VehicleEntity.prototype, "lastCommunication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: vehicle_status_enum_1.VehicleStatus, default: vehicle_status_enum_1.VehicleStatus.ACTIVE }),
    __metadata("design:type", typeof (_b = typeof vehicle_status_enum_1.VehicleStatus !== "undefined" && vehicle_status_enum_1.VehicleStatus) === "function" ? _b : Object)
], VehicleEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "odometer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "features", void 0);
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
/* 23 */
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
/* 25 */
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
const provider_enum_1 = __webpack_require__(26);
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
/* 26 */
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
/* 29 */
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
const alert_type_enum_1 = __webpack_require__(30);
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
/* 30 */
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
/* 31 */
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
const alert_type_enum_1 = __webpack_require__(30);
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
/* 32 */
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
exports.ProviderCredentialsEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const provider_enum_1 = __webpack_require__(26);
const organization_entity_1 = __webpack_require__(21);
/**
 * ProviderCredentialsEntity
 *
 * Stores GPS provider API credentials per organization.
 * Each organization can have one set of credentials per provider.
 *
 * Credentials are stored as JSONB, with provider-specific fields:
 *
 * FLESPI:    { token }
 * ECHOES:    { apiUrl, accountId, apiKey }
 * KEEPTRACE: { apiUrl, apiKey }
 * UBIWAN:    { apiUrl, username, password, license, serverKey }
 */
let ProviderCredentialsEntity = class ProviderCredentialsEntity {
};
exports.ProviderCredentialsEntity = ProviderCredentialsEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProviderCredentialsEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProviderCredentialsEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.OrganizationEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", typeof (_a = typeof organization_entity_1.OrganizationEntity !== "undefined" && organization_entity_1.OrganizationEntity) === "function" ? _a : Object)
], ProviderCredentialsEntity.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: provider_enum_1.Provider }),
    __metadata("design:type", typeof (_b = typeof provider_enum_1.Provider !== "undefined" && provider_enum_1.Provider) === "function" ? _b : Object)
], ProviderCredentialsEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], ProviderCredentialsEntity.prototype, "credentials", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ProviderCredentialsEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], ProviderCredentialsEntity.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], ProviderCredentialsEntity.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_error', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProviderCredentialsEntity.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], ProviderCredentialsEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], ProviderCredentialsEntity.prototype, "updatedAt", void 0);
exports.ProviderCredentialsEntity = ProviderCredentialsEntity = __decorate([
    (0, typeorm_1.Entity)('provider_credentials'),
    (0, typeorm_1.Unique)(['organizationId', 'provider'])
], ProviderCredentialsEntity);


/***/ }),
/* 33 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TripEntity = void 0;
const typeorm_1 = __webpack_require__(18);
const provider_enum_1 = __webpack_require__(26);
const vehicle_entity_1 = __webpack_require__(22);
const organization_entity_1 = __webpack_require__(21);
let TripEntity = class TripEntity {
};
exports.TripEntity = TripEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TripEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id', type: 'uuid' }),
    __metadata("design:type", String)
], TripEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", typeof (_a = typeof vehicle_entity_1.VehicleEntity !== "undefined" && vehicle_entity_1.VehicleEntity) === "function" ? _a : Object)
], TripEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', type: 'uuid' }),
    __metadata("design:type", String)
], TripEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.OrganizationEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", typeof (_b = typeof organization_entity_1.OrganizationEntity !== "undefined" && organization_entity_1.OrganizationEntity) === "function" ? _b : Object)
], TripEntity.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: provider_enum_1.Provider }),
    __metadata("design:type", typeof (_c = typeof provider_enum_1.Provider !== "undefined" && provider_enum_1.Provider) === "function" ? _c : Object)
], TripEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_trip_id', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TripEntity.prototype, "externalTripId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date_time', type: 'timestamp' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], TripEntity.prototype, "startDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date_time', type: 'timestamp' }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], TripEntity.prototype, "endDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_lat', type: 'float' }),
    __metadata("design:type", Number)
], TripEntity.prototype, "startLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_lng', type: 'float' }),
    __metadata("design:type", Number)
], TripEntity.prototype, "startLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_lat', type: 'float' }),
    __metadata("design:type", Number)
], TripEntity.prototype, "endLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_lng', type: 'float' }),
    __metadata("design:type", Number)
], TripEntity.prototype, "endLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_altitude', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "startAltitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_altitude', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "endAltitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_heading', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "startHeading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_heading', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "endHeading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_address', type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object)
], TripEntity.prototype, "startAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_address', type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_g = typeof Record !== "undefined" && Record) === "function" ? _g : Object)
], TripEntity.prototype, "endAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_mileage', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "startMileage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_mileage', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "endMileage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'distance', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "distance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TripEntity.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_h = typeof Record !== "undefined" && Record) === "function" ? _h : Object)
], TripEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", typeof (_j = typeof Date !== "undefined" && Date) === "function" ? _j : Object)
], TripEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", typeof (_k = typeof Date !== "undefined" && Date) === "function" ? _k : Object)
], TripEntity.prototype, "updatedAt", void 0);
exports.TripEntity = TripEntity = __decorate([
    (0, typeorm_1.Entity)('trips'),
    (0, typeorm_1.Unique)(['vehicleId', 'externalTripId']),
    (0, typeorm_1.Index)(['vehicleId']),
    (0, typeorm_1.Index)(['organizationId']),
    (0, typeorm_1.Index)(['startDateTime'])
], TripEntity);


/***/ }),
/* 34 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GuardsModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const tenant_guard_1 = __webpack_require__(35);
const organization_entity_1 = __webpack_require__(21);
/**
 * Global module that provides TenantGuard with its required dependencies.
 * TenantGuard needs OrganizationEntity repository to check parent-child
 * organization relationships for multi-tenant access control.
 */
let GuardsModule = class GuardsModule {
};
exports.GuardsModule = GuardsModule;
exports.GuardsModule = GuardsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([organization_entity_1.OrganizationEntity])],
        providers: [tenant_guard_1.TenantGuard],
        exports: [tenant_guard_1.TenantGuard, typeorm_1.TypeOrmModule],
    })
], GuardsModule);


/***/ }),
/* 35 */
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
exports.TenantGuard = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const organization_entity_1 = __webpack_require__(21);
const role_enum_1 = __webpack_require__(19);
let TenantGuard = class TenantGuard {
    constructor(organizationsRepository) {
        this.organizationsRepository = organizationsRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user || !user.organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        // SUPER_ADMIN bypasses tenant checks entirely
        if (user.role === role_enum_1.Role.SUPER_ADMIN) {
            const organizationIdParam = request.params.organizationId || request.query.organizationId;
            request.organizationId = organizationIdParam || user.organizationId;
            return true;
        }
        // Extract organizationId from request params or query
        const organizationIdParam = request.params.organizationId || request.query.organizationId;
        if (!organizationIdParam) {
            // No specific org requested — use user's org
            request.organizationId = user.organizationId;
            return true;
        }
        // Same org — always allowed
        if (organizationIdParam === user.organizationId) {
            request.organizationId = user.organizationId;
            return true;
        }
        // Check if user's org is the parent of the requested org (parent → sub-client access)
        const targetOrg = await this.organizationsRepository.findOne({
            where: { id: organizationIdParam },
            select: ['id', 'parentOrganizationId'],
        });
        if (targetOrg && targetOrg.parentOrganizationId === user.organizationId) {
            // User's org is the parent of the target — allowed (ADMIN/MANAGER only)
            if (user.role === role_enum_1.Role.ADMIN || user.role === role_enum_1.Role.MANAGER) {
                request.organizationId = organizationIdParam;
                return true;
            }
        }
        throw new common_1.ForbiddenException('Cannot access other organizations');
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.OrganizationEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TenantGuard);


/***/ }),
/* 36 */
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
const jwt_1 = __webpack_require__(37);
const passport_1 = __webpack_require__(38);
const config_1 = __webpack_require__(10);
const auth_service_1 = __webpack_require__(39);
const auth_controller_1 = __webpack_require__(41);
const jwt_strategy_1 = __webpack_require__(49);
const user_entity_1 = __webpack_require__(17);
const user_organization_entity_1 = __webpack_require__(20);
const organization_entity_1 = __webpack_require__(21);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity, user_organization_entity_1.UserOrganizationEntity, organization_entity_1.OrganizationEntity]),
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
/* 37 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 39 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const jwt_1 = __webpack_require__(37);
const config_1 = __webpack_require__(10);
const bcrypt = __importStar(__webpack_require__(40));
const user_entity_1 = __webpack_require__(17);
const user_organization_entity_1 = __webpack_require__(20);
const organization_entity_1 = __webpack_require__(21);
const role_enum_1 = __webpack_require__(19);
let AuthService = class AuthService {
    constructor(usersRepository, organizationsRepository, userOrganizationsRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.organizationsRepository = organizationsRepository;
        this.userOrganizationsRepository = userOrganizationsRepository;
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
        // Get all organizations this user belongs to
        const memberships = await this.userOrganizationsRepository.find({
            where: { userId: user.id, isActive: true },
        });
        // If user has memberships, use the home org's role; otherwise fallback to legacy
        const homeOrgMembership = memberships.find((m) => m.organizationId === user.organizationId);
        const activeRole = homeOrgMembership?.role || user.role;
        return this.generateTokens(user, user.organizationId, activeRole, memberships);
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
        // Create user-organization membership
        const membership = this.userOrganizationsRepository.create({
            userId: savedUser.id,
            organizationId: savedOrg.id,
            role: role_enum_1.Role.ADMIN,
            isActive: true,
        });
        await this.userOrganizationsRepository.save(membership);
        return this.generateTokens(savedUser, savedOrg.id, role_enum_1.Role.ADMIN, [membership]);
    }
    /**
     * Switch active organization for a user.
     * Returns a new JWT token scoped to the target organization.
     */
    async switchOrganization(userId, targetOrganizationId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        // Check user has membership in target org
        const membership = await this.userOrganizationsRepository.findOne({
            where: { userId, organizationId: targetOrganizationId, isActive: true },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this organization');
        }
        // Verify the org exists and is active
        const org = await this.organizationsRepository.findOne({
            where: { id: targetOrganizationId, isActive: true },
        });
        if (!org) {
            throw new common_1.ForbiddenException('Organization is not active');
        }
        // Get all memberships for the response
        const allMemberships = await this.userOrganizationsRepository.find({
            where: { userId, isActive: true },
        });
        return this.generateTokens(user, targetOrganizationId, membership.role, allMemberships);
    }
    /**
     * Get all organizations a user belongs to.
     */
    async getUserOrganizations(userId) {
        const memberships = await this.userOrganizationsRepository.find({
            where: { userId, isActive: true },
        });
        const orgIds = memberships.map((m) => m.organizationId);
        if (orgIds.length === 0)
            return [];
        const orgs = await this.organizationsRepository
            .createQueryBuilder('o')
            .where('o.id IN (:...orgIds)', { orgIds })
            .getMany();
        return orgs.map((org) => {
            const membership = memberships.find((m) => m.organizationId === org.id);
            return {
                id: org.id,
                name: org.name,
                slug: org.slug,
                role: membership.role,
                isActive: org.isActive,
                parentOrganizationId: org.parentOrganizationId,
            };
        });
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
    generateTokens(user, activeOrgId, activeRole, memberships) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: activeRole,
            organizationId: activeOrgId,
            homeOrganizationId: user.organizationId,
        };
        const expiresIn = this.configService.get('JWT_EXPIRATION');
        const accessToken = this.jwtService.sign(payload, { expiresIn });
        // Include list of user's organizations in response
        const organizations = memberships.map((m) => ({
            organizationId: m.organizationId,
            role: m.role,
        }));
        return {
            accessToken,
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: activeRole,
                organizationId: activeOrgId,
            },
            organizations,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.OrganizationEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_organization_entity_1.UserOrganizationEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], AuthService);


/***/ }),
/* 40 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 41 */
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
exports.AuthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(39);
const login_dto_1 = __webpack_require__(42);
const register_dto_1 = __webpack_require__(44);
const auth_response_dto_1 = __webpack_require__(45);
const jwt_auth_guard_1 = __webpack_require__(46);
const current_user_decorator_1 = __webpack_require__(47);
const user_payload_interface_1 = __webpack_require__(48);
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
            homeOrganizationId: user.homeOrganizationId,
        };
    }
    /**
     * Get all organizations the current user belongs to.
     * Used by the frontend to display the org switcher.
     */
    async getUserOrganizations(user) {
        return this.authService.getUserOrganizations(user.userId);
    }
    /**
     * Switch to a different organization.
     * Returns a new JWT scoped to the target org.
     */
    async switchOrganization(user, body) {
        return this.authService.switchOrganization(user.userId, body.organizationId);
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
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof user_payload_interface_1.UserPayload !== "undefined" && user_payload_interface_1.UserPayload) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get organizations the user belongs to' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof user_payload_interface_1.UserPayload !== "undefined" && user_payload_interface_1.UserPayload) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AuthController.prototype, "getUserOrganizations", null);
__decorate([
    (0, common_1.Post)('switch-organization'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Switch active organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof user_payload_interface_1.UserPayload !== "undefined" && user_payload_interface_1.UserPayload) === "function" ? _k : Object, Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AuthController.prototype, "switchOrganization", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Logout' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 42 */
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
const class_validator_1 = __webpack_require__(43);
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
/* 43 */
/***/ ((module) => {

module.exports = require("class-validator");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(43);
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
/* 45 */
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
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", typeof (_a = typeof Array !== "undefined" && Array) === "function" ? _a : Object)
], AuthResponseDto.prototype, "organizations", void 0);


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
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(38);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 47 */
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
/* 48 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(38);
const passport_jwt_1 = __webpack_require__(50);
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
/* 50 */
/***/ ((module) => {

module.exports = require("passport-jwt");

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
exports.UsersModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const users_service_1 = __webpack_require__(52);
const users_controller_1 = __webpack_require__(53);
const user_entity_1 = __webpack_require__(17);
const user_organization_entity_1 = __webpack_require__(20);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity, user_organization_entity_1.UserOrganizationEntity])],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),
/* 52 */
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
const bcrypt = __importStar(__webpack_require__(40));
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
/* 53 */
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
const users_service_1 = __webpack_require__(52);
const create_user_dto_1 = __webpack_require__(54);
const update_user_dto_1 = __webpack_require__(55);
const user_entity_1 = __webpack_require__(17);
const jwt_auth_guard_1 = __webpack_require__(46);
const tenant_guard_1 = __webpack_require__(35);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
const role_enum_1 = __webpack_require__(19);
const pagination_dto_1 = __webpack_require__(58);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const class_validator_1 = __webpack_require__(43);
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
/* 55 */
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
const class_validator_1 = __webpack_require__(43);
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
/* 56 */
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
const roles_decorator_1 = __webpack_require__(57);
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
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(3);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationDto = exports.SortOrder = void 0;
const class_validator_1 = __webpack_require__(43);
const class_transformer_1 = __webpack_require__(59);
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
/* 59 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 60 */
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
const organizations_service_1 = __webpack_require__(61);
const organizations_controller_1 = __webpack_require__(62);
const organization_entity_1 = __webpack_require__(21);
const provider_credentials_entity_1 = __webpack_require__(32);
let OrganizationsModule = class OrganizationsModule {
};
exports.OrganizationsModule = OrganizationsModule;
exports.OrganizationsModule = OrganizationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([organization_entity_1.OrganizationEntity, provider_credentials_entity_1.ProviderCredentialsEntity])],
        controllers: [organizations_controller_1.OrganizationsController],
        providers: [organizations_service_1.OrganizationsService],
        exports: [organizations_service_1.OrganizationsService],
    })
], OrganizationsModule);


/***/ }),
/* 61 */
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
exports.OrganizationsService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const organization_entity_1 = __webpack_require__(21);
const provider_credentials_entity_1 = __webpack_require__(32);
const provider_enum_1 = __webpack_require__(26);
let OrganizationsService = class OrganizationsService {
    constructor(organizationsRepository, providerCredentialsRepository) {
        this.organizationsRepository = organizationsRepository;
        this.providerCredentialsRepository = providerCredentialsRepository;
    }
    // ─── ORGANIZATIONS CRUD ──────────────────────────────────────────────
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
        return this.organizationsRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['children'],
        });
    }
    async findById(id) {
        const org = await this.organizationsRepository.findOne({
            where: { id },
            relations: ['children'],
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async update(id, updateDto) {
        await this.findById(id);
        await this.organizationsRepository.update(id, updateDto);
        return this.findById(id);
    }
    async remove(id) {
        await this.findById(id);
        await this.organizationsRepository.delete(id);
    }
    // ─── SUB-CLIENTS ─────────────────────────────────────────────────────
    /**
     * Create a sub-client under a parent organization.
     * The caller must be ADMIN of the parent org or SUPER_ADMIN.
     */
    async createSubClient(parentOrgId, dto) {
        // Verify parent exists
        const parent = await this.findById(parentOrgId);
        // Check slug uniqueness
        const existing = await this.organizationsRepository.findOne({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.BadRequestException('Organization with this slug already exists');
        }
        const subClient = this.organizationsRepository.create({
            name: dto.name,
            slug: dto.slug,
            settings: dto.settings,
            parentOrganizationId: parentOrgId,
            isActive: true,
            subscriptionStatus: 'active',
        });
        return this.organizationsRepository.save(subClient);
    }
    /**
     * List all sub-clients of a parent organization.
     */
    async findSubClients(parentOrgId) {
        return this.organizationsRepository.find({
            where: { parentOrganizationId: parentOrgId },
            order: { name: 'ASC' },
            relations: ['children'],
        });
    }
    /**
     * Get all organization IDs that a parent org can access
     * (itself + all descendants recursively, unlimited depth).
     * Uses a recursive CTE for performance.
     */
    async getAccessibleOrgIds(orgId) {
        const result = await this.organizationsRepository.query(`
      WITH RECURSIVE org_tree AS (
        SELECT id FROM organizations WHERE id = $1
        UNION ALL
        SELECT o.id FROM organizations o
        INNER JOIN org_tree t ON o.parent_organization_id = t.id
      )
      SELECT id FROM org_tree
      `, [orgId]);
        return result.map((r) => r.id);
    }
    /**
     * Get the full hierarchy tree for an organization (with children nested).
     */
    async getOrganizationTree(orgId) {
        const org = await this.findById(orgId);
        await this.loadChildrenRecursive(org);
        return org;
    }
    async loadChildrenRecursive(org) {
        const children = await this.organizationsRepository.find({
            where: { parentOrganizationId: org.id },
            order: { name: 'ASC' },
        });
        org.children = children;
        for (const child of children) {
            await this.loadChildrenRecursive(child);
        }
    }
    /**
     * Check if orgA is an ancestor of orgB (or same org).
     * Works for unlimited depth.
     */
    async isAncestorOrSelf(ancestorOrgId, targetOrgId) {
        if (ancestorOrgId === targetOrgId)
            return true;
        const accessibleIds = await this.getAccessibleOrgIds(ancestorOrgId);
        return accessibleIds.includes(targetOrgId);
    }
    // ─── PROVIDER CREDENTIALS ────────────────────────────────────────────
    /**
     * List all provider credentials for an organization.
     * Credentials values are masked in the response.
     */
    async findProviderCredentials(orgId) {
        return this.providerCredentialsRepository.find({
            where: { organizationId: orgId },
            order: { provider: 'ASC' },
        });
    }
    /**
     * Get raw (unmasked) credentials for a specific provider+org.
     * Used internally by adapters — not exposed via API.
     */
    async getProviderCredentials(orgId, provider) {
        return this.providerCredentialsRepository.findOne({
            where: { organizationId: orgId, provider, isActive: true },
        });
    }
    /**
     * Get all active credentials for a given provider across all organizations.
     * Used by TrackerDiscoveryService to discover trackers per org.
     */
    async getAllActiveCredentialsByProvider(provider) {
        return this.providerCredentialsRepository.find({
            where: { provider, isActive: true },
        });
    }
    /**
     * Get all active credentials across all providers and orgs.
     */
    async getAllActiveCredentials() {
        return this.providerCredentialsRepository.find({
            where: { isActive: true },
        });
    }
    /**
     * Upsert (create or update) provider credentials for an organization.
     */
    async upsertProviderCredentials(orgId, dto) {
        // Validate credential fields per provider
        this.validateCredentialFields(dto.provider, dto.credentials);
        let existing = await this.providerCredentialsRepository.findOne({
            where: { organizationId: orgId, provider: dto.provider },
        });
        if (existing) {
            existing.credentials = dto.credentials;
            if (dto.label !== undefined)
                existing.label = dto.label;
            if (dto.isActive !== undefined)
                existing.isActive = dto.isActive;
            return this.providerCredentialsRepository.save(existing);
        }
        const entity = this.providerCredentialsRepository.create({
            organizationId: orgId,
            provider: dto.provider,
            credentials: dto.credentials,
            label: dto.label,
            isActive: dto.isActive ?? true,
        });
        return this.providerCredentialsRepository.save(entity);
    }
    /**
     * Delete provider credentials for an org+provider.
     */
    async deleteProviderCredentials(orgId, provider) {
        const result = await this.providerCredentialsRepository.delete({
            organizationId: orgId,
            provider,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`No ${provider} credentials found for this organization`);
        }
    }
    /**
     * Validate that required fields are present for each provider type.
     */
    validateCredentialFields(provider, credentials) {
        const requiredFields = {
            [provider_enum_1.Provider.FLESPI]: ['token'],
            [provider_enum_1.Provider.ECHOES]: ['apiKey', 'accountId'],
            [provider_enum_1.Provider.KEEPTRACE]: ['apiKey'],
            [provider_enum_1.Provider.UBIWAN]: ['username', 'password', 'license'],
        };
        const required = requiredFields[provider];
        if (!required)
            return;
        const missing = required.filter((f) => !credentials[f]);
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`Missing required credential fields for ${provider}: ${missing.join(', ')}`);
        }
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.OrganizationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(provider_credentials_entity_1.ProviderCredentialsEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], OrganizationsService);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const organizations_service_1 = __webpack_require__(61);
const create_organization_dto_1 = __webpack_require__(63);
const update_organization_dto_1 = __webpack_require__(64);
const create_sub_client_dto_1 = __webpack_require__(65);
const upsert_provider_credentials_dto_1 = __webpack_require__(66);
const organization_entity_1 = __webpack_require__(21);
const jwt_auth_guard_1 = __webpack_require__(46);
const roles_guard_1 = __webpack_require__(56);
const tenant_guard_1 = __webpack_require__(35);
const roles_decorator_1 = __webpack_require__(57);
const role_enum_1 = __webpack_require__(19);
const provider_enum_1 = __webpack_require__(26);
let OrganizationsController = class OrganizationsController {
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    // ─── TOP-LEVEL ORG CRUD (SUPER_ADMIN ONLY) ───────────────────────────
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
    // ─── SUB-CLIENTS ─────────────────────────────────────────────────────
    async createSubClient(orgId, dto) {
        return this.organizationsService.createSubClient(orgId, dto);
    }
    async findSubClients(orgId) {
        return this.organizationsService.findSubClients(orgId);
    }
    async getOrganizationTree(orgId) {
        return this.organizationsService.getOrganizationTree(orgId);
    }
    async getAccessibleOrgIds(orgId) {
        return this.organizationsService.getAccessibleOrgIds(orgId);
    }
    // ─── PROVIDER CREDENTIALS ────────────────────────────────────────────
    async findProviderCredentials(orgId) {
        const creds = await this.organizationsService.findProviderCredentials(orgId);
        // Mask sensitive credential values in response
        return creds.map((c) => ({
            ...c,
            credentials: this.maskCredentials(c.credentials),
        }));
    }
    async upsertProviderCredentials(orgId, dto) {
        const saved = await this.organizationsService.upsertProviderCredentials(orgId, dto);
        return {
            ...saved,
            credentials: this.maskCredentials(saved.credentials),
        };
    }
    async deleteProviderCredentials(orgId, provider) {
        await this.organizationsService.deleteProviderCredentials(orgId, provider);
        return { message: `${provider} credentials deleted` };
    }
    // ─── HELPERS ──────────────────────────────────────────────────────────
    /**
     * Mask credential values for safe API response.
     * Shows only last 4 characters of each value.
     */
    maskCredentials(creds) {
        const masked = {};
        for (const [key, value] of Object.entries(creds)) {
            if (typeof value === 'string' && value.length > 4) {
                masked[key] = '***' + value.slice(-4);
            }
            else {
                masked[key] = '****';
            }
        }
        return masked;
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create top-level organization (super-admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: organization_entity_1.OrganizationEntity }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_organization_dto_1.CreateOrganizationDto !== "undefined" && create_organization_dto_1.CreateOrganizationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List all organizations with sub-clients (super-admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization details' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Delete organization (super-admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], OrganizationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':organizationId/sub-clients'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a sub-client under this organization' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: organization_entity_1.OrganizationEntity }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_j = typeof create_sub_client_dto_1.CreateSubClientDto !== "undefined" && create_sub_client_dto_1.CreateSubClientDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], OrganizationsController.prototype, "createSubClient", null);
__decorate([
    (0, common_1.Get)(':organizationId/sub-clients'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List sub-clients of this organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, isArray: true }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], OrganizationsController.prototype, "findSubClients", null);
__decorate([
    (0, common_1.Get)(':organizationId/tree'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get full hierarchy tree for this organization' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], OrganizationsController.prototype, "getOrganizationTree", null);
__decorate([
    (0, common_1.Get)(':organizationId/accessible-ids'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all org IDs this organization can access (recursive)' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], OrganizationsController.prototype, "getAccessibleOrgIds", null);
__decorate([
    (0, common_1.Get)(':organizationId/provider-credentials'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List GPS provider credentials for this organization' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], OrganizationsController.prototype, "findProviderCredentials", null);
__decorate([
    (0, common_1.Post)(':organizationId/provider-credentials'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update GPS provider credentials' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_q = typeof upsert_provider_credentials_dto_1.UpsertProviderCredentialsDto !== "undefined" && upsert_provider_credentials_dto_1.UpsertProviderCredentialsDto) === "function" ? _q : Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], OrganizationsController.prototype, "upsertProviderCredentials", null);
__decorate([
    (0, common_1.Delete)(':organizationId/provider-credentials/:provider'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete GPS provider credentials' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_s = typeof provider_enum_1.Provider !== "undefined" && provider_enum_1.Provider) === "function" ? _s : Object]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], OrganizationsController.prototype, "deleteProviderCredentials", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('organizations'),
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _a : Object])
], OrganizationsController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateOrganizationDto = void 0;
const class_validator_1 = __webpack_require__(43);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateOrganizationDto = void 0;
const class_validator_1 = __webpack_require__(43);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateSubClientDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
class CreateSubClientDto {
}
exports.CreateSubClientDto = CreateSubClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sub-client organization name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubClientDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL-friendly slug (lowercase, numbers, hyphens)' }),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: 'slug must contain only lowercase letters, numbers, and hyphens',
    }),
    __metadata("design:type", String)
], CreateSubClientDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional settings for the sub-client' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateSubClientDto.prototype, "settings", void 0);


/***/ }),
/* 66 */
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
exports.UpsertProviderCredentialsDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
const provider_enum_1 = __webpack_require__(26);
class UpsertProviderCredentialsDto {
}
exports.UpsertProviderCredentialsDto = UpsertProviderCredentialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: provider_enum_1.Provider, description: 'GPS provider type' }),
    (0, class_validator_1.IsEnum)(provider_enum_1.Provider),
    __metadata("design:type", typeof (_a = typeof provider_enum_1.Provider !== "undefined" && provider_enum_1.Provider) === "function" ? _a : Object)
], UpsertProviderCredentialsDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provider-specific credentials. FLESPI: {token}. ECHOES: {apiUrl,accountId,apiKey}. KEEPTRACE: {apiUrl,apiKey}. UBIWAN: {apiUrl,username,password,license,serverKey}.',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], UpsertProviderCredentialsDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display label for this credential set' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertProviderCredentialsDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether this credential set is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpsertProviderCredentialsDto.prototype, "isActive", void 0);


/***/ }),
/* 67 */
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
const vehicles_service_1 = __webpack_require__(68);
const vehicles_controller_1 = __webpack_require__(69);
const vehicle_entity_1 = __webpack_require__(22);
const vehicle_group_entity_1 = __webpack_require__(24);
const gps_history_entity_1 = __webpack_require__(25);
let VehiclesModule = class VehiclesModule {
};
exports.VehiclesModule = VehiclesModule;
exports.VehiclesModule = VehiclesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vehicle_entity_1.VehicleEntity, vehicle_group_entity_1.VehicleGroupEntity, gps_history_entity_1.GpsHistoryEntity])],
        controllers: [vehicles_controller_1.VehiclesController],
        providers: [vehicles_service_1.VehiclesService],
        exports: [vehicles_service_1.VehiclesService],
    })
], VehiclesModule);


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
exports.VehiclesService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const vehicle_entity_1 = __webpack_require__(22);
const vehicle_group_entity_1 = __webpack_require__(24);
const gps_history_entity_1 = __webpack_require__(25);
let VehiclesService = class VehiclesService {
    constructor(vehiclesRepository, vehicleGroupsRepository, gpsHistoryRepository) {
        this.vehiclesRepository = vehiclesRepository;
        this.vehicleGroupsRepository = vehicleGroupsRepository;
        this.gpsHistoryRepository = gpsHistoryRepository;
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
    // ─── BULK ASSIGN ─────────────────────────────────────────────────────
    /**
     * Bulk reassign vehicles from current org to a target sub-client org.
     * Also moves the associated GPS history records.
     * The caller must own the vehicles (be in their organizationId).
     */
    async bulkAssignVehicles(callerOrgId, dto) {
        const { vehicleIds, targetOrganizationId } = dto;
        // Verify all vehicles belong to caller's org
        const vehicles = await this.vehiclesRepository.find({
            where: { id: (0, typeorm_2.In)(vehicleIds) },
        });
        const notOwned = vehicles.filter((v) => v.organizationId !== callerOrgId);
        if (notOwned.length > 0) {
            throw new common_1.ForbiddenException(`Cannot assign vehicles that don't belong to your organization`);
        }
        const missing = vehicleIds.filter((id) => !vehicles.find((v) => v.id === id));
        if (missing.length > 0) {
            throw new common_1.NotFoundException(`Vehicles not found: ${missing.join(', ')}`);
        }
        // Reassign vehicles
        await this.vehiclesRepository.update({ id: (0, typeorm_2.In)(vehicleIds) }, { organizationId: targetOrganizationId });
        // Also reassign GPS history records for these vehicles
        await this.gpsHistoryRepository.update({ vehicleId: (0, typeorm_2.In)(vehicleIds) }, { organizationId: targetOrganizationId });
        return { assigned: vehicleIds.length };
    }
    /**
     * Bulk unassign vehicles — move them back from sub-client to parent org.
     */
    async bulkUnassignVehicles(callerOrgId, vehicleIds) {
        const vehicles = await this.vehiclesRepository.find({
            where: { id: (0, typeorm_2.In)(vehicleIds) },
        });
        // Reassign back to caller's org
        await this.vehiclesRepository.update({ id: (0, typeorm_2.In)(vehicleIds) }, { organizationId: callerOrgId });
        await this.gpsHistoryRepository.update({ vehicleId: (0, typeorm_2.In)(vehicleIds) }, { organizationId: callerOrgId });
        return { unassigned: vehicleIds.length };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_group_entity_1.VehicleGroupEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(gps_history_entity_1.GpsHistoryEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], VehiclesService);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const vehicles_service_1 = __webpack_require__(68);
const create_vehicle_dto_1 = __webpack_require__(70);
const update_vehicle_dto_1 = __webpack_require__(71);
const bulk_assign_vehicles_dto_1 = __webpack_require__(72);
const vehicle_entity_1 = __webpack_require__(22);
const jwt_auth_guard_1 = __webpack_require__(46);
const tenant_guard_1 = __webpack_require__(35);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
const role_enum_1 = __webpack_require__(19);
const pagination_dto_1 = __webpack_require__(58);
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
    // ─── BULK ASSIGN ─────────────────────────────────────────────────────
    async bulkAssign(organizationId, dto) {
        return this.vehiclesService.bulkAssignVehicles(organizationId, dto);
    }
    async bulkUnassign(organizationId, body) {
        return this.vehiclesService.bulkUnassignVehicles(organizationId, body.vehicleIds);
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
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk assign vehicles to a sub-client organization' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_k = typeof bulk_assign_vehicles_dto_1.BulkAssignVehiclesDto !== "undefined" && bulk_assign_vehicles_dto_1.BulkAssignVehiclesDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], VehiclesController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Post)('bulk-unassign'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk unassign vehicles back to parent organization' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], VehiclesController.prototype, "bulkUnassign", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('vehicles'),
    (0, common_1.Controller)('organizations/:organizationId/vehicles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof vehicles_service_1.VehiclesService !== "undefined" && vehicles_service_1.VehiclesService) === "function" ? _a : Object])
], VehiclesController);


/***/ }),
/* 70 */
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
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
const vehicle_status_enum_1 = __webpack_require__(23);
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateVehicleDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
const vehicle_status_enum_1 = __webpack_require__(23);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BulkAssignVehiclesDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
class BulkAssignVehiclesDto {
}
exports.BulkAssignVehiclesDto = BulkAssignVehiclesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of vehicle IDs to reassign', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], BulkAssignVehiclesDto.prototype, "vehicleIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target organization (sub-client) ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BulkAssignVehiclesDto.prototype, "targetOrganizationId", void 0);


/***/ }),
/* 73 */
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
const gps_history_service_1 = __webpack_require__(74);
const gps_history_controller_1 = __webpack_require__(75);
const gps_history_entity_1 = __webpack_require__(25);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const gps_history_entity_1 = __webpack_require__(25);
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
/* 75 */
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
const gps_history_service_1 = __webpack_require__(74);
const query_history_dto_1 = __webpack_require__(76);
const jwt_auth_guard_1 = __webpack_require__(46);
const tenant_guard_1 = __webpack_require__(35);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryHistoryDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(59);
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
/* 77 */
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
const geofences_service_1 = __webpack_require__(78);
const geofences_controller_1 = __webpack_require__(79);
const geofence_entity_1 = __webpack_require__(27);
const vehicle_geofence_entity_1 = __webpack_require__(28);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const geofence_entity_1 = __webpack_require__(27);
const vehicle_geofence_entity_1 = __webpack_require__(28);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const geofences_service_1 = __webpack_require__(78);
const create_geofence_dto_1 = __webpack_require__(80);
const update_geofence_dto_1 = __webpack_require__(81);
const geofence_entity_1 = __webpack_require__(27);
const jwt_auth_guard_1 = __webpack_require__(46);
const tenant_guard_1 = __webpack_require__(35);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
const role_enum_1 = __webpack_require__(19);
const pagination_dto_1 = __webpack_require__(58);
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
/* 80 */
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
const class_validator_1 = __webpack_require__(43);
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
/* 81 */
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
const class_validator_1 = __webpack_require__(43);
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
/* 82 */
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
const alerts_service_1 = __webpack_require__(83);
const alerts_controller_1 = __webpack_require__(84);
const alert_entity_1 = __webpack_require__(29);
const alert_rule_entity_1 = __webpack_require__(31);
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const alert_entity_1 = __webpack_require__(29);
const alert_rule_entity_1 = __webpack_require__(31);
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
/* 84 */
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
const alerts_service_1 = __webpack_require__(83);
const alert_entity_1 = __webpack_require__(29);
const alert_rule_entity_1 = __webpack_require__(31);
const create_alert_rule_dto_1 = __webpack_require__(85);
const query_alerts_dto_1 = __webpack_require__(86);
const jwt_auth_guard_1 = __webpack_require__(46);
const tenant_guard_1 = __webpack_require__(35);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
const current_user_decorator_1 = __webpack_require__(47);
const role_enum_1 = __webpack_require__(19);
const user_payload_interface_1 = __webpack_require__(48);
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateAlertRuleDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
const alert_type_enum_1 = __webpack_require__(30);
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryAlertsDto = void 0;
const class_validator_1 = __webpack_require__(43);
const swagger_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(59);
const pagination_dto_1 = __webpack_require__(58);
const alert_type_enum_1 = __webpack_require__(30);
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
/* 87 */
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
const reports_service_1 = __webpack_require__(88);
const reports_controller_1 = __webpack_require__(90);
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
/* 88 */
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
const generate_report_dto_1 = __webpack_require__(89);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateReportDto = exports.ReportFormat = exports.ReportType = void 0;
const class_validator_1 = __webpack_require__(43);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const reports_service_1 = __webpack_require__(88);
const generate_report_dto_1 = __webpack_require__(89);
const jwt_auth_guard_1 = __webpack_require__(46);
const tenant_guard_1 = __webpack_require__(35);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
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
/* 91 */
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
const gps_providers_service_1 = __webpack_require__(92);
const gps_data_pipeline_service_1 = __webpack_require__(98);
const flespi_adapter_1 = __webpack_require__(93);
const echoes_adapter_1 = __webpack_require__(95);
const ubiwan_adapter_1 = __webpack_require__(96);
const keeptrace_adapter_1 = __webpack_require__(97);
const data_normalizer_service_1 = __webpack_require__(94);
const tracker_discovery_service_1 = __webpack_require__(102);
const gps_gateway_1 = __webpack_require__(99);
const vehicle_entity_1 = __webpack_require__(22);
const gps_history_entity_1 = __webpack_require__(25);
const provider_credentials_entity_1 = __webpack_require__(32);
const trip_entity_1 = __webpack_require__(33);
let GpsProvidersModule = class GpsProvidersModule {
};
exports.GpsProvidersModule = GpsProvidersModule;
exports.GpsProvidersModule = GpsProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([vehicle_entity_1.VehicleEntity, gps_history_entity_1.GpsHistoryEntity, provider_credentials_entity_1.ProviderCredentialsEntity, trip_entity_1.TripEntity]),
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
            tracker_discovery_service_1.TrackerDiscoveryService,
        ],
    })
], GpsProvidersModule);


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
var GpsProvidersService_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsProvidersService = void 0;
const common_1 = __webpack_require__(3);
const flespi_adapter_1 = __webpack_require__(93);
const echoes_adapter_1 = __webpack_require__(95);
const ubiwan_adapter_1 = __webpack_require__(96);
const keeptrace_adapter_1 = __webpack_require__(97);
const data_normalizer_service_1 = __webpack_require__(94);
const gps_data_pipeline_service_1 = __webpack_require__(98);
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
/* 93 */
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
const data_normalizer_service_1 = __webpack_require__(94);
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
/* 94 */
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
const provider_enum_1 = __webpack_require__(26);
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
var EchoesAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EchoesAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(94);
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
/* 96 */
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
const data_normalizer_service_1 = __webpack_require__(94);
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
var KeepTraceAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeepTraceAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(94);
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
var GpsDataPipelineService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsDataPipelineService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const vehicle_entity_1 = __webpack_require__(22);
const gps_history_entity_1 = __webpack_require__(25);
const gps_gateway_1 = __webpack_require__(99);
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
var GpsGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsGateway = void 0;
const websockets_1 = __webpack_require__(100);
const common_1 = __webpack_require__(3);
const socket_io_1 = __webpack_require__(101);
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
/* 100 */
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),
/* 101 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 102 */
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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackerDiscoveryService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const vehicle_entity_1 = __webpack_require__(22);
const gps_history_entity_1 = __webpack_require__(25);
const provider_credentials_entity_1 = __webpack_require__(32);
const trip_entity_1 = __webpack_require__(33);
const provider_enum_1 = __webpack_require__(26);
const gps_data_pipeline_service_1 = __webpack_require__(98);
/**
 * TrackerDiscoveryService — Multi-Org Edition
 *
 * Scans all GPS providers every 12 hours to detect new trackers/devices.
 * Works per-organization: each org has its own provider credentials
 * stored in the provider_credentials table. Falls back to env vars for
 * backward compatibility (legacy single-org mode).
 */
let TrackerDiscoveryService = TrackerDiscoveryService_1 = class TrackerDiscoveryService {
    constructor(vehiclesRepository, gpsHistoryRepository, providerCredentialsRepository, tripsRepository, configService, pipeline) {
        this.vehiclesRepository = vehiclesRepository;
        this.gpsHistoryRepository = gpsHistoryRepository;
        this.providerCredentialsRepository = providerCredentialsRepository;
        this.tripsRepository = tripsRepository;
        this.configService = configService;
        this.pipeline = pipeline;
        this.logger = new common_1.Logger(TrackerDiscoveryService_1.name);
        this.HISTORY_BACKFILL_DAYS = 30;
    }
    /** Default org (fallback for env var credentials) */
    get defaultOrgId() {
        return this.configService.get('DEFAULT_ORG_ID', 'a040ba4f-e427-4a9c-abc4-dce3dc05d24f');
    }
    // ═══════════════════════════════════════════════════════════════════════
    // DISCOVERY CRON — runs for ALL orgs that have credentials
    // ═══════════════════════════════════════════════════════════════════════
    async discoverNewTrackers() {
        this.logger.log('=== Tracker Discovery: scanning all orgs for new devices ===');
        // Load all active credentials from DB
        const allCreds = await this.providerCredentialsRepository.find({
            where: { isActive: true },
        });
        // Group by orgId
        const credsByOrg = new Map();
        for (const cred of allCreds) {
            const list = credsByOrg.get(cred.organizationId) || [];
            list.push(cred);
            credsByOrg.set(cred.organizationId, list);
        }
        // Add env var fallback for the default org if no DB creds exist
        if (!credsByOrg.has(this.defaultOrgId)) {
            const envCreds = this.buildEnvVarCredentials();
            if (envCreds.length > 0) {
                credsByOrg.set(this.defaultOrgId, envCreds);
            }
        }
        let totalNew = 0;
        for (const [orgId, orgCreds] of credsByOrg) {
            this.logger.log(`--- Discovering for org ${orgId} (${orgCreds.length} provider(s)) ---`);
            const results = await Promise.allSettled(orgCreds.map((cred) => this.discoverForProvider(orgId, cred)));
            for (const r of results) {
                if (r.status === 'fulfilled') {
                    totalNew += r.value;
                }
                else {
                    this.logger.error(`Discovery failed: ${r.reason}`);
                }
            }
        }
        if (totalNew > 0) {
            this.logger.log(`Discovery complete: ${totalNew} new tracker(s). Refreshing cache...`);
            await this.pipeline.refreshVehicleCache();
        }
        else {
            this.logger.log('Discovery complete: no new trackers found.');
        }
    }
    /**
     * Route to the right discover method based on provider type.
     */
    async discoverForProvider(orgId, cred) {
        const c = cred.credentials;
        switch (cred.provider) {
            case provider_enum_1.Provider.FLESPI:
                return this.discoverFlespi(orgId, c.token);
            case provider_enum_1.Provider.ECHOES:
                return this.discoverEchoes(orgId, c.apiKey, c.accountId, c.apiUrl || 'https://api.neutral-server.com');
            case provider_enum_1.Provider.KEEPTRACE:
                return this.discoverKeepTrace(orgId, c.apiKey, c.apiUrl || 'https://customerapi.live.keeptrace.fr');
            case provider_enum_1.Provider.UBIWAN:
                return this.discoverUbiwan(orgId, c.username, c.password, c.license, c.serverKey || '', c.apiUrl || 'https://api-fleet.moncoyote.com');
            default:
                return 0;
        }
    }
    /**
     * Build pseudo-ProviderCredentialsEntity objects from env vars.
     * Used as fallback when no DB credentials exist for the default org.
     */
    buildEnvVarCredentials() {
        const result = [];
        const flespiToken = this.configService.get('FLESPI_TOKEN', '');
        if (flespiToken) {
            result.push({
                provider: provider_enum_1.Provider.FLESPI,
                credentials: { token: flespiToken },
                organizationId: this.defaultOrgId,
                isActive: true,
            });
        }
        const echoesApiKey = this.configService.get('ECHOES_API_KEY', '');
        const echoesAccountId = this.configService.get('ECHOES_ACCOUNT_ID', '');
        if (echoesApiKey && echoesAccountId) {
            result.push({
                provider: provider_enum_1.Provider.ECHOES,
                credentials: {
                    apiKey: echoesApiKey,
                    accountId: echoesAccountId,
                    apiUrl: this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com'),
                },
                organizationId: this.defaultOrgId,
                isActive: true,
            });
        }
        const ktApiKey = this.configService.get('KEEPTRACE_API_KEY', '');
        if (ktApiKey) {
            result.push({
                provider: provider_enum_1.Provider.KEEPTRACE,
                credentials: {
                    apiKey: ktApiKey,
                    apiUrl: this.configService.get('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr'),
                },
                organizationId: this.defaultOrgId,
                isActive: true,
            });
        }
        const ubiwanUser = this.configService.get('UBIWAN_USERNAME', '');
        const ubiwanPass = this.configService.get('UBIWAN_PASSWORD', '');
        const ubiwanLicense = this.configService.get('UBIWAN_LICENSE', '');
        if (ubiwanUser && ubiwanPass && ubiwanLicense) {
            result.push({
                provider: provider_enum_1.Provider.UBIWAN,
                credentials: {
                    username: ubiwanUser,
                    password: ubiwanPass,
                    license: ubiwanLicense,
                    serverKey: this.configService.get('UBIWAN_SERVER_KEY', ''),
                    apiUrl: this.configService.get('UBIWAN_API_URL', 'https://api-fleet.moncoyote.com'),
                },
                organizationId: this.defaultOrgId,
                isActive: true,
            });
        }
        return result;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // FLESPI
    // ═══════════════════════════════════════════════════════════════════════
    async discoverFlespi(orgId, token) {
        if (!token)
            return 0;
        const response = await fetch('https://flespi.io/gw/devices/all', {
            headers: { Authorization: `FlespiToken ${token}`, Accept: 'application/json' },
        });
        if (!response.ok)
            throw new Error(`Flespi API ${response.status}`);
        const data = (await response.json());
        const devices = data.result || [];
        const existingByProvider = await this.getExistingMetadataKeys('flespiChannelId');
        let imported = 0;
        for (const device of devices) {
            const deviceId = String(device.id);
            if (existingByProvider.has(deviceId))
                continue;
            const ident = device.configuration?.ident || '';
            const name = device.name || `Flespi Device ${deviceId}`;
            // Use findOrCreateVehicle to prevent duplicates by plate/VIN
            const { vehicle, isNew } = await this.findOrCreateVehicle(orgId, {
                name,
                plate: ident || `FLESPI-${deviceId}`,
                deviceImei: ident,
                metadata: { flespiChannelId: deviceId },
            });
            if (isNew) {
                imported++;
                this.logger.log(`  [FLESPI][${orgId}] New device: ${name} (id=${deviceId})`);
            }
            else {
                this.logger.log(`  [FLESPI][${orgId}] Merged into existing: ${vehicle.plate} (id=${deviceId})`);
            }
            this.backfillFlespiHistory(vehicle.id, orgId, deviceId, token).catch((err) => this.logger.error(`  [FLESPI] Backfill failed ${deviceId}: ${err.message}`));
        }
        return imported;
    }
    async backfillFlespiHistory(vehicleId, orgId, deviceId, token) {
        const now = Math.floor(Date.now() / 1000);
        const from = now - this.HISTORY_BACKFILL_DAYS * 86400;
        const response = await fetch(`https://flespi.io/gw/devices/${deviceId}/messages?data={"from":${from},"to":${now}}`, { headers: { Authorization: `FlespiToken ${token}`, Accept: 'application/json' } });
        if (!response.ok)
            return;
        const data = (await response.json());
        const messages = data.result || [];
        if (messages.length === 0)
            return;
        const records = [];
        for (const msg of messages) {
            const lat = msg['position.latitude'] || msg.latitude;
            const lng = msg['position.longitude'] || msg.longitude;
            if (!lat || !lng)
                continue;
            records.push({
                vehicleId,
                organizationId: orgId,
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
        await this.batchInsertHistory(records);
        this.logger.log(`  [FLESPI] Backfilled ${records.length} positions for device ${deviceId}`);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ECHOES
    // ═══════════════════════════════════════════════════════════════════════
    async discoverEchoes(orgId, apiKey, accountId, apiUrl) {
        if (!apiKey || !accountId)
            return 0;
        const privacyKey = await this.getEchoesPrivacyKey(apiKey, accountId, apiUrl);
        const allAssets = [];
        let offset = 0;
        const limit = 100;
        while (true) {
            const response = await fetch(`${apiUrl}/api/accounts/${accountId}/assets?limit=${limit}&offset=${offset}`, { headers: { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' } });
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
        const existingByProvider = await this.getExistingMetadataKeys('echoesUid');
        let imported = 0;
        for (const asset of allAssets) {
            const assetId = String(asset.id);
            if (existingByProvider.has(assetId))
                continue;
            // Extract all available fields from Echoes asset
            const registration = asset.registration || asset.licensePlate || asset.plate || '';
            const vinRaw = asset.vin || asset.VIN || '';
            // Sometimes the VIN is in the name field (17 alphanumeric chars)
            const nameRaw = asset.name || '';
            const isNameVin = /^[A-HJ-NPR-Z0-9]{17}$/i.test(nameRaw);
            const vin = vinRaw || (isNameVin ? nameRaw : '');
            const name = isNameVin
                ? (registration || asset.description || `Echoes Asset ${assetId}`)
                : (nameRaw || registration || `Echoes Asset ${assetId}`);
            const plate = registration || `ECHOES-${assetId}`;
            const brand = asset.brand || asset.make || asset.manufacturer || null;
            const model = asset.model || null;
            const year = asset.year || asset.modelYear || null;
            const deviceImei = asset.imei || asset.serialNumber || asset.serial || null;
            const type = asset.type || asset.category || 'car';
            // Use findOrCreateVehicle to prevent duplicates by plate/VIN
            const { vehicle, isNew } = await this.findOrCreateVehicle(orgId, {
                name,
                plate,
                vin: vin || undefined,
                brand: brand || undefined,
                model: model || undefined,
                year: year ? Number(year) : undefined,
                deviceImei: deviceImei || undefined,
                type: type || 'car',
                metadata: {
                    echoesUid: assetId,
                    echoesRaw: {
                        name: nameRaw,
                        registration,
                        vin: vinRaw,
                        brand: asset.brand,
                        model: asset.model,
                        type: asset.type,
                        category: asset.category,
                    },
                },
            });
            if (isNew) {
                imported++;
                this.logger.log(`  [ECHOES][${orgId}] New asset: ${name} (id=${assetId}, plate=${plate}, vin=${vin || 'none'})`);
            }
            else {
                this.logger.log(`  [ECHOES][${orgId}] Merged into existing: ${vehicle.plate} (id=${assetId})`);
            }
            // Backfill GPS history for both new and merged vehicles
            this.backfillEchoesHistory(vehicle.id, orgId, assetId, privacyKey, accountId, apiUrl).catch((err) => this.logger.error(`  [ECHOES] Backfill failed ${assetId}: ${err.message}`));
        }
        return imported;
    }
    async backfillEchoesHistory(vehicleId, orgId, assetId, privacyKey, accountId, apiUrl) {
        const now = Date.now();
        const from = now - this.HISTORY_BACKFILL_DAYS * 86400 * 1000;
        const period = JSON.stringify({ start: from, end: now });
        const response = await fetch(`${apiUrl}/api/accounts/${accountId}/assets/${assetId}/locations?period=${encodeURIComponent(period)}`, { headers: { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' } });
        if (!response.ok)
            return;
        const locations = (await response.json());
        if (!Array.isArray(locations) || locations.length === 0)
            return;
        const records = [];
        for (const loc of locations) {
            const lat = loc.latitude || loc.lat;
            const lng = loc.longitude || loc.lng || loc.lon;
            if (!lat || !lng)
                continue;
            records.push({
                vehicleId,
                organizationId: orgId,
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
        await this.batchInsertHistory(records);
        this.logger.log(`  [ECHOES] Backfilled ${records.length} positions for asset ${assetId}`);
    }
    async getEchoesPrivacyKey(apiKey, accountId, apiUrl = 'https://api.neutral-server.com') {
        const listResponse = await fetch(`${apiUrl}/api/accounts/${accountId}/privacy_key`, {
            headers: { Authorization: `Apikey ${apiKey}`, Accept: 'application/json' },
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
        const createResponse = await fetch(`${apiUrl}/api/accounts/${accountId}/privacy_key`, {
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
    // ═══════════════════════════════════════════════════════════════════════
    // ENRICH EXISTING VEHICLES (fills missing VIN, plate, brand, model)
    // ═══════════════════════════════════════════════════════════════════════
    async enrichAllVehicles() {
        this.logger.log('[ENRICH] Starting vehicle enrichment from GPS providers...');
        let updated = 0;
        const errors = [];
        // Load all credentials (DB + env fallback)
        const credMap = await this.loadAllCredentials();
        // Enrich Echoes vehicles
        for (const [orgId, creds] of credMap.entries()) {
            const echoesCred = creds.get(provider_enum_1.Provider.ECHOES);
            if (echoesCred) {
                try {
                    const count = await this.enrichEchoesVehicles(orgId, echoesCred.apiKey, echoesCred.accountId, echoesCred.apiUrl || 'https://api.neutral-server.com');
                    updated += count;
                }
                catch (err) {
                    errors.push(`[ECHOES][${orgId}] ${err.message}`);
                    this.logger.error(`[ENRICH][ECHOES] Error for org ${orgId}: ${err.message}`);
                }
            }
            // Enrich KeepTrace vehicles
            const ktCred = creds.get(provider_enum_1.Provider.KEEPTRACE);
            if (ktCred) {
                try {
                    const count = await this.enrichKeepTraceVehicles(orgId, ktCred.apiKey, ktCred.apiUrl || 'https://customerapi.live.keeptrace.fr');
                    updated += count;
                }
                catch (err) {
                    errors.push(`[KEEPTRACE][${orgId}] ${err.message}`);
                    this.logger.error(`[ENRICH][KEEPTRACE] Error for org ${orgId}: ${err.message}`);
                }
            }
            // Enrich Ubiwan vehicles
            const ubiwanCred = creds.get(provider_enum_1.Provider.UBIWAN);
            if (ubiwanCred) {
                try {
                    const count = await this.enrichUbiwanVehicles(orgId, ubiwanCred.username, ubiwanCred.password, ubiwanCred.license, ubiwanCred.serverKey, ubiwanCred.apiUrl || 'https://api-fleet.moncoyote.com');
                    updated += count;
                }
                catch (err) {
                    errors.push(`[UBIWAN][${orgId}] ${err.message}`);
                    this.logger.error(`[ENRICH][UBIWAN] Error for org ${orgId}: ${err.message}`);
                }
            }
        }
        this.logger.log(`[ENRICH] Done. Updated ${updated} vehicles. Errors: ${errors.length}`);
        return { updated, errors };
    }
    async enrichEchoesVehicles(orgId, apiKey, accountId, apiUrl) {
        const privacyKey = await this.getEchoesPrivacyKey(apiKey, accountId, apiUrl);
        // Fetch all assets from Echoes
        const allAssets = [];
        let offset = 0;
        const limit = 100;
        while (true) {
            const response = await fetch(`${apiUrl}/api/accounts/${accountId}/assets?limit=${limit}&offset=${offset}`, { headers: { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' } });
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
        // Build a map of assetId -> asset data
        const assetMap = new Map();
        for (const asset of allAssets) {
            assetMap.set(String(asset.id), asset);
        }
        // Find existing Echoes vehicles for this org
        const vehicles = await this.vehiclesRepository.find({
            where: { organizationId: orgId },
        });
        let updated = 0;
        for (const vehicle of vehicles) {
            const meta = vehicle.metadata;
            if (!meta?.echoesUid)
                continue;
            const asset = assetMap.get(String(meta.echoesUid));
            if (!asset)
                continue;
            const registration = asset.registration || asset.licensePlate || asset.plate || '';
            const vinRaw = asset.vin || asset.VIN || '';
            const nameRaw = asset.name || '';
            const isNameVin = /^[A-HJ-NPR-Z0-9]{17}$/i.test(nameRaw);
            const vin = vinRaw || (isNameVin ? nameRaw : '');
            const changes = {};
            let hasChanges = false;
            // Update VIN if missing
            if (!vehicle.vin && vin) {
                changes.vin = vin;
                hasChanges = true;
            }
            // Update plate if it's still the default ECHOES-xxx
            if (vehicle.plate?.startsWith('ECHOES-') && registration) {
                changes.plate = registration;
                hasChanges = true;
            }
            // Update name if it's a VIN (replace with more readable name)
            if (isNameVin && registration && vehicle.name === nameRaw) {
                changes.name = registration || `Asset ${meta.echoesUid}`;
                hasChanges = true;
            }
            // Fill brand/model if missing
            const brand = asset.brand || asset.make || asset.manufacturer || null;
            const model = asset.model || null;
            const year = asset.year || asset.modelYear || null;
            const deviceImei = asset.imei || asset.serialNumber || asset.serial || null;
            if (!vehicle.brand && brand) {
                changes.brand = brand;
                hasChanges = true;
            }
            if (!vehicle.model && model) {
                changes.model = model;
                hasChanges = true;
            }
            if (!vehicle.year && year) {
                changes.year = Number(year);
                hasChanges = true;
            }
            if (!vehicle.deviceImei && deviceImei) {
                changes.deviceImei = deviceImei;
                hasChanges = true;
            }
            // Store raw Echoes data in metadata
            changes.metadata = {
                ...meta,
                echoesRaw: {
                    name: nameRaw,
                    registration,
                    vin: vinRaw,
                    brand: asset.brand,
                    model: asset.model,
                    type: asset.type,
                    category: asset.category,
                },
            };
            hasChanges = true;
            if (hasChanges) {
                await this.vehiclesRepository.update(vehicle.id, changes);
                updated++;
                this.logger.log(`  [ENRICH][ECHOES] Updated ${vehicle.name} (id=${meta.echoesUid}): ${JSON.stringify(Object.keys(changes))}`);
            }
        }
        this.logger.log(`  [ENRICH][ECHOES][${orgId}] Enriched ${updated} vehicles from ${allAssets.length} assets`);
        return updated;
    }
    async enrichKeepTraceVehicles(orgId, apiKey, apiUrl) {
        // Fetch vehicles from KeepTrace
        const response = await fetch(`${apiUrl}/api/v1/vehicles`, {
            headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
        });
        if (!response.ok)
            return 0;
        const data = (await response.json());
        const ktVehicles = data.vehicles || data.data || data || [];
        if (!Array.isArray(ktVehicles))
            return 0;
        const ktMap = new Map();
        for (const v of ktVehicles) {
            const vid = String(v.id || v.vehicleId);
            ktMap.set(vid, v);
        }
        const vehicles = await this.vehiclesRepository.find({ where: { organizationId: orgId } });
        let updated = 0;
        for (const vehicle of vehicles) {
            const meta = vehicle.metadata;
            if (!meta?.keepTraceId)
                continue;
            const ktData = ktMap.get(String(meta.keepTraceId));
            if (!ktData)
                continue;
            const changes = {};
            let hasChanges = false;
            const registration = ktData.Registration || ktData.registration || ktData.LicensePlate || '';
            const vin = ktData.VIN || ktData.vin || '';
            const brand = ktData.Brand || ktData.brand || ktData.Make || '';
            const model = ktData.Model || ktData.model || '';
            if (!vehicle.vin && vin) {
                changes.vin = vin;
                hasChanges = true;
            }
            if (vehicle.plate?.startsWith('KT-') && registration) {
                changes.plate = registration;
                hasChanges = true;
            }
            if (!vehicle.brand && brand) {
                changes.brand = brand;
                hasChanges = true;
            }
            if (!vehicle.model && model) {
                changes.model = model;
                hasChanges = true;
            }
            if (hasChanges) {
                await this.vehiclesRepository.update(vehicle.id, changes);
                updated++;
            }
        }
        return updated;
    }
    async enrichUbiwanVehicles(orgId, username, password, license, serverKey, apiUrl) {
        // Authenticate with Ubiwan
        const authResp = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ username, password, license, serverKey }),
        });
        if (!authResp.ok)
            return 0;
        const authData = (await authResp.json());
        const token = authData.token || authData.accessToken || authData.data?.token;
        if (!token)
            return 0;
        // Fetch vehicles
        const vResp = await fetch(`${apiUrl}/api/v1/vehicles`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!vResp.ok)
            return 0;
        const vData = (await vResp.json());
        const ubVehicles = vData.vehicles || vData.data || vData || [];
        if (!Array.isArray(ubVehicles))
            return 0;
        const ubMap = new Map();
        for (const v of ubVehicles) {
            const uid = String(v.uid || v.id || v.vehicleId);
            ubMap.set(uid, v);
        }
        const vehicles = await this.vehiclesRepository.find({ where: { organizationId: orgId } });
        let updated = 0;
        for (const vehicle of vehicles) {
            const meta = vehicle.metadata;
            if (!meta?.ubiwanUid)
                continue;
            const ubData = ubMap.get(String(meta.ubiwanUid));
            if (!ubData)
                continue;
            const changes = {};
            let hasChanges = false;
            const registration = ubData.registration || ubData.licensePlate || '';
            const vin = ubData.vin || ubData.VIN || '';
            const brand = ubData.brand || ubData.make || '';
            const model = ubData.model || '';
            if (!vehicle.vin && vin) {
                changes.vin = vin;
                hasChanges = true;
            }
            if (vehicle.plate?.startsWith('UBIWAN-') && registration) {
                changes.plate = registration;
                hasChanges = true;
            }
            if (!vehicle.brand && brand) {
                changes.brand = brand;
                hasChanges = true;
            }
            if (!vehicle.model && model) {
                changes.model = model;
                hasChanges = true;
            }
            if (hasChanges) {
                await this.vehiclesRepository.update(vehicle.id, changes);
                updated++;
            }
        }
        return updated;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // SYNC TRIPS FROM ECHOES (trips + odometer + assetFeatures)
    // ═══════════════════════════════════════════════════════════════════════
    async syncAllTrips(days = 7) {
        this.logger.log(`[TRIPS] Starting trip sync from GPS providers (last ${days} days)...`);
        let synced = 0;
        const errors = [];
        const credMap = await this.loadAllCredentials();
        for (const [orgId, creds] of credMap.entries()) {
            const echoesCred = creds.get(provider_enum_1.Provider.ECHOES);
            if (echoesCred) {
                try {
                    const count = await this.syncEchoesTrips(orgId, echoesCred.apiKey, echoesCred.accountId, echoesCred.apiUrl || 'https://api.neutral-server.com', days);
                    synced += count;
                }
                catch (err) {
                    errors.push(`[ECHOES][${orgId}] ${err.message}`);
                    this.logger.error(`[TRIPS][ECHOES] Error for org ${orgId}: ${err.message}`);
                }
            }
        }
        this.logger.log(`[TRIPS] Done. Synced ${synced} trips. Errors: ${errors.length}`);
        return { synced, errors };
    }
    async syncEchoesTrips(orgId, apiKey, accountId, apiUrl, days) {
        const privacyKey = await this.getEchoesPrivacyKey(apiKey, accountId, apiUrl);
        const headers = { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' };
        // Fetch all assets
        const allAssets = [];
        let offset = 0;
        while (true) {
            const resp = await fetch(`${apiUrl}/api/accounts/${accountId}/assets?limit=100&offset=${offset}`, { headers });
            if (!resp.ok)
                break;
            const assets = (await resp.json());
            if (!Array.isArray(assets) || assets.length === 0)
                break;
            allAssets.push(...assets);
            if (assets.length < 100)
                break;
            offset += 100;
        }
        // Get all vehicles for this org
        const vehicles = await this.vehiclesRepository.find({ where: { organizationId: orgId } });
        const vehicleByEchoesUid = new Map();
        for (const v of vehicles) {
            const uid = v.metadata?.echoesUid;
            if (uid)
                vehicleByEchoesUid.set(String(uid), v);
        }
        let synced = 0;
        const now = Date.now();
        const from = now - days * 86400000;
        const period = JSON.stringify({ start: from, end: now });
        for (const asset of allAssets) {
            const assetId = String(asset.id);
            const vehicle = vehicleByEchoesUid.get(assetId);
            if (!vehicle)
                continue;
            // Update assetFeatures on vehicle if available (from detail endpoint)
            try {
                const detailResp = await fetch(`${apiUrl}/api/accounts/${accountId}/assets/${assetId}`, { headers });
                if (detailResp.ok) {
                    const detail = (await detailResp.json());
                    if (detail.assetFeatures) {
                        await this.vehiclesRepository.update(vehicle.id, {
                            features: detail.assetFeatures,
                        });
                    }
                }
            }
            catch (_) { }
            // Fetch trips
            try {
                const tripsResp = await fetch(`${apiUrl}/api/accounts/${accountId}/assets/${assetId}/trips?period=${encodeURIComponent(period)}`, { headers });
                if (!tripsResp.ok)
                    continue;
                const tripsData = (await tripsResp.json());
                const trips = tripsData?.trips || [];
                if (!Array.isArray(trips) || trips.length === 0)
                    continue;
                // Get existing trip IDs to avoid duplicates
                const existingTrips = await this.tripsRepository.find({
                    where: { vehicleId: vehicle.id },
                    select: ['externalTripId'],
                });
                const existingIds = new Set(existingTrips.map(t => t.externalTripId));
                for (const trip of trips) {
                    if (!trip.id || existingIds.has(trip.id))
                        continue;
                    const startLoc = trip.firstLocation?.location;
                    const endLoc = trip.lastLocation?.location;
                    if (!startLoc || !endLoc)
                        continue;
                    const startDt = new Date(trip.startDateTime);
                    const endDt = new Date(trip.endDateTime);
                    const durationSec = Math.round((endDt.getTime() - startDt.getTime()) / 1000);
                    const distanceM = (trip.startMileage && trip.endMileage)
                        ? trip.endMileage - trip.startMileage
                        : null;
                    const tripEntity = this.tripsRepository.create({
                        vehicleId: vehicle.id,
                        organizationId: orgId,
                        provider: provider_enum_1.Provider.ECHOES,
                        externalTripId: trip.id,
                        startDateTime: startDt,
                        endDateTime: endDt,
                        startLat: startLoc.latitude,
                        startLng: startLoc.longitude,
                        endLat: endLoc.latitude,
                        endLng: endLoc.longitude,
                        startAltitude: startLoc.altitude || null,
                        endAltitude: endLoc.altitude || null,
                        startHeading: startLoc.heading || null,
                        endHeading: endLoc.heading || null,
                        startAddress: trip.firstLocation?.address || null,
                        endAddress: trip.lastLocation?.address || null,
                        startMileage: trip.startMileage || null,
                        endMileage: trip.endMileage || null,
                        distance: distanceM,
                        duration: durationSec,
                    });
                    await this.tripsRepository.save(tripEntity);
                    synced++;
                    // Update vehicle odometer with latest mileage
                    if (trip.endMileage) {
                        const currentOdometer = vehicle.odometer || 0;
                        if (trip.endMileage > currentOdometer) {
                            await this.vehiclesRepository.update(vehicle.id, {
                                odometer: trip.endMileage,
                            });
                        }
                    }
                }
                this.logger.log(`  [TRIPS][ECHOES] ${vehicle.plate}: synced ${trips.length} trips`);
            }
            catch (err) {
                this.logger.error(`  [TRIPS][ECHOES] Error syncing trips for ${vehicle.plate}: ${err.message}`);
            }
        }
        return synced;
    }
    async loadAllCredentials() {
        const credMap = new Map();
        // Load from DB
        const dbCreds = await this.providerCredentialsRepository.find({ where: { isActive: true } });
        for (const cred of dbCreds) {
            if (!credMap.has(cred.organizationId))
                credMap.set(cred.organizationId, new Map());
            credMap.get(cred.organizationId).set(cred.provider, cred.credentials);
        }
        // Fallback to env vars for default org
        const envCreds = this.buildEnvVarCredentials();
        for (const ec of envCreds) {
            if (!credMap.has(ec.organizationId))
                credMap.set(ec.organizationId, new Map());
            if (!credMap.get(ec.organizationId).has(ec.provider)) {
                credMap.get(ec.organizationId).set(ec.provider, ec.credentials);
            }
        }
        return credMap;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // KEEPTRACE
    // ═══════════════════════════════════════════════════════════════════════
    async discoverKeepTrace(orgId, apiKey, apiUrl) {
        if (!apiKey)
            return 0;
        const response = await fetch(`${apiUrl}/api/Vehicle/GetVehicles`, {
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Authorization-Key': apiKey },
        });
        if (!response.ok)
            throw new Error(`KeepTrace API ${response.status}`);
        const vehicles = (await response.json());
        if (!Array.isArray(vehicles))
            return 0;
        const existingByProvider = await this.getExistingMetadataKeys('keeptraceId');
        let imported = 0;
        for (const v of vehicles) {
            const vid = String(v.VehicleId || v.Id || v.id);
            if (existingByProvider.has(vid))
                continue;
            const name = v.Name || v.name || `KeepTrace ${vid}`;
            const plate = v.Registration || v.registration || v.LicensePlate || `KT-${vid}`;
            const imei = v.Imei || v.imei || '';
            // Use findOrCreateVehicle to prevent duplicates by plate/VIN
            const { vehicle, isNew } = await this.findOrCreateVehicle(orgId, {
                name,
                plate,
                deviceImei: imei || undefined,
                metadata: { keeptraceId: vid },
            });
            if (isNew) {
                imported++;
                this.logger.log(`  [KEEPTRACE][${orgId}] New vehicle: ${name} (id=${vid})`);
            }
            else {
                this.logger.log(`  [KEEPTRACE][${orgId}] Merged into existing: ${vehicle.plate} (id=${vid})`);
            }
            this.backfillKeepTraceHistory(vehicle.id, orgId, vid, apiUrl, apiKey).catch((err) => this.logger.error(`  [KEEPTRACE] Backfill failed ${vid}: ${err.message}`));
        }
        return imported;
    }
    async backfillKeepTraceHistory(vehicleId, orgId, keeptraceVehicleId, apiUrl, apiKey) {
        const now = new Date();
        const from = new Date(now.getTime() - this.HISTORY_BACKFILL_DAYS * 86400 * 1000);
        const response = await fetch(`${apiUrl}/api/History/GetJourneysLocations`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Authorization-Key': apiKey },
            body: JSON.stringify({ VehicleId: keeptraceVehicleId, StartDate: from.toISOString(), EndDate: now.toISOString() }),
        });
        if (!response.ok)
            return;
        const data = (await response.json());
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
                    organizationId: orgId,
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
            await this.batchInsertHistory(records);
            this.logger.log(`  [KEEPTRACE] Backfilled ${records.length} positions for vehicle ${keeptraceVehicleId}`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // UBIWAN
    // ═══════════════════════════════════════════════════════════════════════
    async discoverUbiwan(orgId, username, md5Password, license, serverKey, apiUrl) {
        if (!username || !md5Password || !license)
            return 0;
        const authResponse = await fetch(`${apiUrl}/v53/auth?u=${encodeURIComponent(username)}&l=${encodeURIComponent(license)}&k=${encodeURIComponent(serverKey)}&p=${md5Password}`, { headers: { Accept: 'application/json' } });
        if (!authResponse.ok)
            throw new Error(`Ubiwan auth ${authResponse.status}`);
        const authData = (await authResponse.json());
        if (authData.result !== 201 || !authData.token) {
            throw new Error(`Ubiwan auth failed: result=${authData.result}`);
        }
        const token = authData.token;
        const locResponse = await fetch(`${apiUrl}/v53/location?token=${encodeURIComponent(token)}&timestamp=0`, { headers: { Accept: 'application/json' } });
        if (!locResponse.ok)
            throw new Error(`Ubiwan location ${locResponse.status}`);
        const locData = (await locResponse.json());
        const devices = locData.location?.data || [];
        const existingByProvider = await this.getExistingMetadataKeys('ubiwanId');
        let imported = 0;
        for (const dev of devices) {
            const uid = String(dev.uid);
            if (existingByProvider.has(uid))
                continue;
            const registration = dev.registration || '';
            const summary = dev.summary || '';
            const imei = dev.dev_hw_id || '';
            const name = summary || `Ubiwan Device ${uid}`;
            const plate = registration || `UBIWAN-${uid}`;
            // Use findOrCreateVehicle to prevent duplicates by plate/VIN
            const { vehicle, isNew } = await this.findOrCreateVehicle(orgId, {
                name,
                plate,
                brand: (summary.split(' ')[0]) || undefined,
                model: (summary.split(' ').slice(1).join(' ')) || undefined,
                deviceImei: imei || undefined,
                metadata: { ubiwanId: uid, ubiwanParent: String(dev.uid_parent || ''), hardware: dev.hardware || '' },
            });
            if (isNew) {
                imported++;
                this.logger.log(`  [UBIWAN][${orgId}] New device: ${name} (uid=${uid})`);
            }
            else {
                this.logger.log(`  [UBIWAN][${orgId}] Merged into existing: ${vehicle.plate} (uid=${uid})`);
            }
            this.seedUbiwanInitialPosition(vehicle.id, orgId, dev).catch((err) => this.logger.error(`  [UBIWAN] Seed failed ${uid}: ${err.message}`));
        }
        return imported;
    }
    async seedUbiwanInitialPosition(vehicleId, orgId, device) {
        const lat = parseFloat(device.latitude);
        const lng = parseFloat(device.longitude);
        if (!lat || !lng || isNaN(lat) || isNaN(lng))
            return;
        await this.gpsHistoryRepository.save(this.gpsHistoryRepository.create({
            vehicleId,
            organizationId: orgId,
            lat,
            lng,
            speed: parseFloat(device.speed_current || 0),
            heading: parseFloat(device.course || 0),
            provider: provider_enum_1.Provider.UBIWAN,
            createdAt: device.location_date ? new Date(device.location_date * 1000) : new Date(),
            metadata: { source: 'discovery_seed' },
        }));
    }
    // ═══════════════════════════════════════════════════════════════════════
    // BACKFILL ALL EXISTING VEHICLES
    // ═══════════════════════════════════════════════════════════════════════
    async backfillAllExistingVehicles() {
        this.logger.log('=== Backfill: scanning all vehicles for missing GPS history ===');
        const allVehicles = await this.vehiclesRepository.find();
        let queued = 0;
        let skipped = 0;
        // Load all org credentials into a map
        const allCreds = await this.providerCredentialsRepository.find({ where: { isActive: true } });
        const credMap = new Map();
        for (const cred of allCreds) {
            if (!credMap.has(cred.organizationId))
                credMap.set(cred.organizationId, new Map());
            credMap.get(cred.organizationId).set(cred.provider, cred.credentials);
        }
        // Add env var fallback for default org
        if (!credMap.has(this.defaultOrgId)) {
            credMap.set(this.defaultOrgId, new Map());
        }
        const defaultMap = credMap.get(this.defaultOrgId);
        const flespiToken = this.configService.get('FLESPI_TOKEN', '');
        if (flespiToken && !defaultMap.has(provider_enum_1.Provider.FLESPI)) {
            defaultMap.set(provider_enum_1.Provider.FLESPI, { token: flespiToken });
        }
        const echoesApiKey = this.configService.get('ECHOES_API_KEY', '');
        const echoesAccountId = this.configService.get('ECHOES_ACCOUNT_ID', '');
        if (echoesApiKey && echoesAccountId && !defaultMap.has(provider_enum_1.Provider.ECHOES)) {
            defaultMap.set(provider_enum_1.Provider.ECHOES, {
                apiKey: echoesApiKey,
                accountId: echoesAccountId,
                apiUrl: this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com'),
            });
        }
        const ktApiKey = this.configService.get('KEEPTRACE_API_KEY', '');
        if (ktApiKey && !defaultMap.has(provider_enum_1.Provider.KEEPTRACE)) {
            defaultMap.set(provider_enum_1.Provider.KEEPTRACE, {
                apiKey: ktApiKey,
                apiUrl: this.configService.get('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr'),
            });
        }
        for (const vehicle of allVehicles) {
            const meta = (vehicle.metadata || {});
            const orgCreds = credMap.get(vehicle.organizationId);
            const existingCount = await this.gpsHistoryRepository.count({ where: { vehicleId: vehicle.id } });
            if (existingCount > 10) {
                skipped++;
                continue;
            }
            if (meta.flespiChannelId) {
                const cred = orgCreds?.get(provider_enum_1.Provider.FLESPI);
                if (cred?.token) {
                    this.backfillFlespiHistory(vehicle.id, vehicle.organizationId, meta.flespiChannelId, cred.token).catch(() => { });
                    queued++;
                    continue;
                }
            }
            if (meta.echoesUid) {
                const cred = orgCreds?.get(provider_enum_1.Provider.ECHOES);
                if (cred?.apiKey && cred?.accountId) {
                    const apiUrl = cred.apiUrl || 'https://api.neutral-server.com';
                    this.getEchoesPrivacyKey(cred.apiKey, cred.accountId, apiUrl)
                        .then((pk) => this.backfillEchoesHistory(vehicle.id, vehicle.organizationId, meta.echoesUid, pk, cred.accountId, apiUrl))
                        .catch(() => { });
                    queued++;
                    continue;
                }
            }
            if (meta.keeptraceId) {
                const cred = orgCreds?.get(provider_enum_1.Provider.KEEPTRACE);
                if (cred?.apiKey) {
                    const apiUrl = cred.apiUrl || 'https://customerapi.live.keeptrace.fr';
                    this.backfillKeepTraceHistory(vehicle.id, vehicle.organizationId, meta.keeptraceId, apiUrl, cred.apiKey).catch(() => { });
                    queued++;
                    continue;
                }
            }
            skipped++;
        }
        this.logger.log(`Backfill queued: ${queued}, skipped: ${skipped}`);
        return { queued, skipped };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    async getExistingMetadataKeys(key) {
        const results = await this.vehiclesRepository
            .createQueryBuilder('v')
            .select(`v.metadata->>'${key}'`, 'extId')
            .where(`v.metadata->>'${key}' IS NOT NULL`)
            .getRawMany();
        return new Set(results.map((r) => r.extId));
    }
    /**
     * Find an existing vehicle by plate or VIN within the same org.
     * If found, merge the new provider metadata into the existing vehicle.
     * If not found, create a new vehicle.
     * This prevents duplicates when the same physical vehicle is tracked
     * by multiple GPS providers (e.g., Echoes AND Ubiwan).
     */
    async findOrCreateVehicle(orgId, data) {
        const normalizedPlate = (data.plate || '').replace(/[\s-]/g, '').toUpperCase();
        const normalizedVin = (data.vin || '').toUpperCase();
        // Skip lookup for auto-generated placeholder plates like ECHOES-123, UBIWAN-456
        const isPlaceholderPlate = /^(ECHOES|UBIWAN|FLESPI|KT)-/.test(data.plate);
        let existing = null;
        // 1. Try to find by plate (normalized, same org) — skip placeholder plates
        if (!isPlaceholderPlate && normalizedPlate) {
            existing = await this.vehiclesRepository
                .createQueryBuilder('v')
                .where('v.organizationId = :orgId', { orgId })
                .andWhere("UPPER(REPLACE(REPLACE(v.plate, '-', ''), ' ', '')) = :plate", { plate: normalizedPlate })
                .getOne();
        }
        // 2. If not found by plate, try by VIN (same org)
        if (!existing && normalizedVin && normalizedVin.length >= 10) {
            existing = await this.vehiclesRepository
                .createQueryBuilder('v')
                .where('v.organizationId = :orgId', { orgId })
                .andWhere('UPPER(v.vin) = :vin', { vin: normalizedVin })
                .getOne();
        }
        if (existing) {
            // Merge metadata from the new provider into the existing vehicle
            const mergedMetadata = { ...(existing.metadata || {}), ...data.metadata };
            existing.metadata = mergedMetadata;
            // Update fields if they were empty/null on the existing record
            if (!existing.vin && data.vin)
                existing.vin = data.vin;
            if (!existing.brand && data.brand)
                existing.brand = data.brand;
            if (!existing.model && data.model)
                existing.model = data.model;
            if (!existing.year && data.year)
                existing.year = data.year;
            if (!existing.deviceImei && data.deviceImei)
                existing.deviceImei = data.deviceImei;
            await this.vehiclesRepository.save(existing);
            this.logger.log(`  [DEDUP] Merged into existing vehicle ${existing.plate} (id=${existing.id})`);
            return { vehicle: existing, isNew: false };
        }
        // 3. No match found — create new vehicle
        const vehicleEntity = this.vehiclesRepository.create({
            organizationId: orgId,
            name: data.name,
            plate: data.plate,
            vin: data.vin || undefined,
            brand: data.brand || undefined,
            model: data.model || undefined,
            year: data.year ? Number(data.year) : undefined,
            deviceImei: data.deviceImei || undefined,
            type: (data.type || 'car'),
            status: (data.status || 'active'),
            metadata: data.metadata,
        });
        const saved = await this.vehiclesRepository.save(vehicleEntity);
        const vehicle = Array.isArray(saved) ? saved[0] : saved;
        return { vehicle, isNew: true };
    }
    async batchInsertHistory(records) {
        for (let i = 0; i < records.length; i += 500) {
            const batch = records.slice(i, i + 500);
            await this.gpsHistoryRepository.save(batch.map((r) => this.gpsHistoryRepository.create(r)));
        }
    }
    async debugEchoesAssets() {
        const credMap = await this.loadAllCredentials();
        const results = [];
        for (const [orgId, creds] of credMap.entries()) {
            const echoesCred = creds.get(provider_enum_1.Provider.ECHOES);
            if (!echoesCred)
                continue;
            try {
                const apiUrl = echoesCred.apiUrl || 'https://api.neutral-server.com';
                const privacyKey = await this.getEchoesPrivacyKey(echoesCred.apiKey, echoesCred.accountId, apiUrl);
                const headers = { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' };
                // 1. List assets (get more to find active ones)
                const listResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets?limit=100&offset=0`, { headers });
                if (!listResp.ok) {
                    results.push({ orgId, error: `List API ${listResp.status}` });
                    continue;
                }
                const assets = await listResp.json();
                // Pick an active asset — try to find 1133404 across all pages, else use first active
                let firstAsset = null;
                if (Array.isArray(assets)) {
                    firstAsset = assets.find((a) => String(a.id) === '1133404');
                    if (!firstAsset) {
                        // Try fetching more pages to find it
                        let offset2 = 100;
                        while (!firstAsset && offset2 < 500) {
                            try {
                                const moreResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets?limit=100&offset=${offset2}`, { headers });
                                if (moreResp.ok) {
                                    const moreAssets = (await moreResp.json());
                                    if (!Array.isArray(moreAssets) || moreAssets.length === 0)
                                        break;
                                    firstAsset = moreAssets.find((a) => String(a.id) === '1133404');
                                    if (!firstAsset && offset2 >= 200) {
                                        // Just pick any asset from the last batch
                                        firstAsset = moreAssets[moreAssets.length - 1];
                                    }
                                }
                                else
                                    break;
                            }
                            catch (_) {
                                break;
                            }
                            offset2 += 100;
                        }
                    }
                    if (!firstAsset)
                        firstAsset = assets[assets.length - 1] || assets[0];
                }
                // 2. Get single asset detail (might return more fields)
                let assetDetail = null;
                if (firstAsset?.id) {
                    try {
                        const detailResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}`, { headers });
                        if (detailResp.ok) {
                            assetDetail = await detailResp.json();
                        }
                        else {
                            assetDetail = { error: `Detail API ${detailResp.status}` };
                        }
                    }
                    catch (e) {
                        assetDetail = { error: e.message };
                    }
                }
                // 3. Try to get asset with extra info (some APIs have ?include=all or ?expand=true)
                let assetExpanded = null;
                if (firstAsset?.id) {
                    try {
                        const expResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}?include=all`, { headers });
                        if (expResp.ok) {
                            assetExpanded = await expResp.json();
                        }
                    }
                    catch (_) { }
                }
                // 4. Try last known location for the asset (may contain odometer, fuel, etc.)
                let lastLocation = null;
                if (firstAsset?.id) {
                    try {
                        const locResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}/lastknownlocation`, { headers });
                        if (locResp.ok) {
                            lastLocation = await locResp.json();
                        }
                        else {
                            // Try alternate endpoint
                            const locResp2 = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}/location`, { headers });
                            if (locResp2.ok)
                                lastLocation = await locResp2.json();
                        }
                    }
                    catch (_) { }
                }
                // 5. Try trips endpoint
                let tripsInfo = null;
                if (firstAsset?.id) {
                    try {
                        const now = Date.now();
                        const yesterday = now - 86400000;
                        const period = JSON.stringify({ start: yesterday, end: now });
                        const tripsResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}/trips?period=${encodeURIComponent(period)}`, { headers });
                        if (tripsResp.ok) {
                            const trips = await tripsResp.json();
                            tripsInfo = {
                                count: Array.isArray(trips) ? trips.length : 'not-array',
                                sampleTrip: Array.isArray(trips) && trips.length > 0 ? trips[0] : trips,
                                tripFields: Array.isArray(trips) && trips.length > 0 ? Object.keys(trips[0]) : [],
                            };
                        }
                    }
                    catch (_) { }
                }
                // 6. Brute-force discover all available API endpoints
                const endpointDiscovery = {};
                const accountBase = `${apiUrl}/api/accounts/${echoesCred.accountId}`;
                const assetBase = firstAsset?.id ? `${accountBase}/assets/${firstAsset.id}` : null;
                // Account-level endpoints
                const accountEndpoints = [
                    'fleets', 'users', 'devices', 'device_types', 'device_attributes',
                    'attributes', 'alerts', 'geofences', 'geofencing', 'zones',
                    'reports', 'drivers', 'tags', 'groups', 'categories',
                    'maintenance', 'notifications', 'settings', 'metadata',
                    'odometers', 'energy', 'ecodriving', 'crash_events',
                ];
                for (const ep of accountEndpoints) {
                    try {
                        const resp = await fetch(`${accountBase}/${ep}`, { headers });
                        if (resp.ok) {
                            const body = await resp.json();
                            endpointDiscovery[`account/${ep}`] = {
                                status: resp.status,
                                type: Array.isArray(body) ? `array[${body.length}]` : typeof body,
                                sample: Array.isArray(body) ? body.slice(0, 2) : (typeof body === 'object' ? Object.keys(body || {}).slice(0, 20) : body),
                            };
                        }
                        else {
                            endpointDiscovery[`account/${ep}`] = { status: resp.status };
                        }
                    }
                    catch (e) {
                        endpointDiscovery[`account/${ep}`] = { error: e.message };
                    }
                }
                // Asset-level endpoints
                if (assetBase) {
                    const assetEndpoints = [
                        'datas', 'data', 'odometer', 'energy', 'ecodriving',
                        'crash_events', 'alerts', 'geofences', 'maintenance',
                        'status', 'realtime', 'lastknownlocation', 'last_location',
                        'speed', 'outputs', 'drivers', 'tags',
                    ];
                    for (const ep of assetEndpoints) {
                        try {
                            const resp = await fetch(`${assetBase}/${ep}`, { headers });
                            if (resp.ok) {
                                const body = await resp.json();
                                endpointDiscovery[`asset/${ep}`] = {
                                    status: resp.status,
                                    type: Array.isArray(body) ? `array[${body.length}]` : typeof body,
                                    sample: Array.isArray(body) ? body.slice(0, 2) : (typeof body === 'object' ? Object.keys(body || {}).slice(0, 20) : body),
                                };
                            }
                            else {
                                endpointDiscovery[`asset/${ep}`] = { status: resp.status };
                            }
                        }
                        catch (e) {
                            endpointDiscovery[`asset/${ep}`] = { error: e.message };
                        }
                    }
                }
                // Also try Apikey auth for some endpoints
                const apikeyHeaders = { Authorization: `Apikey ${echoesCred.apiKey}`, Accept: 'application/json' };
                const apiKeyEndpoints = [
                    `${accountBase}/device_attributes`,
                    `${apiUrl}/api/device_attributes`,
                    `${accountBase}/fleets`,
                ];
                for (const ep of apiKeyEndpoints) {
                    try {
                        const resp = await fetch(ep, { headers: apikeyHeaders });
                        if (resp.ok) {
                            const body = await resp.json();
                            endpointDiscovery[`apikey:${ep.replace(apiUrl, '')}`] = {
                                status: resp.status,
                                type: Array.isArray(body) ? `array[${body.length}]` : typeof body,
                                sample: Array.isArray(body) ? body.slice(0, 3) : body,
                            };
                        }
                    }
                    catch (_) { }
                }
                // 9. Fetch locations with ALL fields (to see odometer, fuel, etc.)
                let locationSample = null;
                if (firstAsset?.id) {
                    try {
                        const now = Date.now();
                        const hourAgo = now - 3600000 * 24;
                        const period = JSON.stringify({ start: hourAgo, end: now });
                        const locResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}/locations?period=${encodeURIComponent(period)}`, { headers });
                        if (locResp.ok) {
                            const locsRaw = (await locResp.json());
                            // Response can be { locations: [] } or direct array
                            const locs = locsRaw?.locations || (Array.isArray(locsRaw) ? locsRaw : []);
                            locationSample = {
                                rawResponseKeys: typeof locsRaw === 'object' && !Array.isArray(locsRaw) ? Object.keys(locsRaw) : 'direct-array',
                                count: Array.isArray(locs) ? locs.length : 'not-array',
                                allFieldsFirst: Array.isArray(locs) && locs.length > 0 ? Object.keys(locs[0]) : [],
                                samples: Array.isArray(locs) ? locs.slice(0, 3) : locs,
                                lastSample: Array.isArray(locs) && locs.length > 0 ? locs[locs.length - 1] : null,
                            };
                        }
                    }
                    catch (_) { }
                }
                // 10. Fetch trips with a wider period (last 7 days)
                let tripsDetailed = null;
                if (firstAsset?.id) {
                    try {
                        const now = Date.now();
                        const weekAgo = now - 7 * 86400000;
                        const period = JSON.stringify({ start: weekAgo, end: now });
                        const trResp = await fetch(`${apiUrl}/api/accounts/${echoesCred.accountId}/assets/${firstAsset.id}/trips?period=${encodeURIComponent(period)}`, { headers });
                        if (trResp.ok) {
                            const trData = (await trResp.json());
                            const trips = trData?.trips || trData;
                            tripsDetailed = {
                                rawKeys: Object.keys(trData || {}),
                                tripCount: Array.isArray(trips) ? trips.length : 'not-array',
                                sampleTrips: Array.isArray(trips) ? trips.slice(0, 3) : trips,
                                tripFields: Array.isArray(trips) && trips.length > 0 ? Object.keys(trips[0]) : [],
                            };
                        }
                    }
                    catch (_) { }
                }
                results.push({
                    orgId,
                    listFields: firstAsset ? Object.keys(firstAsset) : [],
                    sampleFromList: firstAsset,
                    assetDetailFields: assetDetail && !assetDetail.error ? Object.keys(assetDetail) : [],
                    assetDetail,
                    locationSample,
                    tripsDetailed,
                    endpointDiscovery,
                });
            }
            catch (err) {
                results.push({ orgId, error: err.message });
            }
        }
        return results;
    }
};
exports.TrackerDiscoveryService = TrackerDiscoveryService;
__decorate([
    (0, schedule_1.Cron)('30 0,12 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], TrackerDiscoveryService.prototype, "discoverNewTrackers", null);
exports.TrackerDiscoveryService = TrackerDiscoveryService = TrackerDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(gps_history_entity_1.GpsHistoryEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(provider_credentials_entity_1.ProviderCredentialsEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(trip_entity_1.TripEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object, typeof (_f = typeof gps_data_pipeline_service_1.GpsDataPipelineService !== "undefined" && gps_data_pipeline_service_1.GpsDataPipelineService) === "function" ? _f : Object])
], TrackerDiscoveryService);


/***/ }),
/* 103 */
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
const super_admin_service_1 = __webpack_require__(104);
const super_admin_controller_1 = __webpack_require__(105);
const gps_providers_module_1 = __webpack_require__(91);
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
/* 104 */
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
const gps_providers_service_1 = __webpack_require__(92);
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
/* 105 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuperAdminController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const super_admin_service_1 = __webpack_require__(104);
const system_config_dto_1 = __webpack_require__(106);
const jwt_auth_guard_1 = __webpack_require__(46);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
const role_enum_1 = __webpack_require__(19);
const tracker_discovery_service_1 = __webpack_require__(102);
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService, trackerDiscovery) {
        this.superAdminService = superAdminService;
        this.trackerDiscovery = trackerDiscovery;
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
    async backfillGpsHistory() {
        // Fire and forget — backfill runs in background
        this.trackerDiscovery.backfillAllExistingVehicles().catch((err) => {
            console.error('Backfill error:', err);
        });
        return { success: true, message: 'Backfill started in background. Check server logs for progress.' };
    }
    async enrichVehicles() {
        // Fire and forget — enrichment runs in background
        this.trackerDiscovery.enrichAllVehicles().catch((err) => {
            console.error('Enrich error:', err);
        });
        return { success: true, message: 'Vehicle enrichment started in background. Check server logs for progress.' };
    }
    async syncTrips(body) {
        const days = body?.days || 30;
        this.trackerDiscovery.syncAllTrips(days).catch((err) => {
            console.error('Trip sync error:', err);
        });
        return { success: true, message: `Trip sync started in background for last ${days} days. Check server logs for progress.` };
    }
    async debugEchoesAssets() {
        return this.trackerDiscovery.debugEchoesAssets();
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], SuperAdminController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], SuperAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], SuperAdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Patch)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Update system configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof system_config_dto_1.SystemConfigDto !== "undefined" && system_config_dto_1.SystemConfigDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], SuperAdminController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('backfill-gps-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Backfill GPS history for all existing vehicles with missing data' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], SuperAdminController.prototype, "backfillGpsHistory", null);
__decorate([
    (0, common_1.Post)('enrich-vehicles'),
    (0, swagger_1.ApiOperation)({ summary: 'Enrich existing vehicles with VIN, plate, brand, model from GPS providers' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], SuperAdminController.prototype, "enrichVehicles", null);
__decorate([
    (0, common_1.Post)('sync-trips'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync trips from GPS providers (last N days)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], SuperAdminController.prototype, "syncTrips", null);
__decorate([
    (0, common_1.Get)('debug-echoes-assets'),
    (0, swagger_1.ApiOperation)({ summary: 'Debug: fetch raw asset data from Echoes API to inspect available fields' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], SuperAdminController.prototype, "debugEchoesAssets", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, swagger_1.ApiTags)('super-admin'),
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof super_admin_service_1.SuperAdminService !== "undefined" && super_admin_service_1.SuperAdminService) === "function" ? _a : Object, typeof (_b = typeof tracker_discovery_service_1.TrackerDiscoveryService !== "undefined" && tracker_discovery_service_1.TrackerDiscoveryService) === "function" ? _b : Object])
], SuperAdminController);


/***/ }),
/* 106 */
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
const class_validator_1 = __webpack_require__(43);
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


/***/ }),
/* 107 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TripsModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const trip_entity_1 = __webpack_require__(33);
const trips_service_1 = __webpack_require__(108);
const trips_controller_1 = __webpack_require__(109);
let TripsModule = class TripsModule {
};
exports.TripsModule = TripsModule;
exports.TripsModule = TripsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([trip_entity_1.TripEntity])],
        controllers: [trips_controller_1.TripsController],
        providers: [trips_service_1.TripsService],
        exports: [trips_service_1.TripsService],
    })
], TripsModule);


/***/ }),
/* 108 */
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
var TripsService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TripsService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(18);
const trip_entity_1 = __webpack_require__(33);
let TripsService = TripsService_1 = class TripsService {
    constructor(tripsRepository) {
        this.tripsRepository = tripsRepository;
        this.logger = new common_1.Logger(TripsService_1.name);
    }
    async findByVehicle(vehicleId, organizationId, options) {
        const qb = this.tripsRepository
            .createQueryBuilder('trip')
            .where('trip.vehicle_id = :vehicleId', { vehicleId })
            .andWhere('trip.organization_id = :organizationId', { organizationId });
        if (options?.startDate) {
            qb.andWhere('trip.start_date_time >= :startDate', { startDate: new Date(options.startDate) });
        }
        if (options?.endDate) {
            qb.andWhere('trip.end_date_time <= :endDate', { endDate: new Date(options.endDate) });
        }
        qb.orderBy('trip.start_date_time', 'DESC');
        qb.take(options?.limit || 50);
        qb.skip(options?.offset || 0);
        const [data, total] = await qb.getManyAndCount();
        return { data, meta: { total, limit: options?.limit || 50, offset: options?.offset || 0 } };
    }
    async findByOrganization(organizationId, options) {
        const qb = this.tripsRepository
            .createQueryBuilder('trip')
            .where('trip.organization_id = :organizationId', { organizationId });
        if (options?.startDate) {
            qb.andWhere('trip.start_date_time >= :startDate', { startDate: new Date(options.startDate) });
        }
        if (options?.endDate) {
            qb.andWhere('trip.end_date_time <= :endDate', { endDate: new Date(options.endDate) });
        }
        qb.orderBy('trip.start_date_time', 'DESC');
        qb.take(options?.limit || 50);
        qb.skip(options?.offset || 0);
        const [data, total] = await qb.getManyAndCount();
        return { data, meta: { total, limit: options?.limit || 50, offset: options?.offset || 0 } };
    }
    async getVehicleStats(vehicleId, organizationId) {
        const result = await this.tripsRepository
            .createQueryBuilder('trip')
            .select([
            'COUNT(trip.id) as "totalTrips"',
            'SUM(trip.distance) as "totalDistance"',
            'SUM(trip.duration) as "totalDuration"',
            'MAX(trip.end_mileage) as "lastMileage"',
            'MIN(trip.start_date_time) as "firstTrip"',
            'MAX(trip.end_date_time) as "lastTrip"',
            'AVG(trip.distance) as "avgDistance"',
            'AVG(trip.duration) as "avgDuration"',
        ])
            .where('trip.vehicle_id = :vehicleId', { vehicleId })
            .andWhere('trip.organization_id = :organizationId', { organizationId })
            .getRawOne();
        return {
            totalTrips: parseInt(result?.totalTrips || '0'),
            totalDistanceKm: Math.round((parseInt(result?.totalDistance || '0') / 1000) * 10) / 10,
            totalDurationHours: Math.round((parseInt(result?.totalDuration || '0') / 3600) * 10) / 10,
            lastMileageKm: result?.lastMileage ? Math.round(parseInt(result.lastMileage) / 1000) : null,
            firstTrip: result?.firstTrip,
            lastTrip: result?.lastTrip,
            avgDistanceKm: Math.round((parseFloat(result?.avgDistance || '0') / 1000) * 10) / 10,
            avgDurationMin: Math.round((parseFloat(result?.avgDuration || '0') / 60) * 10) / 10,
        };
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = TripsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trip_entity_1.TripEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TripsService);


/***/ }),
/* 109 */
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
exports.TripsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const trips_service_1 = __webpack_require__(108);
const jwt_auth_guard_1 = __webpack_require__(46);
const roles_guard_1 = __webpack_require__(56);
const roles_decorator_1 = __webpack_require__(57);
const role_enum_1 = __webpack_require__(19);
let TripsController = class TripsController {
    constructor(tripsService) {
        this.tripsService = tripsService;
    }
    async listTrips(organizationId, vehicleId, startDate, endDate, limit, offset) {
        const opts = {
            startDate,
            endDate,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        };
        if (vehicleId) {
            return this.tripsService.findByVehicle(vehicleId, organizationId, opts);
        }
        return this.tripsService.findByOrganization(organizationId, opts);
    }
    async getVehicleStats(organizationId, vehicleId) {
        return this.tripsService.getVehicleStats(vehicleId, organizationId);
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List trips for an organization' }),
    (0, swagger_1.ApiQuery)({ name: 'vehicleId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)('vehicleId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "listTrips", null);
__decorate([
    (0, common_1.Get)('vehicle/:vehicleId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trip statistics for a vehicle' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getVehicleStats", null);
exports.TripsController = TripsController = __decorate([
    (0, swagger_1.ApiTags)('trips'),
    (0, common_1.Controller)('organizations/:organizationId/trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER, role_enum_1.Role.OPERATOR, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof trips_service_1.TripsService !== "undefined" && trips_service_1.TripsService) === "function" ? _a : Object])
], TripsController);


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