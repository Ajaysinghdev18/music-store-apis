const axios = require('axios');
const fs = require('fs')
const { Web3Storage, makeStorageClient, File, getFilesFromPath } = require('web3.storage');
const path = require('path');
const Web3StorageCli = new Web3Storage({ token: process.env.WEB3_STORAGE_API_KEY });

const pinFileToIPFS = async (name, pathToFile) => {

    try {
        const buffer = Buffer.from(fs.readFileSync(pathToFile))
        const files = [
            new File([buffer], name)
        ]
        const cid = await Web3StorageCli.put(files, { wrapWithDirectory: false })
        return cid;


    } catch (error) {
        console.log("🚀 ~ file: web3Storage.js:33 ~ pinFileToIPFS ~ error:", error)
    }
}


const writeMetaDataFileContentForIpfs = async (data) => {
    try {
        const buffer = Buffer.from(JSON.stringify(data))
        const files = [
            new File([buffer], 'metadata')
        ]
        const cid = await Web3StorageCli.put(files, { wrapWithDirectory: false })
        console.log("🚀 ~ file: web3Storage.js:31 ~ writeMetaDataFileContentForIpfs ~ cid:", cid)
        return cid;
    } catch (error) {
        console.log("🚀 ~ file: web3Storage.js:48 ~ writeMetaDataFileContentForIpfs ~ error", error)
    }

}





module.exports = {
    writeMetaDataFileContentForIpfs,
    pinFileToIPFS
}