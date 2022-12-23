const {ipcRenderer} = require('electron')
const path = require('path');
const { windowsStore } = require('process');
const {PythonShell} = require('python-shell');
const pairsList = document.getElementById('labelsList');
//const spinner = document.getElementById('loader');

async function read_file() {
    const hashPath = await ipcRenderer.invoke("getPath")
    var file_path = document.getElementById("ssbu_file").files[0].path
    var spinner = document.getElementsByClassName("loader");
    console.log(file_path)
    spinner[0].style.visibility = "visible"
    let options = 
    {
      mode: 'text',
      scriptPath : path.join(__dirname, '../../engine/'),
      args: [file_path, hashPath]
    };
    
    let pyshell = new PythonShell('file_read.py', options);

    pyshell.on('message', function(message) {
      console.log("output: \n", message);
      //swal(message);
      pairsList.innerHTML = message
      spinner[0].style.visibility = "hidden"
    })
    console.log('loading')
  }