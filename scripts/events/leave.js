const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.4",
		author: "NTKhang",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api, usersData }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage)
					return;
				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID())
					return;
				const hours = getTime("HH");

				const userName = await usersData.getName(leftParticipantFbId);
				const type = leftParticipantFbId == event.author ? "خرج وحدو 🚶‍♂️" : "علاش خرجتو رجعو 🥺";
				
				const leaveMessage = `🥺 يا قلبي، خونا ${userName} ${type}... حرام عليكم علاش خرجتو رجعو 😭💔`;

				const form = {
					body: leaveMessage,
					mentions: [{
						tag: userName,
						id: leftParticipantFbId
					}]
				};

				if (threadData.data.leaveAttachment) {
					const files = threadData.data.leaveAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}
				message.send(form);
			};
	}
};
