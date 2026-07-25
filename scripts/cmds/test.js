module.exports = {
	config: {
		name: "test",
		aliases: ["تاست", "t"],
		version: "1.0.0",
		author: "You",
		countDown: 3,
		role: 0,
		category: "system",

		shortDescription: {
			en: "Test message system",
			ar: "اختبار نظام الرسائل"
		},

		longDescription: {
			en: "Test all message functions",
			ar: "اختبار جميع رسائل البوت"
		},

		guide: {
			en: "{pn} <type>",
			ar: "{pn} <النوع>"
		}
	},

	onStart: async ({ message, args }) => {
		const type = (args[0] || "").toLowerCase();

		const commands = {
			// نجاح
			success: () => message.success(),
			"نجاح": () => message.success(),

			// خطأ
			error: () => message.error(),
			"خطأ": () => message.error(),

			// انتظار
			loading: () => message.loading(),
			"انتظار": () => message.loading(),

			// صلاحية المستخدم
			nopermission: () => message.noPermission(),
			"صلاحية": () => message.noPermission(),

			// صلاحية البوت
			bot: () => message.botNoPermission(),
			"صلاحية-البوت": () => message.botNoPermission(),

			// ترحيب
			welcome: () => message.welcome(),
			"ترحيب": () => message.welcome(),

			// وداع
			goodbye: () => message.goodbye(),
			"وداع": () => message.goodbye(),

			// تحميل
			download: () => message.download(),
			"تحميل": () => message.download(),

			// رفع
			upload: () => message.upload(),
			"رفع": () => message.upload(),

			// ذكاء
			ai: () => message.ai(),
			"ذكاء": () => message.ai(),

			// المطور
			owner: () => message.onlyOwner(),
			"المطور": () => message.onlyOwner(),

			// المشرف
			admin: () => message.onlyAdmin(),
			"المشرف": () => message.onlyAdmin(),

			// مجموعة
			group: () => message.onlyGroup(),
			"مجموعة": () => message.onlyGroup(),

			// مهلة
			cooldown: () => message.cooldown(),
			"مهلة": () => message.cooldown(),

			// غير موجود
			notfound: () => message.notFound(),
			"غير-موجود": () => message.notFound()
		};

		if (commands[type])
			return commands[type]();

		return message.reply(`🧪 | لوحة اختبار نظام الرسائل

━━━━━━━━━━━━━━━━━━
📌 الاستخدام:

• تاست نجاح
• تاست خطأ
• تاست انتظار
• تاست صلاحية
• تاست صلاحية-البوت
• تاست ترحيب
• تاست وداع
• تاست تحميل
• تاست رفع
• تاست ذكاء
• تاست المطور
• تاست المشرف
• تاست مجموعة
• تاست مهلة
• تاست غير-موجود

━━━━━━━━━━━━━━━━━━
📌 أو بالإنجليزية:

• test success
• test error
• test loading
• test nopermission
• test bot
• test welcome
• test goodbye
• test download
• test upload
• test ai
• test owner
• test admin
• test group
• test cooldown
• test notfound

━━━━━━━━━━━━━━━━━━
🍓 Yuki Message System`);
	}
};
