from pathlib import Path
import hashlib
import json
import sys

import imageio_ffmpeg as ffmpeg
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

source = Path(sys.argv[1])
out = source.parent
job_name = source.stem.removesuffix('-raw')
reader = ffmpeg.read_frames(str(source), pix_fmt='rgb24')
meta = next(reader)
w, h = meta['size']
fps = meta['fps']
print(json.dumps({'source': source.name, 'width': w, 'height': h, 'fps': fps, 'duration': meta['duration']}), flush=True)
target = out / (job_name + '-film.mp4')
writer = ffmpeg.write_frames(str(target), (w,h), fps=fps, codec='libx264', pix_fmt_in='rgb24', pix_fmt_out='yuv420p', quality=None, macro_block_size=1, output_params=['-crf','22','-maxrate','4M','-bufsize','4M','-preset','medium','-movflags','+faststart','-an'])
writer.send(None)
samples = []
sample_at = {round(t*fps) for t in (0,1,2,3,4)}
last_frame = None
count = 0
for n, data in enumerate(reader):
    original = Image.frombytes('RGB', (w,h), data)
    if n in sample_at:
        samples.append((n/fps, original.copy()))
    last_frame = original
    image = original.resize((round(w*1120/1920),round(h*1120/1920)), Image.Resampling.LANCZOS).resize((w,h),Image.Resampling.BICUBIC)
    image = image.filter(ImageFilter.GaussianBlur(1.15*max(w,h)/1920))
    image = ImageEnhance.Color(image).enhance(0.93)
    pixels = np.asarray(image,dtype=np.float32)/255
    highlights = np.clip((pixels-.67)/.33,0,1)
    glow = np.asarray(Image.fromarray((highlights*255).astype('uint8')).filter(ImageFilter.GaussianBlur(13*max(w,h)/1920)),dtype=np.float32)/255
    pixels = np.clip(pixels + glow*.045,0,1)
    pixels = np.clip((pixels-.5)*.94+.5+.007,0,1)
    rng = np.random.default_rng(20261002+n)
    grain = rng.normal(0,1,(h,w)).astype(np.float32)
    luminance = pixels @ np.array([.2126,.7152,.0722],dtype=np.float32)
    strength = .018*(.65+.35*np.sin(np.pi*luminance))
    pixels = np.clip(pixels+grain[:,:,None]*strength[:,:,None],0,1)
    graded = (pixels*255).astype('uint8')
    writer.send(graded.tobytes())
    if n==0:
        Image.fromarray(graded).save(out/(job_name+'-poster.jpg'),quality=94)
    count=n+1
writer.close()
reader.close()
samples.append(((count-1)/fps,last_frame))
sheet=Image.new('RGB',(1280,780),'#111111')
draw=ImageDraw.Draw(sheet)
for k,(t,im) in enumerate(samples):
    x,y=(k%2)*640,(k//2)*260
    preview=im.copy()
    preview.thumbnail((420,236),Image.Resampling.LANCZOS)
    sheet.paste(preview,(x,y+24))
    crop=im.crop((int(w*.10),int(h*.17),int(w*.49),int(h*.94))) if w>h else im.crop((int(w*.12),int(h*.28),int(w*.90),int(h*.95)))
    crop.thumbnail((216,236),Image.Resampling.LANCZOS)
    sheet.paste(crop,(x+422,y+24))
    draw.text((x+8,y+5),f'{t:.2f}s',fill='white')
sheet.save(out/(job_name+'-contact.jpg'),quality=95)
record={'source':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'output':target.name,'frames':count,'fps':fps,'duration':count/fps,'dimensions':[w,h],'grain_sigma':.018,'seed':20261002,'notes':'Film treatment adapted from approved Made photo grading, with temporal grain and blur scaled to the native video resolution.'}
(out/(job_name+'-processing.json')).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record),flush=True)
