<template>
   <div class="hello">
     <button class="btn btn-primary" v-if="!file" @click="fileSelect()">Select file</button>
     <button  class="btn btn-secondary" v-if="file && !path" @click="pathSelect()">Download path</button>
     <button  class="btn btn-success" v-if="file && path && !message" @click="startDownload">Start</button>
     <h4 v-if="message">Files: {{fileNumber}}/{{files.length}}</h4>
     <h5 v-if="message">Progress: {{count}}/{{total}}</h5>

     <div v-if="message" v-html="message"></div>
   </div>
</template>


<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { remote } from 'electron'
import  fileSync from '../Services/fileSync.js'
import aria2 from '../Services/aria2.js'
const dialog = remote.dialog;
export default {
  name: 'Download',
  props: {
    msg: String
  },
  data(){
    return { file: null , path:null , message:null,count:0,total:0,files:[],fileNumber:0}
  },
  mounted(){
  },
  methods:{
    fileSelect(e){
      this.file = dialog.showOpenDialog({properties:['openFile']});
      
    },
    pathSelect(){
      this.path = dialog.showOpenDialog({properties:['openDirectory']})
    },
    downloader(downloadDir){
            let download = new aria2(this.files[this.fileNumber].path,downloadDir);
            this.fileNumber ++;
            download.start();
            let self = this;
            download.on('data', (data) => {
                self.message = data;
                data.includes('Download complete') && self.count ++;
                if(data.includes('download completed')){
                    if(self.fileNumber < self.files.length ) {
                         self.downloader(downloadDir)
                         //fileSync.DeleteFiles(self.files);
                    }else {
                            self.message =  "Download Completed" ;
                            fileSync.DeleteFiles(self.files);
                    }
                }
        })
    },
    startDownload(){
      let file = this.file[0];
      let path = this.path[0] + "\\Records";
      let self = this;
      this.count = 0;
        fileSync.ParseFile(file,(message, urls) =>{
          this.message = message;
        if(urls){
            self.total = urls.length;
            let size = 50000;
            let subUrls = [];
            let files = [];
            while (urls.length > 0) {
                subUrls.push(urls.splice(0, size));
            }
            subUrls.map((v, i) => {
                fileSync.MakeFile(v ,i, (data) => {
                    files.push(data);
                    if(subUrls.length === files.length){
                        this.files = files;
                        this.fileNumber = 0;
                        this.downloader(path);
                    }
                })
            });
        }
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h5 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
