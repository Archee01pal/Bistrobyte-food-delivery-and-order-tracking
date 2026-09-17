"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor() {
        this.usersTable = new Map();
    }
    async onModuleInit() {
        const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
        const defaultAdmin = {
            id: 'usr_admin_01',
            email: 'paliwalarchee@gmail.com',
            passwordHash: defaultPasswordHash,
            name: 'Archee Paliwal',
            role: 'restaurant_admin',
            createdAt: new Date(),
        };
        this.usersTable.set(defaultAdmin.id, defaultAdmin);
    }
    async createUser(email, passwordRaw, name, role) {
        const existing = Array.from(this.usersTable.values()).find(u => u.email === email);
        if (existing)
            throw new common_1.ConflictException('User with this email already exists.');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordRaw, salt);
        const newUser = {
            id: `usr_${Date.now()}`,
            email,
            passwordHash,
            name,
            role,
            createdAt: new Date(),
        };
        this.usersTable.set(newUser.id, newUser);
        return newUser;
    }
    findByEmail(email) {
        return Array.from(this.usersTable.values()).find(u => u.email === email);
    }
    findById(id) {
        const user = this.usersTable.get(id);
        if (!user)
            throw new common_1.NotFoundException('User profile not found.');
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map