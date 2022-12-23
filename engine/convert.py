import zlib, sys

str = sys.argv[1]

def make_hash40(str):
    hash40 = hex((len(str) << 32) + zlib.crc32(str.encode()))
    return hash40

print(make_hash40(str))
sys.stdout.flush()