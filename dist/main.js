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
const configuration_1 = __webpack_require__(13);
const validation_schema_1 = __webpack_require__(14);
const auth_module_1 = __webpack_require__(16);
const users_module_1 = __webpack_require__(33);
const organizations_module_1 = __webpack_require__(45);
const vehicles_module_1 = __webpack_require__(51);
const gps_history_module_1 = __webpack_require__(59);
const geofences_module_1 = __webpack_require__(65);
const alerts_module_1 = __webpack_require__(72);
const reports_module_1 = __webpack_require__(80);
const gps_providers_module_1 = __webpack_require__(84);
const queue_module_1 = __webpack_require__(92);
const super_admin_module_1 = __webpack_require__(99);
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
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: config.isDevelopment,
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
            queue_module_1.QueueModule,
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getConfiguration = void 0;
exports.configuration = configuration;
const validation_schema_1 = __webpack_require__(14);
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
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configValidationSchema = void 0;
const zod_1 = __webpack_require__(15);
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
/* 15 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 16 */
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
const jwt_1 = __webpack_require__(17);
const passport_1 = __webpack_require__(18);
const config_1 = __webpack_require__(10);
const auth_service_1 = __webpack_require__(19);
const auth_controller_1 = __webpack_require__(23);
const jwt_strategy_1 = __webpack_require__(31);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
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
/* 17 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 19 */
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(3);
const jwt_1 = __webpack_require__(17);
const config_1 = __webpack_require__(10);
const bcrypt = __importStar(__webpack_require__(20));
const crypto = __importStar(__webpack_require__(21));
const role_enum_1 = __webpack_require__(22);
let AuthService = class AuthService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.users = new Map(); // Placeholder for DB
    }
    async login(loginDto) {
        const user = this.getUserByEmail(loginDto.email);
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
        return this.generateTokens(user);
    }
    async register(registerDto) {
        const existingUser = this.getUserByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const userId = crypto.randomUUID();
        const organizationId = crypto.randomUUID();
        const newUser = {
            id: userId,
            email: registerDto.email,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            password: hashedPassword,
            role: role_enum_1.Role.ADMIN, // First user is admin
            organizationId,
            isActive: true,
        };
        this.users.set(userId, newUser);
        return this.generateTokens(newUser);
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
    getUserByEmail(email) {
        const users = Array.from(this.users.values());
        return users.find((u) => u.email === email);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], AuthService);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 22 */
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(19);
const login_dto_1 = __webpack_require__(24);
const register_dto_1 = __webpack_require__(26);
const auth_response_dto_1 = __webpack_require__(27);
const jwt_auth_guard_1 = __webpack_require__(28);
const current_user_decorator_1 = __webpack_require__(29);
const user_payload_interface_1 = __webpack_require__(30);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginDto = void 0;
const class_validator_1 = __webpack_require__(25);
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
/* 25 */
/***/ ((module) => {

module.exports = require("class-validator");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(25);
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
/* 28 */
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
const passport_1 = __webpack_require__(18);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 29 */
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
/* 30 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(18);
const passport_jwt_1 = __webpack_require__(32);
const config_1 = __webpack_require__(10);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
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
/* 32 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 33 */
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
const users_service_1 = __webpack_require__(34);
const users_controller_1 = __webpack_require__(35);
const user_entity_1 = __webpack_require__(38);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(3);
const bcrypt = __importStar(__webpack_require__(20));
const role_enum_1 = __webpack_require__(22);
let UsersService = class UsersService {
    constructor() {
        this.users = new Map(); // Placeholder for DB
    }
    async create(createUserDto, organizationId) {
        const existingUser = this.getUserByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = {
            id: this.generateId(),
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            password: hashedPassword,
            role: createUserDto.role || role_enum_1.Role.OPERATOR,
            organizationId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(user.id, user);
        return this.sanitizeUser(user);
    }
    async findAll(organizationId, paginationDto) {
        const allUsers = Array.from(this.users.values()).filter((u) => u.organizationId === organizationId);
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        // Simple sorting
        allUsers.sort((a, b) => {
            const aVal = a[sort] ?? '';
            const bVal = b[sort] ?? '';
            if (aVal < bVal)
                return order === 'ASC' ? -1 : 1;
            if (aVal > bVal)
                return order === 'ASC' ? 1 : -1;
            return 0;
        });
        const data = allUsers.slice(skip, skip + limit).map((u) => this.sanitizeUser(u));
        const total = allUsers.length;
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
        const user = this.users.get(id);
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
            const existingUser = this.getUserByEmail(updateUserDto.email);
            if (existingUser) {
                throw new common_1.BadRequestException('Email already in use');
            }
        }
        Object.assign(user, updateUserDto);
        user.updatedAt = new Date();
        this.users.set(id, user);
        return this.sanitizeUser(user);
    }
    async remove(id, organizationId) {
        const user = await this.findById(id, organizationId);
        this.users.delete(id);
    }
    getUserByEmail(email) {
        const users = Array.from(this.users.values());
        return users.find((u) => u.email === email);
    }
    sanitizeUser(user) {
        const { password, ...rest } = user;
        return rest;
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);


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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const users_service_1 = __webpack_require__(34);
const create_user_dto_1 = __webpack_require__(36);
const update_user_dto_1 = __webpack_require__(37);
const user_entity_1 = __webpack_require__(38);
const jwt_auth_guard_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(40);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
const pagination_dto_1 = __webpack_require__(43);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const role_enum_1 = __webpack_require__(22);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateUserDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const role_enum_1 = __webpack_require__(22);
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
/* 38 */
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
const typeorm_1 = __webpack_require__(39);
const role_enum_1 = __webpack_require__(22);
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
/* 39 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 40 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(3);
const core_1 = __webpack_require__(1);
const roles_decorator_1 = __webpack_require__(42);
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
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(3);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 43 */
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
const class_validator_1 = __webpack_require__(25);
const class_transformer_1 = __webpack_require__(44);
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
/* 44 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 45 */
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
const organizations_service_1 = __webpack_require__(46);
const organizations_controller_1 = __webpack_require__(47);
const organization_entity_1 = __webpack_require__(50);
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
/* 46 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsService = void 0;
const common_1 = __webpack_require__(3);
let OrganizationsService = class OrganizationsService {
    constructor() {
        this.organizations = new Map();
    }
    async create(createOrgDto) {
        const existing = this.getBySlug(createOrgDto.slug);
        if (existing) {
            throw new common_1.BadRequestException('Organization slug already exists');
        }
        const org = {
            id: this.generateId(),
            name: createOrgDto.name,
            slug: createOrgDto.slug,
            settings: createOrgDto.settings || {},
            isActive: true,
            subscriptionStatus: 'active',
            apiKeys: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.organizations.set(org.id, org);
        return org;
    }
    async findAll() {
        return Array.from(this.organizations.values());
    }
    async findById(id) {
        const org = this.organizations.get(id);
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async update(id, updateOrgDto) {
        const org = await this.findById(id);
        Object.assign(org, updateOrgDto);
        org.updatedAt = new Date();
        this.organizations.set(id, org);
        return org;
    }
    async remove(id) {
        await this.findById(id);
        this.organizations.delete(id);
    }
    getBySlug(slug) {
        const orgs = Array.from(this.organizations.values());
        return orgs.find((o) => o.slug === slug);
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)()
], OrganizationsService);


/***/ }),
/* 47 */
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
const organizations_service_1 = __webpack_require__(46);
const create_organization_dto_1 = __webpack_require__(48);
const update_organization_dto_1 = __webpack_require__(49);
const organization_entity_1 = __webpack_require__(50);
const jwt_auth_guard_1 = __webpack_require__(28);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateOrganizationDto = void 0;
const class_validator_1 = __webpack_require__(25);
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
    (0, class_validator_1.IsSlug)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateOrganizationDto.prototype, "settings", void 0);


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
exports.UpdateOrganizationDto = void 0;
const class_validator_1 = __webpack_require__(25);
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationEntity = void 0;
const typeorm_1 = __webpack_require__(39);
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
/* 51 */
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
const vehicles_service_1 = __webpack_require__(52);
const vehicles_controller_1 = __webpack_require__(54);
const vehicle_entity_1 = __webpack_require__(57);
const vehicle_group_entity_1 = __webpack_require__(58);
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
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesService = void 0;
const common_1 = __webpack_require__(3);
const vehicle_status_enum_1 = __webpack_require__(53);
let VehiclesService = class VehiclesService {
    constructor() {
        this.vehicles = new Map();
    }
    async create(createVehicleDto, organizationId) {
        const existing = this.getByPlateAndOrg(createVehicleDto.plate, organizationId);
        if (existing) {
            throw new common_1.BadRequestException('Vehicle with this plate already exists in organization');
        }
        const vehicle = {
            id: this.generateId(),
            name: createVehicleDto.name,
            plate: createVehicleDto.plate,
            vin: createVehicleDto.vin,
            brand: createVehicleDto.brand,
            model: createVehicleDto.model,
            year: createVehicleDto.year,
            type: createVehicleDto.type,
            groupId: createVehicleDto.groupId,
            organizationId,
            deviceImei: createVehicleDto.deviceImei,
            currentSpeed: 0,
            status: createVehicleDto.status || vehicle_status_enum_1.VehicleStatus.ACTIVE,
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.vehicles.set(vehicle.id, vehicle);
        return vehicle;
    }
    async findAll(organizationId, paginationDto) {
        const allVehicles = Array.from(this.vehicles.values()).filter((v) => v.organizationId === organizationId);
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        allVehicles.sort((a, b) => {
            const aVal = a[sort] ?? '';
            const bVal = b[sort] ?? '';
            if (aVal < bVal)
                return order === 'ASC' ? -1 : 1;
            if (aVal > bVal)
                return order === 'ASC' ? 1 : -1;
            return 0;
        });
        const data = allVehicles.slice(skip, skip + limit);
        const total = allVehicles.length;
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
        const vehicle = this.vehicles.get(id);
        if (!vehicle || vehicle.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        return vehicle;
    }
    async update(id, organizationId, updateVehicleDto) {
        const vehicle = await this.findById(id, organizationId);
        Object.assign(vehicle, updateVehicleDto);
        vehicle.updatedAt = new Date();
        this.vehicles.set(id, vehicle);
        return vehicle;
    }
    async updatePosition(id, organizationId, lat, lng, speed, heading) {
        const vehicle = await this.findById(id, organizationId);
        vehicle.currentLat = lat;
        vehicle.currentLng = lng;
        vehicle.currentSpeed = speed;
        if (heading !== undefined) {
            vehicle.currentHeading = heading;
        }
        vehicle.lastCommunication = new Date();
        vehicle.updatedAt = new Date();
        this.vehicles.set(id, vehicle);
        return vehicle;
    }
    async remove(id, organizationId) {
        await this.findById(id, organizationId);
        this.vehicles.delete(id);
    }
    getByPlateAndOrg(plate, organizationId) {
        const vehicles = Array.from(this.vehicles.values());
        return vehicles.find((v) => v.plate === plate && v.organizationId === organizationId);
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)()
], VehiclesService);


/***/ }),
/* 53 */
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const vehicles_service_1 = __webpack_require__(52);
const create_vehicle_dto_1 = __webpack_require__(55);
const update_vehicle_dto_1 = __webpack_require__(56);
const vehicle_entity_1 = __webpack_require__(57);
const jwt_auth_guard_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(40);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
const pagination_dto_1 = __webpack_require__(43);
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
exports.CreateVehicleDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const vehicle_status_enum_1 = __webpack_require__(53);
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateVehicleDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const vehicle_status_enum_1 = __webpack_require__(53);
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleEntity = void 0;
const typeorm_1 = __webpack_require__(39);
const vehicle_status_enum_1 = __webpack_require__(53);
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleGroupEntity = void 0;
const typeorm_1 = __webpack_require__(39);
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
/* 59 */
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
const gps_history_service_1 = __webpack_require__(60);
const gps_history_controller_1 = __webpack_require__(61);
const gps_history_entity_1 = __webpack_require__(63);
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
/* 60 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryService = void 0;
const common_1 = __webpack_require__(3);
let GpsHistoryService = class GpsHistoryService {
    constructor() {
        this.gpsHistory = [];
    }
    async recordPosition(gpsData, organizationId) {
        const record = {
            id: this.generateId(),
            vehicleId: gpsData.vehicleId,
            organizationId,
            lat: gpsData.lat,
            lng: gpsData.lng,
            speed: gpsData.speed,
            heading: gpsData.heading,
            altitude: gpsData.altitude,
            accuracy: gpsData.accuracy,
            provider: gpsData.provider,
            metadata: gpsData.raw,
            createdAt: gpsData.timestamp,
        };
        this.gpsHistory.push(record);
        return record;
    }
    async getHistory(organizationId, query) {
        const startDate = new Date(query.startDate);
        const endDate = new Date(query.endDate);
        let records = this.gpsHistory.filter((r) => r.vehicleId === query.vehicleId &&
            r.organizationId === organizationId &&
            r.createdAt >= startDate &&
            r.createdAt <= endDate);
        records.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        // Apply interval-based sampling if specified
        if (query.interval) {
            records = this.applyIntervalSampling(records, query.interval);
        }
        const page = query.page || 1;
        const limit = query.limit || 100;
        const skip = (page - 1) * limit;
        const total = records.length;
        const data = records.slice(skip, skip + limit);
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
    applyIntervalSampling(records, intervalSeconds) {
        if (records.length === 0)
            return [];
        const sampled = [];
        let lastTimestamp = records[0].createdAt.getTime();
        sampled.push(records[0]);
        for (let i = 1; i < records.length; i++) {
            const currentTime = records[i].createdAt.getTime();
            if (currentTime - lastTimestamp >= intervalSeconds * 1000) {
                sampled.push(records[i]);
                lastTimestamp = currentTime;
            }
        }
        return sampled;
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.GpsHistoryService = GpsHistoryService;
exports.GpsHistoryService = GpsHistoryService = __decorate([
    (0, common_1.Injectable)()
], GpsHistoryService);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const gps_history_service_1 = __webpack_require__(60);
const query_history_dto_1 = __webpack_require__(62);
const jwt_auth_guard_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(40);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
let GpsHistoryController = class GpsHistoryController {
    constructor(gpsHistoryService) {
        this.gpsHistoryService = gpsHistoryService;
    }
    async getHistory(organizationId, query) {
        return this.gpsHistoryService.getHistory(organizationId, query);
    }
    async getPlaybackData(organizationId, vehicleId, query) {
        const historyQuery = { ...query, vehicleId };
        const result = await this.gpsHistoryService.getHistory(organizationId, historyQuery);
        return {
            vehicleId,
            data: result.data,
            meta: result.meta,
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryHistoryDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(44);
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsHistoryEntity = void 0;
const typeorm_1 = __webpack_require__(39);
const provider_enum_1 = __webpack_require__(64);
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
    (0, typeorm_1.Column)({ type: 'enum', enum: provider_enum_1.Provider }),
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
/* 64 */
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
/* 65 */
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
const geofences_service_1 = __webpack_require__(66);
const geofences_controller_1 = __webpack_require__(68);
const geofence_entity_1 = __webpack_require__(67);
const vehicle_geofence_entity_1 = __webpack_require__(71);
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
/* 66 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesService = void 0;
const common_1 = __webpack_require__(3);
const geofence_entity_1 = __webpack_require__(67);
let GeofencesService = class GeofencesService {
    constructor() {
        this.geofences = new Map();
        this.vehicleGeofences = new Map();
    }
    async create(createGeofenceDto, organizationId) {
        const geofence = {
            id: this.generateId(),
            name: createGeofenceDto.name,
            type: createGeofenceDto.type,
            geometry: createGeofenceDto.geometry,
            color: createGeofenceDto.color,
            organizationId,
            isActive: createGeofenceDto.isActive ?? true,
            schedule: createGeofenceDto.schedule,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.geofences.set(geofence.id, geofence);
        return geofence;
    }
    async findAll(organizationId, paginationDto) {
        const allGeofences = Array.from(this.geofences.values()).filter((g) => g.organizationId === organizationId);
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        allGeofences.sort((a, b) => {
            const aVal = a[sort] ?? '';
            const bVal = b[sort] ?? '';
            if (aVal < bVal)
                return order === 'ASC' ? -1 : 1;
            if (aVal > bVal)
                return order === 'ASC' ? 1 : -1;
            return 0;
        });
        const data = allGeofences.slice(skip, skip + limit);
        const total = allGeofences.length;
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
        const geofence = this.geofences.get(id);
        if (!geofence || geofence.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Geofence not found');
        }
        return geofence;
    }
    async update(id, organizationId, updateGeofenceDto) {
        const geofence = await this.findById(id, organizationId);
        Object.assign(geofence, updateGeofenceDto);
        geofence.updatedAt = new Date();
        this.geofences.set(id, geofence);
        return geofence;
    }
    async remove(id, organizationId) {
        await this.findById(id, organizationId);
        this.geofences.delete(id);
        this.vehicleGeofences.delete(id);
    }
    async assignToVehicle(geofenceId, vehicleId, organizationId, alertOnEntry = true, alertOnExit = true) {
        const geofence = await this.findById(geofenceId, organizationId);
        const vgKey = `${vehicleId}-${geofenceId}`;
        const existing = this.vehicleGeofences.get(vgKey);
        if (existing) {
            throw new common_1.BadRequestException('Geofence already assigned to vehicle');
        }
        const vehicleGeofence = {
            id: this.generateId(),
            vehicleId,
            geofenceId,
            alertOnEntry,
            alertOnExit,
            createdAt: new Date(),
        };
        if (!this.vehicleGeofences.has(geofenceId)) {
            this.vehicleGeofences.set(geofenceId, []);
        }
        this.vehicleGeofences.get(geofenceId).push(vehicleGeofence);
        return vehicleGeofence;
    }
    async checkContainment(lat, lng) {
        const contained = [];
        for (const geofence of this.geofences.values()) {
            if (!geofence.isActive)
                continue;
            if (geofence.type === geofence_entity_1.GeofenceType.CIRCLE) {
                const centerLat = geofence.geometry.coordinates[0];
                const centerLng = geofence.geometry.coordinates[1];
                const radius = geofence.geometry.radius; // meters
                const distance = this.calculateDistance(lat, lng, centerLat, centerLng);
                if (distance <= radius) {
                    contained.push(geofence);
                }
            }
            else if (geofence.type === geofence_entity_1.GeofenceType.POLYGON) {
                if (this.isPointInPolygon(lat, lng, geofence.geometry.coordinates)) {
                    contained.push(geofence);
                }
            }
            else if (geofence.type === geofence_entity_1.GeofenceType.RECTANGLE) {
                const [minLat, minLng, maxLat, maxLng] = geofence.geometry.bounds;
                if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
                    contained.push(geofence);
                }
            }
        }
        return contained;
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    isPointInPolygon(lat, lng, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [latI, lngI] = polygon[i];
            const [latJ, lngJ] = polygon[j];
            if (lngI > lng !== lngJ > lng &&
                lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI) {
                inside = !inside;
            }
        }
        return inside;
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.GeofencesService = GeofencesService;
exports.GeofencesService = GeofencesService = __decorate([
    (0, common_1.Injectable)()
], GeofencesService);


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofenceEntity = exports.GeofenceType = void 0;
const typeorm_1 = __webpack_require__(39);
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
    (0, typeorm_1.Column)({ type: 'enum', enum: GeofenceType }),
    __metadata("design:type", String)
], GeofenceEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], GeofenceEntity.prototype, "geometry", void 0);
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
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], GeofenceEntity.prototype, "schedule", void 0);
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeofencesController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const geofences_service_1 = __webpack_require__(66);
const create_geofence_dto_1 = __webpack_require__(69);
const update_geofence_dto_1 = __webpack_require__(70);
const geofence_entity_1 = __webpack_require__(67);
const jwt_auth_guard_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(40);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
const pagination_dto_1 = __webpack_require__(43);
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
        return this.geofencesService.assignToVehicle(geofenceId, vehicleId, organizationId);
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateGeofenceDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const geofence_entity_1 = __webpack_require__(67);
class CreateGeofenceDto {
}
exports.CreateGeofenceDto = CreateGeofenceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGeofenceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: geofence_entity_1.GeofenceType }),
    (0, class_validator_1.IsEnum)(geofence_entity_1.GeofenceType),
    __metadata("design:type", typeof (_a = typeof geofence_entity_1.GeofenceType !== "undefined" && geofence_entity_1.GeofenceType) === "function" ? _a : Object)
], CreateGeofenceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GeoJSON-like geometry object' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateGeofenceDto.prototype, "geometry", void 0);
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
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], CreateGeofenceDto.prototype, "schedule", void 0);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateGeofenceDto = void 0;
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const geofence_entity_1 = __webpack_require__(67);
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
    (0, swagger_1.ApiPropertyOptional)({ enum: geofence_entity_1.GeofenceType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(geofence_entity_1.GeofenceType),
    __metadata("design:type", typeof (_a = typeof geofence_entity_1.GeofenceType !== "undefined" && geofence_entity_1.GeofenceType) === "function" ? _a : Object)
], UpdateGeofenceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], UpdateGeofenceDto.prototype, "geometry", void 0);
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
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], UpdateGeofenceDto.prototype, "schedule", void 0);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleGeofenceEntity = void 0;
const typeorm_1 = __webpack_require__(39);
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
/* 72 */
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
const alerts_service_1 = __webpack_require__(73);
const alerts_controller_1 = __webpack_require__(74);
const alert_entity_1 = __webpack_require__(75);
const alert_rule_entity_1 = __webpack_require__(77);
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
/* 73 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsService = void 0;
const common_1 = __webpack_require__(3);
let AlertsService = class AlertsService {
    constructor() {
        this.alerts = new Map();
        this.alertRules = new Map();
    }
    async createAlert(type, severity, vehicleId, organizationId, message, data) {
        const alert = {
            id: this.generateId(),
            type,
            severity,
            vehicleId,
            organizationId,
            message,
            data,
            isAcknowledged: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.alerts.set(alert.id, alert);
        return alert;
    }
    async getAlerts(organizationId, query) {
        let allAlerts = Array.from(this.alerts.values()).filter((a) => a.organizationId === organizationId);
        // Apply filters
        if (query.vehicleId) {
            allAlerts = allAlerts.filter((a) => a.vehicleId === query.vehicleId);
        }
        if (query.type) {
            allAlerts = allAlerts.filter((a) => a.type === query.type);
        }
        if (query.severity) {
            allAlerts = allAlerts.filter((a) => a.severity === query.severity);
        }
        if (query.isAcknowledged !== undefined) {
            allAlerts = allAlerts.filter((a) => a.isAcknowledged === query.isAcknowledged);
        }
        // Sort
        const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = query;
        const skip = (page - 1) * limit;
        allAlerts.sort((a, b) => {
            const aVal = a[sort] ?? '';
            const bVal = b[sort] ?? '';
            if (aVal < bVal)
                return order === 'ASC' ? -1 : 1;
            if (aVal > bVal)
                return order === 'ASC' ? 1 : -1;
            return 0;
        });
        const data = allAlerts.slice(skip, skip + limit);
        const total = allAlerts.length;
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
    async acknowledgeAlert(id, organizationId, userId) {
        const alert = this.alerts.get(id);
        if (!alert || alert.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Alert not found');
        }
        alert.isAcknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();
        alert.updatedAt = new Date();
        this.alerts.set(id, alert);
        return alert;
    }
    async acknowledgeMultiple(ids, organizationId, userId) {
        for (const id of ids) {
            const alert = this.alerts.get(id);
            if (alert && alert.organizationId === organizationId) {
                alert.isAcknowledged = true;
                alert.acknowledgedBy = userId;
                alert.acknowledgedAt = new Date();
                alert.updatedAt = new Date();
                this.alerts.set(id, alert);
            }
        }
    }
    async createAlertRule(createRuleDto, organizationId) {
        const rule = {
            id: this.generateId(),
            name: createRuleDto.name,
            type: createRuleDto.type,
            conditions: createRuleDto.conditions,
            organizationId,
            isActive: createRuleDto.isActive ?? true,
            notificationChannels: createRuleDto.notificationChannels,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.alertRules.set(rule.id, rule);
        return rule;
    }
    async getAlertRules(organizationId) {
        return Array.from(this.alertRules.values()).filter((r) => r.organizationId === organizationId);
    }
    async updateAlertRule(id, organizationId, updates) {
        const rule = this.alertRules.get(id);
        if (!rule || rule.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Alert rule not found');
        }
        Object.assign(rule, updates);
        rule.updatedAt = new Date();
        this.alertRules.set(id, rule);
        return rule;
    }
    async deleteAlertRule(id, organizationId) {
        const rule = this.alertRules.get(id);
        if (!rule || rule.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Alert rule not found');
        }
        this.alertRules.delete(id);
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)()
], AlertsService);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(2);
const alerts_service_1 = __webpack_require__(73);
const alert_entity_1 = __webpack_require__(75);
const alert_rule_entity_1 = __webpack_require__(77);
const create_alert_rule_dto_1 = __webpack_require__(78);
const query_alerts_dto_1 = __webpack_require__(79);
const jwt_auth_guard_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(40);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const current_user_decorator_1 = __webpack_require__(29);
const role_enum_1 = __webpack_require__(22);
const user_payload_interface_1 = __webpack_require__(30);
let AlertsController = class AlertsController {
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    async getAlerts(organizationId, query) {
        return this.alertsService.getAlerts(organizationId, query);
    }
    async acknowledgeAlert(organizationId, id, user) {
        return this.alertsService.acknowledgeAlert(id, organizationId, user.userId);
    }
    async acknowledgeMultiple(organizationId, body, user) {
        return this.alertsService.acknowledgeMultiple(body.ids, organizationId, user.userId);
    }
    async createRule(organizationId, createRuleDto) {
        return this.alertsService.createAlertRule(createRuleDto, organizationId);
    }
    async getRules(organizationId) {
        return this.alertsService.getAlertRules(organizationId);
    }
    async updateRule(organizationId, ruleId, updates) {
        return this.alertsService.updateAlertRule(ruleId, organizationId, updates);
    }
    async deleteRule(organizationId, ruleId) {
        return this.alertsService.deleteAlertRule(ruleId, organizationId);
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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertEntity = void 0;
const typeorm_1 = __webpack_require__(39);
const alert_type_enum_1 = __webpack_require__(76);
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
/* 76 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertRuleEntity = void 0;
const typeorm_1 = __webpack_require__(39);
const alert_type_enum_1 = __webpack_require__(76);
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
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const alert_type_enum_1 = __webpack_require__(76);
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
const class_validator_1 = __webpack_require__(25);
const swagger_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(44);
const pagination_dto_1 = __webpack_require__(43);
const alert_type_enum_1 = __webpack_require__(76);
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
const class_validator_1 = __webpack_require__(25);
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
const jwt_auth_guard_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(40);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
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
const schedule_1 = __webpack_require__(12);
const gps_providers_service_1 = __webpack_require__(85);
const flespi_adapter_1 = __webpack_require__(86);
const echoes_adapter_1 = __webpack_require__(89);
const ubiwan_adapter_1 = __webpack_require__(90);
const keeptrace_adapter_1 = __webpack_require__(91);
const data_normalizer_service_1 = __webpack_require__(88);
let GpsProvidersModule = class GpsProvidersModule {
};
exports.GpsProvidersModule = GpsProvidersModule;
exports.GpsProvidersModule = GpsProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        providers: [
            gps_providers_service_1.GpsProvidersService,
            flespi_adapter_1.FlespiAdapter,
            echoes_adapter_1.EchoesAdapter,
            ubiwan_adapter_1.UbiwanAdapter,
            keeptrace_adapter_1.KeepTraceAdapter,
            data_normalizer_service_1.DataNormalizerService,
        ],
        exports: [gps_providers_service_1.GpsProvidersService, data_normalizer_service_1.DataNormalizerService, flespi_adapter_1.FlespiAdapter, echoes_adapter_1.EchoesAdapter, ubiwan_adapter_1.UbiwanAdapter, keeptrace_adapter_1.KeepTraceAdapter],
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsProvidersService = void 0;
const common_1 = __webpack_require__(3);
const flespi_adapter_1 = __webpack_require__(86);
const echoes_adapter_1 = __webpack_require__(89);
const ubiwan_adapter_1 = __webpack_require__(90);
const data_normalizer_service_1 = __webpack_require__(88);
let GpsProvidersService = GpsProvidersService_1 = class GpsProvidersService {
    constructor(flespiAdapter, echoesAdapter, ubiwanAdapter, normalizer) {
        this.flespiAdapter = flespiAdapter;
        this.echoesAdapter = echoesAdapter;
        this.ubiwanAdapter = ubiwanAdapter;
        this.normalizer = normalizer;
        this.providers = new Map();
        this.logger = new common_1.Logger(GpsProvidersService_1.name);
        this.registerProviders();
    }
    registerProviders() {
        this.providers.set('FLESPI', this.flespiAdapter);
        this.providers.set('ECHOES', this.echoesAdapter);
        this.providers.set('UBIWAN', this.ubiwanAdapter);
    }
    async initializeProviders() {
        for (const [name, provider] of this.providers) {
            try {
                await provider.connect();
                this.logger.log(`${name} provider initialized`);
            }
            catch (error) {
                this.logger.error(`Failed to initialize ${name} provider:`, error);
            }
        }
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
        return status;
    }
    getNormalizer() {
        return this.normalizer;
    }
};
exports.GpsProvidersService = GpsProvidersService;
exports.GpsProvidersService = GpsProvidersService = GpsProvidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof flespi_adapter_1.FlespiAdapter !== "undefined" && flespi_adapter_1.FlespiAdapter) === "function" ? _a : Object, typeof (_b = typeof echoes_adapter_1.EchoesAdapter !== "undefined" && echoes_adapter_1.EchoesAdapter) === "function" ? _b : Object, typeof (_c = typeof ubiwan_adapter_1.UbiwanAdapter !== "undefined" && ubiwan_adapter_1.UbiwanAdapter) === "function" ? _c : Object, typeof (_d = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _d : Object])
], GpsProvidersService);


/***/ }),
/* 86 */
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
var FlespiAdapter_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FlespiAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const mqtt = __importStar(__webpack_require__(87));
const data_normalizer_service_1 = __webpack_require__(88);
let FlespiAdapter = FlespiAdapter_1 = class FlespiAdapter {
    constructor(configService, normalizer) {
        this.configService = configService;
        this.normalizer = normalizer;
        this.client = null;
        this.dataCallback = null;
        this.logger = new common_1.Logger(FlespiAdapter_1.name);
    }
    async connect() {
        try {
            const host = this.configService.get('FLESPI_MQTT_HOST');
            const port = this.configService.get('FLESPI_MQTT_PORT', 8883);
            const token = this.configService.get('FLESPI_TOKEN');
            this.client = mqtt.connect(`mqtts://${host}:${port}`, {
                username: 'flespi',
                password: token,
                reconnectPeriod: 5000,
            });
            this.client.on('connect', () => {
                this.logger.log('Connected to Flespi MQTT');
                // Subscribe to all device channels
                this.client.subscribe('flespi/gps/+/data', (err) => {
                    if (err) {
                        this.logger.error('Subscribe error:', err);
                    }
                });
            });
            this.client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    // Extract vehicle ID from topic: flespi/gps/{channelId}/data
                    const channelId = topic.split('/')[2];
                    const normalized = this.normalizer.normalizeFromFlespi(data, channelId);
                    if (this.normalizer.validate(normalized) && this.dataCallback) {
                        this.dataCallback(normalized);
                    }
                }
                catch (error) {
                    this.logger.error('Error processing Flespi message:', error);
                }
            });
            this.client.on('error', (error) => {
                this.logger.error('Flespi connection error:', error);
            });
        }
        catch (error) {
            this.logger.error('Failed to connect to Flespi:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.client) {
            this.client.unsubscribe('flespi/gps/+/data');
            this.client.end();
            this.client = null;
            this.logger.log('Disconnected from Flespi');
        }
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    async getStatus() {
        return {
            connected: this.client ? this.client.connected : false,
        };
    }
};
exports.FlespiAdapter = FlespiAdapter;
exports.FlespiAdapter = FlespiAdapter = FlespiAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], FlespiAdapter);


/***/ }),
/* 87 */
/***/ ((module) => {

module.exports = require("mqtt");

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
exports.DataNormalizerService = void 0;
const common_1 = __webpack_require__(3);
const provider_enum_1 = __webpack_require__(64);
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
var EchoesAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EchoesAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(88);
/**
 * Echoes GPS Adapter
 *
 * API Documentation: https://api.neutral-server.com/
 * Auth: Header "Authorization: Apikey <key>" or "Authorization: Privacykey <key>"
 * Vehicles endpoint: GET /api/assets (paginated, limit=100, offset=0)
 * Single vehicle: GET /api/assets/{uid}
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
        this.apiUrl = this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com');
        this.apiKey = this.configService.get('ECHOES_API_KEY', '');
        this.accountId = this.configService.get('ECHOES_ACCOUNT_ID', '');
    }
    async onModuleInit() {
        if (this.apiKey) {
            await this.connect();
        }
        else {
            this.logger.warn('Echoes API key not configured, adapter disabled');
        }
    }
    async connect() {
        try {
            // Test connection by fetching account info
            const response = await fetch(`${this.apiUrl}/api/accounts/me`, {
                headers: {
                    'Authorization': this.apiKey,
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                this.connected = true;
                this.logger.log(`Echoes adapter connected (Account ID: ${this.accountId})`);
            }
            else {
                this.logger.error(`Echoes connection failed: ${response.status} ${response.statusText}`);
            }
        }
        catch (error) {
            this.logger.error('Echoes connection error:', error);
        }
    }
    async disconnect() {
        this.connected = false;
        this.logger.log('Echoes adapter disconnected');
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    /**
     * Poll Echoes API every 2 minutes
     * Fetches all vehicles with their latest positions
     * API: GET /api/assets?limit=100&offset=0
     * Pagination: iterate with offset until all vehicles are fetched
     */
    async pollEchoesApi() {
        if (!this.connected || !this.dataCallback)
            return;
        try {
            let offset = 0;
            const limit = 100;
            let hasMore = true;
            let totalProcessed = 0;
            while (hasMore) {
                const response = await fetch(`${this.apiUrl}/api/assets?limit=${limit}&offset=${offset}`, {
                    headers: {
                        'Authorization': this.apiKey,
                        'Accept': 'application/json',
                    },
                });
                if (!response.ok) {
                    this.logger.error(`Echoes API error: ${response.status} ${response.statusText}`);
                    break;
                }
                const data = await response.json();
                const vehicles = data.items || data || [];
                if (!Array.isArray(vehicles) || vehicles.length === 0) {
                    hasMore = false;
                    break;
                }
                for (const vehicle of vehicles) {
                    try {
                        const normalized = this.normalizeEchoesData(vehicle);
                        if (normalized && this.normalizer.validate(normalized)) {
                            this.dataCallback(normalized);
                            totalProcessed++;
                        }
                    }
                    catch (err) {
                        this.logger.warn(`Failed to normalize Echoes vehicle ${vehicle.uid || vehicle.id}: ${err}`);
                    }
                }
                offset += limit;
                if (vehicles.length < limit) {
                    hasMore = false;
                }
            }
            this.vehicleCount = totalProcessed;
            this.lastUpdate = new Date();
            this.logger.debug(`Echoes poll complete: ${totalProcessed} vehicles processed`);
        }
        catch (error) {
            this.logger.error('Echoes polling error:', error);
        }
    }
    /**
     * Fetch a single vehicle's latest data by UID
     */
    async getVehicleByUid(uid) {
        const response = await fetch(`${this.apiUrl}/api/assets/${uid}`, {
            headers: {
                'Authorization': this.apiKey,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Echoes API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Fetch a single vehicle's latest data by VIN
     */
    async getVehicleByVin(vin) {
        const response = await fetch(`${this.apiUrl}/api/assets/vin/${vin}`, {
            headers: {
                'Authorization': this.apiKey,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Echoes API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Create a vehicle on Echoes platform
     * Required: name, typeId (3304 legacy)
     * Optional: fleetId, deviceTypeId, vin, brandName
     */
    async createVehicle(params) {
        const body = {
            name: params.name,
            typeId: 3304, // Legacy field, required
        };
        if (params.vin)
            body.vin = params.vin;
        if (params.brandName)
            body.brandName = params.brandName;
        if (params.fleetId)
            body.fleetId = params.fleetId;
        if (params.deviceTypeId)
            body.deviceTypeId = params.deviceTypeId;
        const response = await fetch(`${this.apiUrl}/api/assets`, {
            method: 'POST',
            headers: {
                'Authorization': this.apiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Echoes create vehicle error: ${response.status} - ${error}`);
        }
        return response.json();
    }
    /**
     * Normalize Echoes vehicle data to standard GPS format
     */
    normalizeEchoesData(vehicle) {
        // Echoes returns vehicle with lastPosition or embedded GPS data
        const position = vehicle.lastPosition || vehicle.position || vehicle;
        const lat = position.latitude || position.lat;
        const lng = position.longitude || position.lng || position.lon;
        if (!lat || !lng)
            return null;
        return {
            vehicleId: String(vehicle.uid || vehicle.id),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            speed: parseFloat(position.speed || 0),
            heading: parseFloat(position.heading || position.course || 0),
            altitude: position.altitude ? parseFloat(position.altitude) : undefined,
            timestamp: position.timestamp ? new Date(position.timestamp) : new Date(),
            provider: 'echoes',
            ignition: position.ignition,
            batteryVoltage: position.batteryVoltage || position.battery,
            odometer: position.odometer || position.mileage,
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
exports.EchoesAdapter = EchoesAdapter;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_2_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], EchoesAdapter.prototype, "pollEchoesApi", null);
exports.EchoesAdapter = EchoesAdapter = EchoesAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], EchoesAdapter);


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
var UbiwanAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UbiwanAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(88);
/**
 * Ubiwan GPS Adapter
 *
 * API Documentation: https://api.ubiwan.net/doc/public/index.html
 * Auth: Basic auth (username/password) or session token
 * Server: Phoenix (key: 2311-AA22)
 */
let UbiwanAdapter = UbiwanAdapter_1 = class UbiwanAdapter {
    constructor(configService, normalizer) {
        this.configService = configService;
        this.normalizer = normalizer;
        this.dataCallback = null;
        this.connected = false;
        this.lastUpdate = null;
        this.vehicleCount = 0;
        this.sessionToken = null;
        this.logger = new common_1.Logger(UbiwanAdapter_1.name);
        this.apiUrl = this.configService.get('UBIWAN_API_URL', 'https://api.ubiwan.net');
        this.username = this.configService.get('UBIWAN_USERNAME', '');
        this.password = this.configService.get('UBIWAN_PASSWORD', '');
        this.serverName = this.configService.get('UBIWAN_SERVER_NAME', 'Phoenix');
        this.serverKey = this.configService.get('UBIWAN_SERVER_KEY', '');
        this.license = this.configService.get('UBIWAN_LICENSE', '');
    }
    async onModuleInit() {
        if (this.username && this.password) {
            await this.connect();
        }
        else {
            this.logger.warn('Ubiwan credentials not configured, adapter disabled');
        }
    }
    async connect() {
        try {
            // Authenticate with Ubiwan API to get session token
            const authResponse = await fetch(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password,
                    serverName: this.serverName,
                    serverKey: this.serverKey,
                }),
            });
            if (authResponse.ok) {
                const authData = await authResponse.json();
                this.sessionToken = authData.token || authData.sessionId || authData.access_token;
                this.connected = true;
                this.logger.log(`Ubiwan adapter connected (Server: ${this.serverName}, Account: INEHA FINANCE)`);
            }
            else {
                // Fallback: try Basic Auth
                const basicAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
                const testResponse = await fetch(`${this.apiUrl}/api/vehicles`, {
                    headers: {
                        'Authorization': `Basic ${basicAuth}`,
                        'Accept': 'application/json',
                    },
                });
                if (testResponse.ok) {
                    this.connected = true;
                    this.logger.log(`Ubiwan adapter connected via Basic Auth (Server: ${this.serverName})`);
                }
                else {
                    this.logger.error(`Ubiwan auth failed: ${authResponse.status} ${authResponse.statusText}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Ubiwan connection error:', error);
        }
    }
    async disconnect() {
        this.connected = false;
        this.sessionToken = null;
        this.logger.log('Ubiwan adapter disconnected');
    }
    onData(callback) {
        this.dataCallback = callback;
    }
    /**
     * Build auth headers for Ubiwan API requests
     */
    getAuthHeaders() {
        const headers = {
            'Accept': 'application/json',
        };
        if (this.sessionToken) {
            headers['Authorization'] = `Bearer ${this.sessionToken}`;
        }
        else {
            const basicAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
            headers['Authorization'] = `Basic ${basicAuth}`;
        }
        return headers;
    }
    /**
     * Poll Ubiwan API every 2 minutes
     * Fetches all vehicles with their latest GPS positions
     */
    async pollUbiwanApi() {
        if (!this.connected || !this.dataCallback)
            return;
        try {
            const response = await fetch(`${this.apiUrl}/api/vehicles`, {
                headers: this.getAuthHeaders(),
            });
            if (!response.ok) {
                // If 401, try to reconnect
                if (response.status === 401) {
                    this.logger.warn('Ubiwan session expired, reconnecting...');
                    await this.connect();
                    return;
                }
                this.logger.error(`Ubiwan API error: ${response.status} ${response.statusText}`);
                return;
            }
            const data = await response.json();
            const vehicles = Array.isArray(data) ? data : (data.vehicles || data.items || data.results || []);
            let totalProcessed = 0;
            for (const vehicle of vehicles) {
                try {
                    const normalized = this.normalizeUbiwanData(vehicle);
                    if (normalized && this.normalizer.validate(normalized)) {
                        this.dataCallback(normalized);
                        totalProcessed++;
                    }
                }
                catch (err) {
                    this.logger.warn(`Failed to normalize Ubiwan vehicle ${vehicle.id || vehicle.name}: ${err}`);
                }
            }
            this.vehicleCount = totalProcessed;
            this.lastUpdate = new Date();
            this.logger.debug(`Ubiwan poll complete: ${totalProcessed} vehicles processed`);
        }
        catch (error) {
            this.logger.error('Ubiwan polling error:', error);
        }
    }
    /**
     * Fetch a specific vehicle's position by ID
     */
    async getVehiclePosition(vehicleId) {
        const response = await fetch(`${this.apiUrl}/api/vehicles/${vehicleId}/position`, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Ubiwan API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Fetch vehicle history between two dates
     */
    async getVehicleHistory(vehicleId, startDate, endDate) {
        const response = await fetch(`${this.apiUrl}/api/vehicles/${vehicleId}/history?from=${startDate}&to=${endDate}`, { headers: this.getAuthHeaders() });
        if (!response.ok) {
            throw new Error(`Ubiwan API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Normalize Ubiwan vehicle data to standard GPS format
     */
    normalizeUbiwanData(vehicle) {
        const lat = vehicle.latitude || vehicle.lat || vehicle.position?.latitude;
        const lng = vehicle.longitude || vehicle.lng || vehicle.lon || vehicle.position?.longitude;
        if (!lat || !lng)
            return null;
        return {
            vehicleId: String(vehicle.id || vehicle.vehicleId || vehicle.imei),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            speed: parseFloat(vehicle.speed || vehicle.position?.speed || 0),
            heading: parseFloat(vehicle.heading || vehicle.cap || vehicle.position?.heading || 0),
            altitude: vehicle.altitude ? parseFloat(vehicle.altitude) : undefined,
            timestamp: vehicle.timestamp
                ? new Date(vehicle.timestamp)
                : vehicle.lastUpdate
                    ? new Date(vehicle.lastUpdate)
                    : new Date(),
            provider: 'ubiwan',
            ignition: vehicle.ignition ?? vehicle.contactOn,
            batteryVoltage: vehicle.batteryVoltage || vehicle.battery,
            odometer: vehicle.odometer || vehicle.totalDistance || vehicle.km,
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
exports.UbiwanAdapter = UbiwanAdapter;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_2_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UbiwanAdapter.prototype, "pollUbiwanApi", null);
exports.UbiwanAdapter = UbiwanAdapter = UbiwanAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], UbiwanAdapter);


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
var KeepTraceAdapter_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeepTraceAdapter = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(10);
const schedule_1 = __webpack_require__(12);
const data_normalizer_service_1 = __webpack_require__(88);
/**
 * KeepTrace GPS Adapter
 *
 * API Documentation: https://customerapi.live.keeptrace.fr/Help
 * Auth: API Key passed in header or query parameter
 * Key: 3952311b-f982-46c4-a1a3-8ae691b855cc
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
            // Test connection by fetching vehicles
            const response = await fetch(`${this.apiUrl}/api/vehicles?apiKey=${this.apiKey}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Api-Key': this.apiKey,
                },
            });
            if (response.ok) {
                this.connected = true;
                this.logger.log('KeepTrace adapter connected');
            }
            else {
                this.logger.error(`KeepTrace connection failed: ${response.status} ${response.statusText}`);
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
     * Build request URL with API key
     */
    buildUrl(path, params) {
        const url = new URL(`${this.apiUrl}${path}`);
        url.searchParams.set('apiKey', this.apiKey);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                url.searchParams.set(key, value);
            }
        }
        return url.toString();
    }
    /**
     * Build auth headers for KeepTrace API
     */
    getAuthHeaders() {
        return {
            'Accept': 'application/json',
            'X-Api-Key': this.apiKey,
        };
    }
    /**
     * Poll KeepTrace API every 2 minutes
     */
    async pollKeepTraceApi() {
        if (!this.connected || !this.dataCallback)
            return;
        try {
            const response = await fetch(this.buildUrl('/api/vehicles'), {
                headers: this.getAuthHeaders(),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    this.logger.warn('KeepTrace API key may be expired');
                    this.connected = false;
                }
                this.logger.error(`KeepTrace API error: ${response.status} ${response.statusText}`);
                return;
            }
            const data = await response.json();
            const vehicles = Array.isArray(data) ? data : (data.vehicles || data.items || data.results || []);
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
                    this.logger.warn(`Failed to normalize KeepTrace vehicle ${vehicle.id}: ${err}`);
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
        const response = await fetch(this.buildUrl(`/api/vehicles/${vehicleId}`), {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`KeepTrace API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Fetch vehicle history/trips
     */
    async getVehicleHistory(vehicleId, startDate, endDate) {
        const response = await fetch(this.buildUrl(`/api/vehicles/${vehicleId}/trips`, {
            startDate,
            endDate,
        }), { headers: this.getAuthHeaders() });
        if (!response.ok) {
            throw new Error(`KeepTrace API error: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Normalize KeepTrace vehicle data to standard GPS format
     */
    normalizeKeepTraceData(vehicle) {
        const lat = vehicle.latitude || vehicle.lat || vehicle.lastPosition?.latitude;
        const lng = vehicle.longitude || vehicle.lng || vehicle.lon || vehicle.lastPosition?.longitude;
        if (!lat || !lng)
            return null;
        return {
            vehicleId: String(vehicle.id || vehicle.trackerId || vehicle.imei),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            speed: parseFloat(vehicle.speed || vehicle.lastPosition?.speed || 0),
            heading: parseFloat(vehicle.heading || vehicle.direction || vehicle.lastPosition?.heading || 0),
            altitude: vehicle.altitude ? parseFloat(vehicle.altitude) : undefined,
            timestamp: vehicle.lastPositionDate
                ? new Date(vehicle.lastPositionDate)
                : vehicle.timestamp
                    ? new Date(vehicle.timestamp)
                    : new Date(),
            provider: 'keeptrace',
            ignition: vehicle.ignitionOn ?? vehicle.ignition,
            batteryVoltage: vehicle.batteryLevel || vehicle.battery,
            odometer: vehicle.odometer || vehicle.totalKm,
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
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_2_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], KeepTraceAdapter.prototype, "pollKeepTraceApi", null);
exports.KeepTraceAdapter = KeepTraceAdapter = KeepTraceAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof data_normalizer_service_1.DataNormalizerService !== "undefined" && data_normalizer_service_1.DataNormalizerService) === "function" ? _b : Object])
], KeepTraceAdapter);


/***/ }),
/* 92 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueueModule = void 0;
const common_1 = __webpack_require__(3);
const bull_1 = __webpack_require__(93);
const config_1 = __webpack_require__(10);
const gps_event_producer_1 = __webpack_require__(94);
const gps_processor_consumer_1 = __webpack_require__(96);
const alert_checker_consumer_1 = __webpack_require__(97);
const report_generator_consumer_1 = __webpack_require__(98);
const gps_history_module_1 = __webpack_require__(59);
const vehicles_module_1 = __webpack_require__(51);
const alerts_module_1 = __webpack_require__(72);
const geofences_module_1 = __webpack_require__(65);
const reports_module_1 = __webpack_require__(80);
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    redis: configService.get('REDIS_URL'),
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 2000,
                        },
                        removeOnComplete: true,
                    },
                }),
            }),
            bull_1.BullModule.registerQueue({ name: 'gps-events' }, { name: 'alert-checks' }, { name: 'report-generation' }),
            gps_history_module_1.GpsHistoryModule,
            vehicles_module_1.VehiclesModule,
            alerts_module_1.AlertsModule,
            geofences_module_1.GeofencesModule,
            reports_module_1.ReportsModule,
        ],
        providers: [
            gps_event_producer_1.GpsEventProducer,
            gps_processor_consumer_1.GpsProcessorConsumer,
            alert_checker_consumer_1.AlertCheckerConsumer,
            report_generator_consumer_1.ReportGeneratorConsumer,
        ],
        exports: [gps_event_producer_1.GpsEventProducer],
    })
], QueueModule);


/***/ }),
/* 93 */
/***/ ((module) => {

module.exports = require("@nestjs/bull");

/***/ }),
/* 94 */
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
var GpsEventProducer_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsEventProducer = void 0;
const common_1 = __webpack_require__(3);
const bullmq_1 = __webpack_require__(95);
let GpsEventProducer = GpsEventProducer_1 = class GpsEventProducer {
    constructor(gpsQueue) {
        this.gpsQueue = gpsQueue;
        this.logger = new common_1.Logger(GpsEventProducer_1.name);
    }
    async produceGpsEvent(gpsData) {
        try {
            await this.gpsQueue.add('gps-position', gpsData, {
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to produce GPS event:', error);
            throw error;
        }
    }
    async produceBatchGpsEvents(events) {
        try {
            const jobs = events.map((gpsData) => ({
                name: 'gps-position',
                data: gpsData,
                opts: {
                    removeOnComplete: true,
                    removeOnFail: false,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            }));
            await this.gpsQueue.addBulk(jobs);
        }
        catch (error) {
            this.logger.error('Failed to produce batch GPS events:', error);
            throw error;
        }
    }
};
exports.GpsEventProducer = GpsEventProducer;
exports.GpsEventProducer = GpsEventProducer = GpsEventProducer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('GPS_EVENTS_QUEUE')),
    __metadata("design:paramtypes", [typeof (_a = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _a : Object])
], GpsEventProducer);


/***/ }),
/* 95 */
/***/ ((module) => {

module.exports = require("bullmq");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GpsProcessorConsumer_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GpsProcessorConsumer = void 0;
const bull_1 = __webpack_require__(93);
const common_1 = __webpack_require__(3);
const bull_2 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'bull'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const gps_history_service_1 = __webpack_require__(60);
const vehicles_service_1 = __webpack_require__(52);
let GpsProcessorConsumer = GpsProcessorConsumer_1 = class GpsProcessorConsumer {
    constructor(gpsHistoryService, vehiclesService) {
        this.gpsHistoryService = gpsHistoryService;
        this.vehiclesService = vehiclesService;
        this.logger = new common_1.Logger(GpsProcessorConsumer_1.name);
    }
    async processGpsPosition(job) {
        const { data } = job;
        try {
            this.logger.debug(`Processing GPS position for vehicle ${data.vehicleId}`);
            // In production, would need to extract organizationId from vehicle lookup
            // For now, storing GPS history
            // await this.gpsHistoryService.recordPosition(data, organizationId);
            // Update vehicle current position
            // await this.vehiclesService.updatePosition(
            //   data.vehicleId,
            //   organizationId,
            //   data.lat,
            //   data.lng,
            //   data.speed,
            //   data.heading,
            // );
            this.logger.debug(`GPS position processed for vehicle ${data.vehicleId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process GPS position:`, error);
            throw error;
        }
    }
    onCompleted(job) {
        this.logger.debug(`Completed job ${job.id} for ${job.name}`);
    }
    onFailed(job, error) {
        this.logger.error(`Failed job ${job.id}: ${error.message}`);
    }
};
exports.GpsProcessorConsumer = GpsProcessorConsumer;
__decorate([
    (0, bull_1.Process)('gps-position'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], GpsProcessorConsumer.prototype, "processGpsPosition", null);
__decorate([
    (0, bull_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], GpsProcessorConsumer.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _f : Object, typeof (_g = typeof Error !== "undefined" && Error) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], GpsProcessorConsumer.prototype, "onFailed", null);
exports.GpsProcessorConsumer = GpsProcessorConsumer = GpsProcessorConsumer_1 = __decorate([
    (0, bull_1.Processor)('gps-events'),
    __param(0, (0, common_1.Inject)(gps_history_service_1.GpsHistoryService)),
    __param(1, (0, common_1.Inject)(vehicles_service_1.VehiclesService)),
    __metadata("design:paramtypes", [typeof (_a = typeof gps_history_service_1.GpsHistoryService !== "undefined" && gps_history_service_1.GpsHistoryService) === "function" ? _a : Object, typeof (_b = typeof vehicles_service_1.VehiclesService !== "undefined" && vehicles_service_1.VehiclesService) === "function" ? _b : Object])
], GpsProcessorConsumer);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AlertCheckerConsumer_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertCheckerConsumer = void 0;
const bull_1 = __webpack_require__(93);
const common_1 = __webpack_require__(3);
const bull_2 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'bull'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const alerts_service_1 = __webpack_require__(73);
const geofences_service_1 = __webpack_require__(66);
const alert_type_enum_1 = __webpack_require__(76);
let AlertCheckerConsumer = AlertCheckerConsumer_1 = class AlertCheckerConsumer {
    constructor(alertsService, geofencesService) {
        this.alertsService = alertsService;
        this.geofencesService = geofencesService;
        this.logger = new common_1.Logger(AlertCheckerConsumer_1.name);
    }
    async checkGeofence(job) {
        const { gpsData, organizationId } = job.data;
        try {
            this.logger.debug(`Checking geofences for vehicle ${gpsData.vehicleId}`);
            // Check which geofences contain the position
            const containingGeofences = await this.geofencesService.checkContainment(gpsData.lat, gpsData.lng);
            for (const geofence of containingGeofences) {
                // TODO: Check previous position to determine entry/exit
                // and only create alert if state changed
                await this.alertsService.createAlert(alert_type_enum_1.AlertType.GEOFENCE_ENTRY, alert_type_enum_1.AlertSeverity.MEDIUM, gpsData.vehicleId, organizationId, `Vehicle entered geofence: ${geofence.name}`, { geofenceId: geofence.id, geofenceName: geofence.name });
            }
        }
        catch (error) {
            this.logger.error(`Failed to check geofences:`, error);
            throw error;
        }
    }
    async checkSpeed(job) {
        const { gpsData, speedLimit, organizationId } = job.data;
        try {
            if (gpsData.speed > speedLimit) {
                await this.alertsService.createAlert(alert_type_enum_1.AlertType.OVERSPEED, alert_type_enum_1.AlertSeverity.HIGH, gpsData.vehicleId, organizationId, `Vehicle exceeding speed limit: ${gpsData.speed} km/h (limit: ${speedLimit} km/h)`, { currentSpeed: gpsData.speed, speedLimit });
            }
        }
        catch (error) {
            this.logger.error(`Failed to check speed:`, error);
            throw error;
        }
    }
    onCompleted(job) {
        this.logger.debug(`Completed alert check job ${job.id}`);
    }
    onFailed(job, error) {
        this.logger.error(`Failed alert check job ${job.id}: ${error.message}`);
    }
};
exports.AlertCheckerConsumer = AlertCheckerConsumer;
__decorate([
    (0, bull_1.Process)('check-geofence'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AlertCheckerConsumer.prototype, "checkGeofence", null);
__decorate([
    (0, bull_1.Process)('check-speed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AlertCheckerConsumer.prototype, "checkSpeed", null);
__decorate([
    (0, bull_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AlertCheckerConsumer.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _h : Object, typeof (_j = typeof Error !== "undefined" && Error) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], AlertCheckerConsumer.prototype, "onFailed", null);
exports.AlertCheckerConsumer = AlertCheckerConsumer = AlertCheckerConsumer_1 = __decorate([
    (0, bull_1.Processor)('alert-checks'),
    __param(0, (0, common_1.Inject)(alerts_service_1.AlertsService)),
    __param(1, (0, common_1.Inject)(geofences_service_1.GeofencesService)),
    __metadata("design:paramtypes", [typeof (_a = typeof alerts_service_1.AlertsService !== "undefined" && alerts_service_1.AlertsService) === "function" ? _a : Object, typeof (_b = typeof geofences_service_1.GeofencesService !== "undefined" && geofences_service_1.GeofencesService) === "function" ? _b : Object])
], AlertCheckerConsumer);


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
var ReportGeneratorConsumer_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportGeneratorConsumer = void 0;
const bull_1 = __webpack_require__(93);
const common_1 = __webpack_require__(3);
const bull_2 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'bull'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const reports_service_1 = __webpack_require__(81);
let ReportGeneratorConsumer = ReportGeneratorConsumer_1 = class ReportGeneratorConsumer {
    constructor(reportsService) {
        this.reportsService = reportsService;
        this.logger = new common_1.Logger(ReportGeneratorConsumer_1.name);
    }
    async generateReport(job) {
        const { organizationId, dto } = job.data;
        try {
            this.logger.log(`Generating ${dto.type} report for organization ${organizationId}`);
            const report = await this.reportsService.generateReport(organizationId, dto);
            this.logger.log(`Report generated: ${report.id}`);
            // TODO: Store report, trigger email/webhook notification
        }
        catch (error) {
            this.logger.error(`Failed to generate report:`, error);
            throw error;
        }
    }
    async generateDailyReports() {
        this.logger.log('Starting daily report generation');
        // TODO: Get all organizations and queue daily reports
    }
    onCompleted(job) {
        this.logger.debug(`Completed report generation job ${job.id}`);
    }
    onFailed(job, error) {
        this.logger.error(`Failed report generation job ${job.id}: ${error.message}`);
    }
};
exports.ReportGeneratorConsumer = ReportGeneratorConsumer;
__decorate([
    (0, bull_1.Process)('generate-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ReportGeneratorConsumer.prototype, "generateReport", null);
__decorate([
    (0, bull_1.Cron)(bull_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ReportGeneratorConsumer.prototype, "generateDailyReports", null);
__decorate([
    (0, bull_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], ReportGeneratorConsumer.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _f : Object, typeof (_g = typeof Error !== "undefined" && Error) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], ReportGeneratorConsumer.prototype, "onFailed", null);
exports.ReportGeneratorConsumer = ReportGeneratorConsumer = ReportGeneratorConsumer_1 = __decorate([
    (0, bull_1.Processor)('report-generation'),
    __param(0, (0, common_1.Inject)(reports_service_1.ReportsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof reports_service_1.ReportsService !== "undefined" && reports_service_1.ReportsService) === "function" ? _a : Object])
], ReportGeneratorConsumer);


/***/ }),
/* 99 */
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
const super_admin_service_1 = __webpack_require__(100);
const super_admin_controller_1 = __webpack_require__(101);
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
/* 100 */
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
                redis: { status: 'connected' },
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
/* 101 */
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
const super_admin_service_1 = __webpack_require__(100);
const system_config_dto_1 = __webpack_require__(102);
const jwt_auth_guard_1 = __webpack_require__(28);
const roles_guard_1 = __webpack_require__(41);
const roles_decorator_1 = __webpack_require__(42);
const role_enum_1 = __webpack_require__(22);
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SystemConfigDto = void 0;
const class_validator_1 = __webpack_require__(25);
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
    // Enable CORS
    app.enableCors({
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
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
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(app.get('HttpAdapterHost')));
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
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            defaultModelsExpandDepth: 2,
        },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`\n🚀 Fleet Tracker API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs\n`);
}
bootstrap().catch((error) => {
    console.error('Application bootstrap failed:', error);
    process.exit(1);
});

})();

/******/ })()
;