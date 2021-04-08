import express from 'express'
import ytdl from 'ytdl-core'
import fs from 'fs'
import https from 'https'

const app = express();
const PORT = 5000;

app.get('/:videoID', async(req, res) => {
    const { videoID } = req.params;

    let videoInfo = await ytdl.getInfo(videoID).catch(e => console.log(e));
    const downloadLinks = ytdl.filterFormats(videoInfo.formats, 'audioonly')
        .filter(f => !f.hasVideo && f.hasAudio && f.audioQuality === 'AUDIO_QUALITY_MEDIUM')
        .map(f => f = f.url);

    const titleWithoutSpaces = videoInfo.videoDetails.title.toLowerCase().replace(/[^a-z']/g, '_');
    const audioPath = `/download_cache/${titleWithoutSpaces}.mp3`;
    
    const file = fs.createWriteStream('.'+audioPath);

    await https.get(downloadLinks[0], response => response.pipe(file))

    await res.download(`${fs.realpathSync('.')}${audioPath}`)

    try {
        fs.unlinkSync(`${fs.realpathSync('.')}${audioPath}`)
      } catch(err) {
        console.error(err)
      }
})

app.listen(PORT, ()=> console.log(`server runnin on port http://localhost:${PORT}`))
