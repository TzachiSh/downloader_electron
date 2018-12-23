const fs = require('fs-extra');
const os = require("os");
const XlsxStreamReader = require('../../lib/xlsx-stream-reader');
const path = require('path');
const csv = require('fast-csv');
const app = require('electron').remote.app;
let arr = [];
let message;
let urlsDir;
if(process.env.NODE_ENV === 'development'){
    urlsDir = path.resolve("./files");

}else {
    urlsDir = path.dirname (app.getPath ('exe')) + '\\files';
}
fs.ensureDir(urlsDir);
let MakeFile = (arr, i, cb) => {
    let file = fs.createWriteStream(urlsDir + `\\urls${i}.txt`);
    file.on('error', function(err) { /* error handling */ });
    arr.forEach(function(v) {
        file.write(v + os.EOL, 'utf8');
    });
    file.end();
    file.on('close',() => {
        let obj = {
            id:i,
            path:file.path,
            length:arr.length
        };
        cb(obj)
    })
};

let DeleteFiles = (files) => {
    files.forEach((file) => {
        fs.existsSync(file.path) &&
        fs.unlinkSync(file.path);
    })
};
let ParseFile  = (fileName,callback) => {

    if(fileName.indexOf('.csv')!=-1)
    {
        callback('Please wait...');
        var stream = fs.createReadStream(fileName);
        var csvStream = csv()
            .on("data", function(data){
                data.forEach(element => {
                    if(element.indexOf('http://')!=-1)
                    {
                        arr.push(element);
                        message = `Added ${arr.length} rows`;
                        callback(message);
                    }
                });
            })
            .on("end", function(){
                callback(message,arr)
            });
        stream.pipe(csvStream);
    }
    if(fileName.indexOf('.xlsx')!=-1)
    {

        callback('Please wait...');
        var workBookReader = new XlsxStreamReader();
        workBookReader.on('error', function (error) {
            throw(error);
        });

        workBookReader.on('worksheet',function (workSheetReader) {

            workSheetReader.on('row', function (row) {
                row.values.forEach(element => {
                    if(element.indexOf('http://')!=-1)
                    {
                    arr.push(element);
                    message = `Added ${arr.length} rows`;
                    callback(message);
                    }
                });
            });

            workSheetReader.on('end', function () {
                message = "starting download";
                callback(message,arr);
            });


            workSheetReader.process();
        });

        fs.createReadStream(fileName).pipe(workBookReader);
    }
    if(fileName.indexOf('.txt')!=-1){

        arr = fs.readFileSync(fileName).toString().split("\n");

        callback(message,arr);
    }
};


export default {
    ParseFile,
    MakeFile,
    DeleteFiles
}


