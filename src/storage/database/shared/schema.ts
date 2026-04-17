import { pgTable, serial, timestamp, unique, pgPolicy, uuid, text, varchar, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	nickname: text(),
	avatar: text(),
	selectedCharacter: text("selected_character"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("user_profiles_user_id_unique").on(table.userId),
	pgPolicy("user_profiles_用户删除自己的数据", { as: "permissive", for: "delete", to: ["public"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("user_profiles_用户更新自己的数据", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("user_profiles_用户插入自己的数据", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("user_profiles_用户读取自己的数据", { as: "permissive", for: "select", to: ["public"] }),
]);

// 客服会话表
export const customerServiceSessions = pgTable("customer_service_sessions", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	userEmail: varchar("user_email", { length: 255 }),
	userNickname: varchar("user_nickname", { length: 100 }),
	status: varchar("status", { length: 20 }).default("open").notNull(), // open, pending, closed
	subject: varchar("subject", { length: 500 }), // 问题主题
	priority: varchar("priority", { length: 10 }).default("normal").notNull(), // low, normal, high, urgent
	lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }),
	unreadCount: serial("unread_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("css_user_id_idx").on(table.userId),
	index("css_status_idx").on(table.status),
	index("css_created_at_idx").on(table.createdAt),
	pgPolicy("css_公开读取", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("css_公开插入", { as: "permissive", for: "insert", to: ["public"], using: sql`true` }),
	pgPolicy("css_公开更新", { as: "permissive", for: "update", to: ["public"], using: sql`true` }),
]);

// 客服消息表
export const customerServiceMessages = pgTable("customer_service_messages", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull().references(() => customerServiceSessions.id),
	senderType: varchar("sender_type", { length: 20 }).notNull(), // user, customer_service, system
	senderId: varchar("sender_id", { length: 100 }), // 用户ID或客服ID
	content: text("content").notNull(),
	messageType: varchar("message_type", { length: 20 }).default("text").notNull(), // text, image, file, system
	isRead: serial("is_read").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("csm_session_id_idx").on(table.sessionId),
	index("csm_created_at_idx").on(table.createdAt),
	pgPolicy("csm_公开读取", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("csm_公开插入", { as: "permissive", for: "insert", to: ["public"], using: sql`true` }),
	pgPolicy("csm_公开更新", { as: "permissive", for: "update", to: ["public"], using: sql`true` }),
]);

// 邮件发送记录表
export const emailLogs = pgTable("email_logs", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	toEmail: varchar("to_email", { length: 255 }).notNull(),
	subject: varchar("subject", { length: 500 }),
	template: varchar("template", { length: 100 }), // 邮件模板类型
	status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, sent, failed
	errorMessage: text("error_message"),
	metadata: text("metadata"), // JSON格式的额外数据
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("el_to_email_idx").on(table.toEmail),
	index("el_status_idx").on(table.status),
	index("el_created_at_idx").on(table.createdAt),
	pgPolicy("el_公开读取", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("el_公开插入", { as: "permissive", for: "insert", to: ["public"], using: sql`true` }),
	pgPolicy("el_公开更新", { as: "permissive", for: "update", to: ["public"], using: sql`true` }),
]);
