// server.js (已修复乱码问题)
const express = require('express');
const path = require('path');
const multer = require('multer');
const qrcode = require('qrcode');
const short = require('short-uuid');
const fs = require('fs');

const app = express();
const PORT = 3000;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

app.use(express.static('public'));
app.use('/uploads', express.static(UPLOADS_DIR));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '没有上传任何文件。' });
        }

        const playlistId = short.generate();
        const playlistPath = path.join(UPLOADS_DIR, playlistId);
        fs.mkdirSync(playlistPath);

        const fileGroups = {};
        req.files.forEach(file => {
            // ================== FIX: 修复文件名乱码的核心代码 ==================
            const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            // =================================================================

            const fileExtension = path.extname(decodedOriginalName).toLowerCase();
            const baseName = path.basename(decodedOriginalName, fileExtension);
            
            if (!fileGroups[baseName]) {
                fileGroups[baseName] = {};
            }

            // 使用解码后的文件名来保存文件和信息
            const correctedFile = { ...file, originalname: decodedOriginalName };

            if (fileExtension === '.mp3') {
                fileGroups[baseName].mp3 = correctedFile;
            } else if (fileExtension === '.lrc') {
                fileGroups[baseName].lrc = correctedFile;
            }
        });
        
        const manifest = [];
        for (const baseName in fileGroups) {
            const group = fileGroups[baseName];
            if (group.mp3) {
                const songData = {
                    title: baseName,
                    mp3Url: `/${playlistId}/${group.mp3.originalname}`,
                    lrcUrl: null
                };
                
                fs.writeFileSync(path.join(playlistPath, group.mp3.originalname), group.mp3.buffer);
                
                if (group.lrc) {
                    songData.lrcUrl = `/${playlistId}/${group.lrc.originalname}`;
                    fs.writeFileSync(path.join(playlistPath, group.lrc.originalname), group.lrc.buffer);
                }
                manifest.push(songData);
            }
        }
        
        if (manifest.length === 0) {
            fs.rmdirSync(playlistPath); // 如果没有有效歌曲，删除创建的空目录
            return res.status(400).json({ error: '上传的文件中未找到有效的MP3。' });
        }

        fs.writeFileSync(path.join(playlistPath, 'manifest.json'), JSON.stringify(manifest, null, 2));

        const playerUrl = `${req.protocol}://${req.get('host')}/player.html?id=${playlistId}`;
        const qrCodeDataUrl = await qrcode.toDataURL(playerUrl);

        res.json({ success: true, qrCode: qrCodeDataUrl, playerUrl: playerUrl });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: '服务器上传文件时出错。' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器正在 http://localhost:${PORT} 上运行`);
});