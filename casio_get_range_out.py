import mido
import time
from datetime import datetime

def calcula_nota(x):
    escala_char = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']    
    C4 = x - 12
    # escala temperada:
    oitava = C4 // 12
    semitom = C4 % 12    
    
    # saidas: usa global 'escala_char' e 'escalas'
    tom = escala_char[semitom]
    nota = escala_char[semitom] + str(oitava)    
    return tom, nota


ins = mido.get_input_names()
print('MIDI Input:', ins)
outs = mido.get_output_names()
print('MIDI Output:', outs)
in_port = mido.open_input('CASIO USB-MIDI 0')
out_port = mido.open_output('Microsoft GS Wavetable Synth 0')

print('primeira_nota: inicia em C4')
music_key = 60
music_key_note = ''
minimo = 60
min_note = ''
maximo = 60
max_note = ''
controle = False

main_list = list()
lista = list()
while True:
    msg = in_port.receive() # gera um wait
    if msg.note == 21:
        break

    ### Key
    elif msg.note == 22 and controle == False:        
        music_key = tecla        
        tom, _ = calcula_nota(tecla)
        music_key_note = tom
        print(f'- confirmar key: {music_key_note}')
        controle = True

    ### Main Chords 
    elif msg.note in (23, 24) and controle == False: # B: menor, e C: maior
        music_key = tecla        
        tom, _ = calcula_nota(tecla)
        main_temp = tom
        if msg.note == 23:
            main_temp += 'm'
        print(f'- confirmar main: {main_temp}')
        main_list.append(main_temp)
        controle = True

    ### Musica
    elif msg.type == 'note_on':
        tecla = msg.note
        _, nota = calcula_nota(tecla)        
        lista.append(tecla)
        if min(lista) < minimo:
            minimo = min(lista)
            min_note = nota
            print(f'- Range de {min_note} a {max_note}. Key {music_key_note}')
        if max(lista) > maximo:
            maximo = max(lista)
            max_note = nota
            print(f'- Range de {min_note} a {max_note}. Key {music_key_note}')
        controle = False
        # toca no MIDI Out
        out_msg = mido.Message('note_on', note=msg.note)
        out_port.send(out_msg)
        time.sleep(0.1)
        out_msg = mido.Message('note_off', note=msg.note)
        out_port.send(out_msg)

print('--------------')
print(lista)   
#print(f'- Range de {min_note} a {max_note}. Key {music_key_note}')
print('--------------')
hoje = datetime.today().strftime('%Y-%m-%d')
main_saida = str(main_list).replace("\'", "\"")
print('{"update": "' + hoje + '", "key": "' + music_key_note + '", "low": "' + min_note + '", "high": "' + max_note + '", "main": ' + main_saida + '}')


