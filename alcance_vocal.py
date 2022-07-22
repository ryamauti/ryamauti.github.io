# MAIN
import requests
from requests.structures import CaseInsensitiveDict
import json
from datetime import datetime
from _api_secrets import secrets

def metadados_musica():
    metadados = dict()

    print('--- Autorizando no Spotify ---')
    print('--- pegando a música de agora ... Spotify ---')
    secret_spotify_auth, _ = secrets()
    url = "https://api.spotify.com/v1/me/player/currently-playing"
    headers = CaseInsensitiveDict()
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    headers["Authorization"] = secret_spotify_auth
    resp = requests.get(url, headers=headers)
    print(resp)
    if resp.status_code == 401:
        print('!!! Autorização expirada !!!')
        print('  logue em:')
        print('  https://developer.spotify.com/console/get-users-currently-playing-track/')
        print('-------')
        return metadados 
    if resp.status_code == 200:
        musica = resp.json()['item']['name']
        artista = resp.json()['item']['artists'][0]['name']
        url_mp3_30s = resp.json()['item']['preview_url']
        spotify_app = resp.json()['item']['uri']
        url_spotify = resp.json()['item']['external_urls']['spotify']
    metadados['musica'] = musica
    metadados['artista'] = artista
    metadados['url_mp3_30s'] = url_mp3_30s
    metadados['url_spotify'] = url_spotify
    metadados['spotify_app'] = spotify_app
    print(artista + ' - ' +musica)

    # https://auth.vagalume.com.br/settings/api/
    print('--- pegando a letra da música de agora ... Vagalume ---')
    _, secret_vagalume = secrets()        
    url = "https://api.vagalume.com.br/search.php" + "?art=" + artista + "&mus=" + musica + "&apikey={secret_vagalume}"
    headers = CaseInsensitiveDict()
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    resp = requests.get(url, headers=headers)
    try:
        letra = resp.json()['mus'][0]['text']
    except KeyError:
        print('-----ERRO no Vagalume-----')
        print(str(resp.json()))
        print('continuando...')
        letra = ""
    metadados['letra'] = letra

    print('--- Metadados completos ---')
    return metadados


def abre_json():
    with open('vocal-ranges.json' ,'r', encoding='UTF-8') as f: 
        arq = json.load(f)
    with open('vocal-ranges-bkp.json' ,'w', encoding='UTF-8') as f: 
        json.dump(arq, f, ensure_ascii=False)
    return arq



print('--- Início ---')
metadados = metadados_musica()
if len(metadados) == 0:
    print('--- erro na leitura da musica ---')
    exit()

catalogo = abre_json()

print('--- Checa se é uma atualização...')
artista = metadados['artista']
musica = metadados['musica']
hoje = datetime.today().strftime('%Y-%m-%d')

if artista not in catalogo:
    catalogo[artista] = dict()
if musica in catalogo[artista]:
    print(f'--- Atualizando... {artista} - {musica}')
    catalogo[artista][musica]['update'] = hoje
    catalogo[artista][musica]['letra'] = metadados['letra']
    catalogo[artista][musica]['url_mp3_30s'] = metadados['url_mp3_30s']
    catalogo[artista][musica]['url_spotify'] = metadados['url_spotify']
    catalogo[artista][musica]['spotify_app'] = metadados['spotify_app']
else:
    print(f'--- Novo... {artista} - {musica}') 
    print('Cole aqui o JSON de saida do casio_get_range_out.py') 
    casio = input()
    dict_casio = json.loads(casio)
    catalogo[artista][musica] = dict_casio
    catalogo[artista][musica]['letra'] = metadados['letra']
    catalogo[artista][musica]['url_mp3_30s'] = metadados['url_mp3_30s']
    catalogo[artista][musica]['url_spotify'] = metadados['url_spotify']
    catalogo[artista][musica]['spotify_app'] = metadados['spotify_app']

print('--- Fim :)')
with open('vocal-ranges.json' ,'w', encoding='UTF-8') as f: 
    json.dump(catalogo, f, ensure_ascii=False)
    

