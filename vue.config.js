module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "productName": "Downloader",
                "extraFiles": [
                    "./src/aria2c.exe"
                ]
                // options placed here will be merged with default configuration and passed to electron-builder
            }
        }
    }
};