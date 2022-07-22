function carrega() {
    fetch("./vocal-ranges.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            artistas(data);            
        })
};

function artistas(data) {    
    for (elem in data) {      
        let btn = document.createElement("button");
        btn.innerHTML = elem;
        btn.onclick = function() {
            document.getElementById("musicas").innerHTML = "";
            musicas(data[btn.innerText], btn.innerText); 
            return false;};
        document.getElementById("artistas").appendChild(btn);
    }; 
};

function musicas(data, artista) {    
    for (elem in data) {      
        let btn = document.createElement("button");
        if (!('letra' in data[elem])) {
            console.log('LETRA');
            btn.style.backgroundColor = 'gray';
        }
        btn.innerHTML = elem;
        btn.onclick = function() {
            location.href = './karaoke.html?artista=' + artista.replace("&", "_and_") + '&musica=' + btn.innerText;
            return false;};
        document.getElementById("musicas").appendChild(btn);
    }; 
};

carrega();



