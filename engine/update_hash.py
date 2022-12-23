import zlib, json, sys, os
from urllib.request import urlopen

param_hashes_url =  "https://raw.githubusercontent.com/Coolsonickirby/smash-ultimate-research-setup/main/Hashes/ParamLabels.csv"
tone_hashes_url =   "https://raw.githubusercontent.com/Coolsonickirby/smash-ultimate-research-setup/main/Hashes/tone_names.txt"
arc_hashes_url =    "https://raw.githubusercontent.com/Coolsonickirby/smash-ultimate-research-setup/main/Hashes/Hashes_all.txt"

hash_list_path = os.path.join(sys.argv[1], "hashes.json")

def make_hash40(source_str):
    return (len(source_str) << 32) + zlib.crc32(source_str.encode())

def load_hashes():
    param_data = urlopen(param_hashes_url)
    tone_data = urlopen(tone_hashes_url) 
    arc_data = urlopen(arc_hashes_url)
    for byte in arc_data:
        line = byte.decode()
        line = line.strip()
        arc_hashes[make_hash40(line)] = line
        pairs.append({"label":line,"hash40":hex(make_hash40(line)),"type":"archive"})
    for byte in param_data:
        line = byte.decode()
        line = line.strip()
        (hash40, value) = line.split(',')
        hash40 = int(hash40, base=16)
        param_hashes[hash40] = value
        pairs.append({"label":value,"hash40":hex(hash40),"type":"parameter"})
    for byte in tone_data:
        line = byte.decode()
        line = line.strip()
        nus3audio_hashes[make_hash40(line)] = line
        pairs.append({"label":line,"hash40":hex(hash40),"type":"tonelabel"})

arc_hashes = {}
param_hashes = {}
nus3audio_hashes = {}
pairs = []

load_hashes()

if os.path.exists(hash_list_path):
  os.remove(hash_list_path)

with open(hash_list_path, 'a', encoding='utf-8') as file:
    file.write("[\n")
    for i, item in enumerate(pairs):
            if i:
                file.write(",\n")
            x = json.dumps(item, indent=4)
            file.write(x)
    file.write("\n]")
    print("update success")
    sys.stdout.flush()


    