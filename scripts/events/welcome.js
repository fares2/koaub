const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');
const fs = require('fs');
const axios = require('axios');

module.exports = {
    config: {
        name: "welcome",
        version: "3.4.0",
        author: "Fares",
        category: "events",
        description: "نظام ترحيب احترافي متوافق مع Hinata/GoatBot مع دعم الكانفاس واللغات وتغيير اللقب"
    },

    langs: {
        en: {
            welcomeMessage: "Welcome",
            enjoyStay: "Enjoy your stay ❤️",
            welcomeBody: "Welcome {name} to our community! ✨"
        },
        ar: {
            session1: "صباحًا",
            session2: "ظهرًا",
            session3: "مساءً",
            session4: "ليلًا",
            welcomeMessage: "شكراً لإضافتي إلى المجموعة 🌸",
            multiple1: "بك",
            multiple2: "بكم",
            defaultWelcomeMessage: "أهلاً {userName}\nمرحباً {multiple} في {boxName}\nنتمنى لكم {session} سعيداً 🌹"
        }
    },

    onStart: async ({ api, event }) => {
        if (event.logMessageType !== "log:subscribe") return;

        return async function () {
            const { threadID, logMessageData } = event;
            const botID = api.getCurrentUserID();

            if (logMessageData.addedParticipants.some(i => i.userFbId == botID)) return;

            try {
                const addedParticipants = logMessageData.addedParticipants;
                
                const assetsPath = join(__dirname, "assets", "welcome");
const fontsPath = join(__dirname, "assets", "fonts", "Poppins-Bold.ttf");
const framePath = join(__dirname, "assets", "frame.png");
const tmpPath = join(__dirname, "tmp");

                if (!fs.existsSync(tmpPath)) {
                    fs.mkdirSync(tmpPath, { recursive: true });
                }

                if (!global.hinataWelcomeFontLoaded) {
                    if (fs.existsSync(fontsPath)) {
                        GlobalFonts.registerFromPath(fontsPath, "Poppins");
                    }
                    global.hinataWelcomeFontLoaded = true;
                }

                let groupName = "Community";
                try {
                    const threadInfo = await api.getThreadInfo(threadID);
                    if (threadInfo && threadInfo.threadName) {
                        groupName = threadInfo.threadName;
                    }
                } catch (err) {
                    console.log("Hinata v3 - Thread Info Warning:", err.message);
                }

                for (const participant of addedParticipants) {
                    const rawName = (participant.fullName || "Member").trim().split(/\s+/)[0];
                    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                    const uid = participant.userFbId;

                    const canvas = createCanvas(1280, 720);
                    const ctx = canvas.getContext('2d');

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";

                    let background = null;
                    if (fs.existsSync(assetsPath)) {
                        const bgFiles = fs.readdirSync(assetsPath)
                            .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));
                        
                        if (bgFiles.length > 0) {
                            const randomBg = bgFiles[Math.floor(Math.random() * bgFiles.length)];
                            background = await loadImage(join(assetsPath, randomBg));
                        }
                    }

                    if (background) {
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    } else {
                        ctx.fillStyle = '#111111';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
                    try {
                        const avatarRes = await axios.get(avatarUrl, {
                            responseType: "arraybuffer",
                            timeout: 10000
                        });
                        const avatarImg = await loadImage(Buffer.from(avatarRes.data));

                        ctx.save();
                        ctx.beginPath();
                        
                        const centerX = 210;
                        const centerY = 360;
                        const radius = 120;
                        
                        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(avatarImg, centerX - radius, centerY - radius, radius * 2, radius * 2);
                        ctx.restore();

                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
                        ctx.lineWidth = 8;
                        ctx.strokeStyle = "#ffffff";
                        ctx.stroke();
                    } catch (avatarErr) {
                        console.log("Hinata v3 - Avatar Load Error:", avatarErr.message);
                    }

                    if (fs.existsSync(framePath)) {
                        const frameImg = await loadImage(framePath);
                        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
                    }

                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                    ctx.shadowBlur = 12;

                    ctx.font = 'bold 65px "Poppins", sans-serif';
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("WELCOME", canvas.width / 2, 450);

                    ctx.font = 'bold 45px "Poppins", sans-serif';
                    ctx.fillStyle = '#ffeb3b';
                    ctx.fillText(name, canvas.width / 2, 530);

                    ctx.font = 'bold 38px "Poppins", sans-serif';
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("أهلاً بك في العائلة ❤️", canvas.width / 2, 600);

                    ctx.font = '32px "Poppins", sans-serif';
                    ctx.fillStyle = "#dcdcdc";
                    ctx.fillText(groupName, canvas.width / 2, 665);

                    ctx.shadowBlur = 0;
                    ctx.shadowColor = "transparent";

                    const savePath = join(tmpPath, `welcome_${uid}_${Date.now()}.png`);
                    fs.writeFileSync(savePath, canvas.toBuffer('image/png'));

                    api.sendMessage({
                        body: `أهلاً بك ${name} في مجموعة ${groupName}! 🎉\nWelcome ${name} to our community! ✨`,
                        attachment: fs.createReadStream(savePath)
                    }, threadID, () => {
                        setTimeout(() => {
                            if (fs.existsSync(savePath)) {
                                fs.unlink(savePath, () => {});
                            }
                        }, 4000);
                    });

                    await new Promise(resolve => setTimeout(resolve, 1200));

                    try {
                        api.changeNickname(`[🍓] ${name}`, threadID, uid);
                    } catch (nickErr) {
                        console.log("Hinata v3 - Nickname Error:", nickErr.message);
                    }
                }
            } catch (globalErr) {
                console.error("Hinata v3 - Critical Welcome Error:", globalErr);
            }
        };
    }
};
