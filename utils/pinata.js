const axios = require('axios');
const fs = require('fs')
const FormData = require('form-data');
const { dirname } = require('path');


const pinFileToIPFS = async (name, pathToFile) => {
    const formData = new FormData();
    const file = fs.createReadStream(pathToFile);
    formData.append('file', file)
    const metadata = JSON.stringify({
        name
    });
    formData.append('pinataMetadata', metadata);
    const options = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', options);
    try {
        const res = await axios.post(`${process.env.PINATA_BASE_URL}/pinning/pinFileToIPFS`, formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
            }
        });

        return `${res.data.IpfsHash}`


    } catch (error) {
        console.log("🚀 ~ file: pinata.js:33 ~ pinFileToIPFS ~ error:", error)
    }
}


const writeMetaDataFileContentForIpfs = async (data) => {
    try {
        // const metadata = {
        //     pinataOptions: {
        //         cidVersion: 1
        //     },
        //     pinataMetadata: {
        //         ...data
        //     },
        //     pinataContent: {
        //         somekey: 'somevalue'
        //     }
        // }
        const config = {
            method: 'post',
            url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
            },
            data: JSON.stringify(data)
        };

        const res = await axios(config);

        console.log(res.data);
        return `${res.data.IpfsHash}`
    } catch (error) {
        console.log("🚀 ~ file: pinata.js:48 ~ writeMetaDataFileContentForIpfs ~ error", error.message)
    }

}





module.exports = {
    writeMetaDataFileContentForIpfs,
    pinFileToIPFS
}