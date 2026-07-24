const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');
const fs = require('fs');
const axios = require('axios');

module.exports = {
    config: {
        name: "welcome",
        version: "2.3.0",
        author: "Fares",
        category: "events",
        description: "توليد بنر ترحيب احترافي للأعضاء الجدد وتغيير اللقب بدقة عالية"
    },

    onStart: async ({ api, event }) => {
        if (event.logMessageType !== "log:subscribe") return;

        return async function () {
            const { threadID, logMessageData } = event;
            
            if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return;

            try {
                const addedParticipants = logMessageData.addedParticipants;
                
                // تصحيح مسارات الملفات لتخرج من مجلد events وتصل للمكان الصحيح
                const assetsPath = join(__dirname, "..", "assets");
                const welcomePath = join(assetsPath, 'welcome');
                const fontPath = join(assetsPath, 'fonts', 'Poppins-Bold.ttf');
                const framePath = join(assetsPath, 'frame.png');
                
                const tmpPath = join(__dirname, "..", "tmp");
                if (!fs.existsSync(tmpPath)) {
                    fs.mkdirSync(tmpPath, { recursive: true });
                }

                if (!global.loadedWelcomeFont) {
                    if (fs.existsSync(fontPath)) {
                        GlobalFonts.registerFromPath(fontPath, "Poppins");
                    }
                    global.loadedWelcomeFont = true;
                }

                // جلب اسم المجموعة لاستخدامه في البنر
                let groupName = "Community";
                try {
                    const info = await api.getThreadInfo(threadID);
                    if (info && info.threadName) {
                        groupName = info.threadName;
                    }
                } catch (e) {
                    console.log("Thread Info Error:", e.message);
                }

                for (let participant of addedParticipants) {
                    const rawName = (participant.fullName || "Member").trim().split(/\s+/)[0];
                    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                    const uid = participant.userFbId;

                    const canvas = createCanvas(1280, 720);
                    const ctx = canvas.getContext('2d');

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";

                    let background;
                    if (fs.existsSync(welcomePath)) {
                        const backgrounds = fs.readdirSync(welcomePath)
                            .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));
                        
                        if (backgrounds.length > 0) {
                            const bgFile = join(welcomePath, backgrounds[Math.floor(Math.random() * backgrounds.length)]);
                            background = await loadImage(bgFile);
                        }
                    }

                    if (background) {
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    } else {
                        ctx.fillStyle = '#1e1e1e';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
                    try {
                        const response = await axios.get(avatarUrl, {
                            responseType: "arraybuffer",
                            timeout: 10000
                        });
                        const avatar = await loadImage(Buffer.from(response.data));
                        
                        ctx.save();
                        ctx.beginPath();
                        
                        const centerX = 210;
                        const centerY = 360;
                        const radius = 120;
                        
                        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
                        ctx.restore();

                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
                        ctx.lineWidth = 8;
                        ctx.strokeStyle = "#ffffff";
                        ctx.stroke();
                    } catch (e) {
                        console.log("Avatar Load Error:", e.message);
                    }

                    if (fs.existsSync(framePath)) {
                        const frame = await loadImage(framePath);
                        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
                    }

                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 10;

                    // التصميم والنصوص المحسنة
                    ctx.font = 'bold 70px "Poppins", sans-serif';
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("WELCOME", canvas.width / 2, 470);

                    ctx.font = 'bold 45px "Poppins", sans-serif';
                    ctx.fillStyle = '#ffeb3b';
                    ctx.fillText(name, canvas.width / 2, 560);

                    ctx.font = '35px "Poppins", sans-serif';
                    ctx.fillStyle = "#dcdcdc";
                    ctx.fillText("Enjoy your stay ❤️", canvas.width / 2, 630);

                    // إضافة اسم المجموعة في الأسفل بشكل أنيق
                    ctx.font = '32px "Poppins", sans-serif';
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(groupName, canvas.width / 2, 680);

                    ctx.shadowBlur = 0;
                    ctx.shadowColor = "transparent";

                    const pathSave = join(tmpPath, `welcome_${uid}_${Date.now()}.png`);
                    const buffer = canvas.toBuffer('image/png');
                    fs.writeFileSync(pathSave, buffer);

                    // إرسال الرسالة بالطريقة المتوافقة مع GoatBot باستخدام Callback
                    api.sendMessage({
                        body: `أهلاً بك ${name} في المجموعة! 🎉`,
                        attachment: fs.createReadStream(pathSave)
                    }, threadID, () => {
                        setTimeout(() => {
                            fs.unlink(pathSave, () => {});
                        }, 3000);
                    });

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    try {
                        api.changeNickname(`${name} 🍓`, threadID, uid);
                    } catch (e) {
                        console.log("Nickname Error:", e.message);
                    }
                }
            } catch (error) {
                console.error("خطأ في إنشاء بنر الترحيب:", error);
            }
        };
    }
};
