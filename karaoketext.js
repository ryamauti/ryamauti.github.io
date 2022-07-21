// URL Parameters
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const artista = urlParams.get('artista').replace("_and_", "&");
const musica = urlParams.get('musica');  

// Carrega JSON
function carrega(artista, musica) {
    let saida 
    saida = fetch("./vocal-ranges.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            var key = data[artista][musica]['key'];
            var inicio = data[artista][musica]['main'].toString();
            document.getElementById("titulo").innerHTML = "<h1>" + artista + " - " + musica + " - Tom: " + key + ". Início: " + inicio + "</h1>";
            if ('url_mp3_30s' in data[artista][musica]) {
                if (data[artista][musica]['url_mp3_30s']) {
                    let aud = document.createElement("audio");
                    aud.controls = true;
                    aud.src = data[artista][musica]['url_mp3_30s'];
                    document.getElementById("titulo").appendChild(aud);
                }                
            }            
            return data[artista][musica]['letra'];            
        });
    return saida;
};
s = carrega(artista, musica);

var count = 0;
var ar = new Array();
var maximo;

s.then((value) => {    
    ar = value.split("\n");    
    maximo = ar.length - 1;
    ar[maximo] = "-- fim --";
    ar[maximo+1] = "";
    ar[maximo+2] = "";
    ar[maximo+3] = "";
    ar[maximo+4] = "";

    var divletra = "";
    for (i in ar) {
        divletra += "<p>" + ar[i] + "</p>" 
    }
    document.getElementById("depois").innerHTML = divletra;
    mostraLetra();
});



function mostraLetra() {
    document.getElementById("agora").innerHTML = "<p>" + ar[count] + "</p>";    

    if (count == 0) {document.getElementById("antes").innerHTML = "";}
    else {           document.getElementById("antes").innerHTML = "<p>" + ar[count-1] + "</p>";}

    document.getElementById("depois").innerHTML = "<p>" + ar[count+1] + "</p>";
    document.getElementById("depois").innerHTML += "<p>" + ar[count+2] + "</p>";
    document.getElementById("depois").innerHTML += "<p>" + ar[count+3] + "</p>";
    document.getElementById("depois").innerHTML += "<p>" + ar[count+4] + "</p>";    
}

function proxima() {
    if (count > maximo) {return false};
    count += 1;
    if (ar[count].length == 0) (proxima());
    mostraLetra();
}
function anterior() {
    if (count == 0) {return false};
    count -= 1;
    if (ar[count].length == 0) (anterior());
    mostraLetra();
}
function inicio() {    
    count = 0;
    if (ar[count].length == 0) (proxima());
    mostraLetra();
}