import urllib.request
import os

url = 'https://cdn.jsdelivr.net/gh/niklasf/stockfish.js/stockfish.js'
out_path = os.path.join('Hiburan', 'stockfish.js')
print('Downloading', url)
urllib.request.urlretrieve(url, out_path)
print('Saved', out_path)
