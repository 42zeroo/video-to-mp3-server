import express from 'express'
import ytdl from 'ytdl-core'
import fs from 'fs'
import https from 'https'
import {DownloaderHelper} from 'node-downloader-helper'
import download from 'download'

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
    console.log(downloadLinks)

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

    // try{
    //     await download(downloadLinks[0], audioPath)
    //     .then(()=>{
    //         res.send("Pobieranie " + videoInfo.videoDetails.title);
    //        // fs.unlinkSync(`${fs.realpathSync('.')}${audioPath}`);
    //     }).catch(err => console.log(err))
    // } catch (e) {
    //     if(e) throw e
    // }
    

    // const file = fs.createWriteStream('.'+audioPath);

    // https.get(downloadLinks[0], response => response.pipe(file))

     
        


    
  
})

app.listen(PORT, ()=> console.log(`server runnin on port http://localhost:${PORT}`))
