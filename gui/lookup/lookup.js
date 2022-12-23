const pairsList = document.getElementById('labelsList');
const searchBar = document.getElementById('searchBar');
const {ipcRenderer} = require('electron');
const path = require('path');
const {PythonShell} = require('python-shell');
let hashpairs = []
//console.log(hashpairs);
async function getPairs()
{
    const result = await ipcRenderer.invoke("getPath")
    hashPath = result
    console.log(hashPath)
    const res = await fetch(path.join(hashPath, "hashes.json"));
    hashpairs = await res.json();
    return hashpairs;
}

function get_hash40() {

    var label = document.getElementById("searchBar").value
    console.log("inputted: ", label)
  
    let options = 
    {
      mode: 'text',
      scriptPath : path.join(__dirname, '../../engine/'),
      args: [label]
    };
  
    console.log("accessing: ", options.scriptPath)
  
    let pyshell = new PythonShell('convert.py', options);
  
    pyshell.on('message', function(message) {
      console.log("output: ", message);
      swal(message);
    })
  
    document.getElementById("searchBar").value = "";
}

searchBar.addEventListener('keyup', (e) => {

    const searchString = e.target.value.toLowerCase();

    const filteredPairs = hashpairs.filter((pair) => {
        return (
            pair.label.includes(searchString) ||
            pair.hash40.includes(searchString)
        );
    });
    if (filteredPairs.length < 1000)
        displayPairs(filteredPairs);
    else
        displayEmpty();
});

const displayPairs = (pairs) => {
    const htmlString = pairs
        .map((pair) => {
            return `
            <li class="hashPairs">
                <h2>${pair.label}</h2>
                <p>${pair.hash40}</p>
                <p2>${pair.type}</p2>
            </li>
        `;
        })
        .join('');
    labelsList.innerHTML = htmlString;
};

const loadCharacters = async () => {
    try {
        const result = await ipcRenderer.invoke("getPath")
        hashPath = result

        const res = await fetch(path.join(hashPath, "hashes.json"));
        hashpairs = await res.json();
        //displayPairs(hashpairs);
        displayEmpty();
    } catch (err) {
        console.error(err);
        labelsList.innerHTML = `
        <li class="error">
            <p>Could not load Hash list. Update Hash list and restart application</p>
        </li>
        `
    }
};

const displayEmpty = () => 
{
    labelsList.innerHTML = `
    <li class="hashPairs">
        <h2>Label</h2>
        <p>Hash40</p>
        <p2>Type</p2>
    </li>
    `
};

loadCharacters();


