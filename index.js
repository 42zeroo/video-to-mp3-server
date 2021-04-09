import express from 'express'
import ytdl from 'ytdl-core'
import fs from 'fs'
import {DownloaderHelper} from 'node-downloader-helper'

const app = express();
const PORT = 5000;

app.get('/:videoID', async(req, res) => {
    const { videoID } = req.params;

    let videoInfo = await ytdl.getInfo(videoID).catch(e => console.log(e));
    const downloadLinks = ytdl.filterFormats(videoInfo.formats, 'audioonly')
        .filter(f => !f.hasVideo && f.hasAudio && f.audioQuality !== 'AUDIO_QUALITY_LOW')
        .map(f => f = f.url);

    const formatedTitle = videoInfo.videoDetails.title.toLowerCase().replace(/[^a-z]/g, '_');
    const audioPath = `/download_cache/${formatedTitle}.mp3`;

    try{
        const dl = new DownloaderHelper(downloadLinks[0], `./download_cache/`, {
            fileName: `${formatedTitle}.mp3`,
        });
        dl.on('end', () => {
            console.log('Downloading ' +videoInfo.videoDetails.title +  ' Completed');
            res.download(`${fs.realpathSync('.')}${audioPath}`,
             ()=>fs.unlinkSync(`${fs.realpathSync('.')}${audioPath}`))
        })
        dl.on('progress', (downloadInfo) => console.log("progres: " +downloadInfo.progress))
        dl.start();
    }catch(e){
        if (e) throw e;
    }
})

app.listen(PORT, ()=> console.log(`server runnin on port http://localhost:${PORT}`))
