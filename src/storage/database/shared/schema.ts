import { pgTable, serial, timestamp, text, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 健康检查表（系统内置）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户资料表
export const userProfiles = pgTable("user_profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique(),
	nickname: text("nickname"),
	avatar: text("avatar"),
	selectedCharacter: text("selected_character"),  // 选择的角色ID
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
