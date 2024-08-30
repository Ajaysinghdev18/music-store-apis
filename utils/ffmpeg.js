const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('@ffprobe-installer/ffprobe');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobe.path);


const generatePrevieweOfVideo = (videoPath, videoName) => {
    console.log(
        "============ convertTenEighty  videoDir   ===============",
        videoPath, "+", videoName
    );
    return new Promise((resolve, reject) => {
        const conv = new ffmpeg({ source: videoPath });
        conv
            .setStartTime("00:00:01") //Can be in "HH:MM:SS" format also
            .setDuration(30)
            .on("start", function (commandLine) {
                console.log("Spawned FFmpeg with command: " + commandLine);
            })
            .on("error", function (err) {
                console.log("error: ", +err);
                reject(err)
            })
            .on("end", function (err) {
                if (!err) {
                    console.log("conversion Done");
                    resolve(videoName)
                }
            })
            .saveToFile(videoName);

    });
};

const generatePrevieweOfMusic = (audioPath, audioName) => {
    return new Promise((resolve, reject) => {
        const conv = new ffmpeg({ source: audioPath });
        conv.audioCodec('copy');
        conv
            .setStartTime("00:00:01") //Can be in "HH:MM:SS" format also
            .setDuration(30)
            .on("start", function (commandLine) {
                console.log("Spawned FFmpeg with command: " + commandLine);
            })
            .on("error", function (err) {
                console.log("error: ", +err);
                reject(err)
            })
            .on("end", function (err) {
                if (!err) {
                    console.log("conversion Done");
                    resolve(audioName)
                }
            })
            .saveToFile(audioName);

    });
};


module.exports = { generatePrevieweOfVideo, generatePrevieweOfMusic };