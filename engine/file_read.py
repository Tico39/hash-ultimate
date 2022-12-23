import os
import struct
import sys
import json
from itertools import count

full_path = sys.argv[1]
htmlString = ''
my_path = os.path.abspath(os.path.dirname(__file__))
hash_path = os.path.join(sys.argv[2], "hashes.json")
hash_file = open(hash_path)
data = json.load(hash_file)

def return_label(hex):
    for i in data:
        if i['hash40'] == hex:
            return(i['label'])

def parse_prc(prc_path):
    global htmlString
    with open(prc_path, "rb") as handle:
        magic = handle.read(8) # paracobn
        if magic.decode() != "paracobn":
            handle.close()
            return
        hash_size = struct.unpack("<I", handle.read(4))[0]
        hash_num = int(hash_size / 8)
        ref_size = struct.unpack("<I", handle.read(4))[0]
        handle.seek(8, 1)
        
        for i in range(hash_num):
            entry = ""
            crc32 = struct.unpack("<I", handle.read(4))[0]
            length = struct.unpack("<I", handle.read(4))[0]
            hashes.append(hex((length << 32) + crc32))
        handle.close()
    pass

def parse_tonelabel(file_path):
    with open(file_path, "rb") as handle:
        magic = struct.unpack("<I", handle.read(4))[0]
        hash_num = struct.unpack("<I", handle.read(4))[0]
        for i in range(hash_num):
            hashes.append(hex(struct.unpack("<Q", handle.read(8))[0] & 0xffffffffff))
        handle.close() 
    pass

def parse_sli(prc_path):
    with open(prc_path, "rb") as handle:
        count = struct.unpack("<I", handle.read(4))[0]
        for i in range(count):
            hashes.append(hex(struct.unpack("<Q", handle.read(8))[0] & 0xffffffffff))
            nu3_id = struct.unpack("<I", handle.read(4))[0]
            tone_id = struct.unpack("<I", handle.read(4))[0]
        handle.close() 
    pass

def parse_bin(prc_path):
    with open(prc_path, "rb") as handle:
        count = struct.unpack("<I", handle.read(4))[0]
        for i in range(count):
            hashes.append(struct.unpack("<Q", handle.read(8))[0] & 0xffffffffff)
            ls_ms = struct.unpack("<I", handle.read(4))[0]
            ls_sample = struct.unpack("<I", handle.read(4))[0]
            le_ms = struct.unpack("<I", handle.read(4))[0]
            le_sample = struct.unpack("<I", handle.read(4))[0]
            tt_ms = struct.unpack("<I", handle.read(4))[0]
            padding = struct.unpack("<I", handle.read(4))[0]
            t_samples = struct.unpack("<I", handle.read(4))[0]
        handle.close() 
    pass

def parse_sqb(prc_path):
    print("found sqb file at %s", prc_path)
    with open(prc_path, "rb") as handle:
        magic = handle.read(4)
        sqbType = struct.unpack("<H", handle.read(2))[0]
        sqbGroupCount = struct.unpack("<H", handle.read(2))[0]
        group_data_offset = struct.unpack("<L", handle.read(4))[0] + 0xC
        offsets = []
        for i in range(sqbGroupCount):
            offsets.append(struct.unpack("<L", handle.read(4))[0])
        for offset in offsets:
            handle.seek(group_data_offset + offset, 0)
            hashes.append(hex(struct.unpack("<Q", handle.read(8))[0]))
            group_type = struct.unpack("<H", handle.read(2))[0]
            sound_count = struct.unpack("<H", handle.read(2))[0]
            for j in range(sound_count):
                padding = struct.unpack("<L", handle.read(4))[0]
                hashes.append(hex(struct.unpack("<Q", handle.read(8))[0]))
                sound_type = struct.unpack("<H", handle.read(2))[0]
                occurence_perc = struct.unpack("<H", handle.read(2))[0]
                unk1 = struct.unpack("<L", handle.read(4))[0]
    pass

hashes = []

if not os.path.exists(full_path):
    print("File does not Exist")
else:
    print("File exists")

ext = os.path.splitext(full_path)[1]
if ext == ".tonelabel":
    parse_tonelabel(full_path)
elif ext == ".prc":
    parse_prc(full_path)
elif ext == ".sqb":
    parse_sqb(full_path)

for entry in hashes:
    if return_label(entry) == None:
        continue
    htmlString += '<li class="hashPairs"><h2>{label}</h2><p>{hash40}</p></li>'.format(label = return_label(entry), hash40 = entry)

print(htmlString)
hash_file.close()
sys.stdout.flush()