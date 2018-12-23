const { spawn } = require('child-process-promise');
const Anser = require("anser");
const path = require('path');
const event = require('events').EventEmitter
const app = require('electron').remote.app
class Aria2 extends event{
  constructor(textFile, path) {
    super();
    this.textFile = textFile;
    this.path = path
  }

  start() {
    // this.file = app.getAppPath() + '/src/arr.txt';
    // this.path = '/download';
    let aria2c;

    if(process.env.NODE_ENV === 'development'){
      aria2c = path.resolve("./src/aria2c.exe");

    }else {
      aria2c = path.dirname (app.getPath ('exe')) + '\\src\\aria2c.exe'
    }
    var promise = spawn(aria2c,['-i',this.textFile,'-d',this.path,'--allow-overwrite',true]);

    var childProcess = promise.childProcess;
    //console.log('[spawn] childProcess.pid: ', childProcess.pid);
    let self = this;

    childProcess.stdout.on('data', function (data) {
      self.emit('data',Anser.ansiToHtml(data.toString()));
    });
    childProcess.stderr.on('data', function (data) {
      self.emit('data',Anser.ansiToHtml(data.toString()))
    });

    promise.then(function () {
      //console.log('[spawn] done!');
    })
        .catch(function (err) {
          console.error('[spawn] ERROR: ', err);
        });
  }
}
  export default Aria2;

