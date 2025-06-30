const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running successfully!');
});

app.post('/getVideoInfo', async (req, res) => {
    const { url } = req.body;
    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid YouTube URL.' });
    }
    try {
        const info = await ytdl.getInfo(url);
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        const audioFormat = ytdl.filterFormats(info.formats, 'audioonly')[0];
        
        const videoDetails = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            formats: formats.map(format => ({
                quality: format.qualityLabel,
                url: format.url,
            })).filter(f => f.quality)
        };

        if (audioFormat) {
            videoDetails.formats.push({
                quality: 'MP3 (Audio)',
                url: audioFormat.url,
            });
        }
        res.json({ success: true, ...videoDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get video info. It might be a private or age-restricted video.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});