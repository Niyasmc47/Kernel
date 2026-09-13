import os, sys, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 640, 360
FPS = 25
DURATION = 3.2
TOTAL_FRAMES = int(FPS * DURATION)
OUT_DIR = 'frontend/public/assets/abilities'
os.makedirs(OUT_DIR, exist_ok=True)

try:
    font_bold = ImageFont.truetype('/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Bold.otf', 14)
    font_small = ImageFont.truetype('/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Bold.otf', 10)
    font_large = ImageFont.truetype('/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Bold.otf', 18)
except Exception:
    font_bold = ImageFont.load_default()
    font_small = ImageFont.load_default()
    font_large = ImageFont.load_default()

def create_video(filename, render_frame_fn):
    out_path = os.path.join(OUT_DIR, filename)
    cmd = [
        'ffmpeg', '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{W}x{H}',
        '-pix_fmt', 'rgb24',
        '-r', str(FPS),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'veryfast',
        '-crf', '21',
        out_path
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for f in range(TOTAL_FRAMES):
        progress = f / TOTAL_FRAMES
        img = render_frame_fn(f, progress)
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    proc.wait()
    print(f"Generated {filename} ({os.path.getsize(out_path)} bytes)")

# 1. SCHEMA SIGHT (Blueprint Vision)
bg_origin = Image.open('frontend/public/assets/origin_bg.jpg').convert('RGB').resize((W, H))
def render_schema(f, p):
    frame = bg_origin.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    # Darken for tech contrast
    draw.rectangle([0, 0, W, H], fill=(5, 25, 18, 140))
    # Blueprint grid
    for x in range(0, W, 32):
        draw.line([(x, 0), (x, H)], fill=(16, 185, 129, 40), width=1)
    for y in range(0, H, 32):
        draw.line([(0, y), (W, y)], fill=(16, 185, 129, 40), width=1)
        
    # Vertical sweep scanner line
    sweep_x = int((math.sin(p * 2 * math.pi) * 0.5 + 0.5) * (W - 80)) + 40
    draw.line([(sweep_x, 0), (sweep_x, H)], fill=(52, 211, 153, 230), width=2)
    draw.rectangle([max(0, sweep_x - 30), 0, min(W, sweep_x + 30), H], fill=(16, 185, 129, 35))
    
    # Target reticle 1 (Motor)
    cx, cy = 200, 240
    r = int(35 + 8 * math.sin(p * 4 * math.pi))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(52, 211, 153, 220), width=2)
    draw.line([(cx - r - 10, cy), (cx + r + 10, cy)], fill=(52, 211, 153, 160), width=1)
    draw.line([(cx, cy - r - 10), (cx, cy + r + 10)], fill=(52, 211, 153, 160), width=1)
    draw.rectangle([cx + 40, cy - 30, cx + 190, cy + 25], fill=(0, 20, 10, 200), outline=(52, 211, 153, 180))
    draw.text((cx + 45, cy - 25), "MOTOR CORE #1", fill=(255, 255, 255), font=font_small)
    draw.text((cx + 45, cy - 10), "FAULT: COPPER WINDING", fill=(245, 158, 11), font=font_small)
    draw.text((cx + 45, cy + 5), "INTEGRITY: 78.4%", fill=(52, 211, 153), font=font_small)
    
    # Target reticle 2 (Upper Appliance)
    c2x, c2y = 480, 180
    r2 = int(25 + 5 * math.cos(p * 4 * math.pi))
    draw.ellipse([c2x - r2, c2y - r2, c2x + r2, c2y + r2], outline=(56, 189, 248, 200), width=1)
    draw.text((c2x - 50, c2y - 45), "[CIRCUIT TRACE OK]", fill=(56, 189, 248), font=font_small)
    
    # Top HUD
    draw.rectangle([20, 15, 260, 45], fill=(0, 20, 10, 210), outline=(16, 185, 129, 120))
    draw.text((30, 22), "SCHEMA SIGHT // ACTIVE X-RAY", fill=(52, 211, 153), font=font_bold)
    return frame.convert('RGB')

create_video('schema_sight.mp4', render_schema)

# 2. REFORGE (Instant Repair)
bg_incident = Image.open('frontend/public/assets/incident_bg.jpg').convert('RGB').resize((W, H))
def render_reforge(f, p):
    frame = bg_incident.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    draw.rectangle([0, 0, W, H], fill=(5, 18, 30, 130))
    
    cx, cy = 320, 180
    # Fracture healing pulse (pulling in shards)
    phase = (p * 3) % 1.0
    for i in range(8):
        angle = i * (2 * math.pi / 8) + p * math.pi
        dist = (1.0 - phase) * 140 + 20
        sx = int(cx + math.cos(angle) * dist)
        sy = int(cy + math.sin(angle) * dist)
        draw.line([(sx, sy), (cx, cy)], fill=(56, 189, 248, int(180 * (1 - phase))), width=2)
        draw.rectangle([sx - 4, sy - 4, sx + 4, sy + 4], fill=(125, 211, 252, 220), outline=(255, 255, 255, 255))
        
    # Core magnetic restoration orb
    orb_r = int(24 + 8 * math.sin(p * 6 * math.pi))
    draw.ellipse([cx - orb_r, cy - orb_r, cx + orb_r, cy + orb_r], fill=(56, 189, 248, 80), outline=(186, 230, 253, 230), width=3)
    draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 255, 255, 240))
    
    # Telemetry HUD
    draw.rectangle([20, 15, 280, 45], fill=(5, 20, 35, 210), outline=(56, 189, 248, 140))
    pct = int(min(100, (p * 1.2) * 100))
    draw.text((30, 22), f"REFORGE // ATOMIC BONDING: {pct}%", fill=(56, 189, 248), font=font_bold)
    return frame.convert('RGB')

create_video('reforge.mp4', render_reforge)

# 3. KINETIC RESONANCE (Kinetic Shield & Counter-Blast)
bg_hero = Image.open('frontend/public/assets/hero_bg.jpg').convert('RGB').resize((W, H))
def render_kinetic(f, p):
    frame = bg_hero.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    draw.rectangle([0, 0, W, H], fill=(15, 8, 30, 140))
    
    cx, cy = 300, 190
    cycle = (p * 2) % 1.0  # Two impact-deflect cycles in 3.2s
    
    # Shield Dome
    shield_r = 100
    draw.arc([cx - shield_r, cy - shield_r, cx + shield_r, cy + shield_r], start=-80, end=80, fill=(167, 139, 250, 220), width=4)
    draw.arc([cx - shield_r - 6, cy - shield_r - 6, cx + shield_r + 6, cy + shield_r + 6], start=-70, end=70, fill=(192, 132, 252, 120), width=2)
    
    if cycle < 0.45:
        # Incoming projectile impact
        proj_p = cycle / 0.45
        px = int(580 - proj_p * (580 - (cx + shield_r)))
        py = cy
        draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(251, 146, 60, 255))
        draw.line([(px, py), (px + 30, py)], fill=(251, 146, 60, 180), width=3)
        draw.text((cx + 120, cy - 40), "[INCOMING FORCE: 4,800N]", fill=(251, 146, 60), font=font_small)
    else:
        # Shockwave blast rebound
        blast_p = (cycle - 0.45) / 0.55
        wave_r = int(blast_p * 240) + shield_r
        alpha = int((1.0 - blast_p) * 230)
        draw.arc([cx - wave_r, cy - wave_r, cx + wave_r, cy + wave_r], start=-60, end=60, fill=(167, 139, 250, alpha), width=6)
        draw.arc([cx - wave_r + 20, cy - wave_r + 20, cx + wave_r - 20, cy + wave_r - 20], start=-50, end=50, fill=(233, 213, 255, alpha), width=3)
        draw.text((cx + 120, cy - 40), "[FORCE REDIRECTED >> BLAST!]", fill=(167, 139, 250), font=font_small)
        
    draw.rectangle([20, 15, 290, 45], fill=(15, 10, 35, 210), outline=(167, 139, 250, 140))
    draw.text((30, 22), "KINETIC SHIELD // REDIRECTION", fill=(167, 139, 250), font=font_bold)
    return frame.convert('RGB')

create_video('kinetic_resonance.mp4', render_kinetic)

# 4. MIND RESONANCE (Emotional Resonance / Empathy Link)
bg_lattice = Image.open('frontend/public/assets/lattice_bg.jpg').convert('RGB').resize((W, H))
def render_mind(f, p):
    frame = bg_lattice.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    draw.rectangle([0, 0, W, H], fill=(5, 25, 25, 140))
    
    # Flowing biometric sine waves
    pts1 = []
    pts2 = []
    for x in range(40, W - 40, 6):
        y1 = 180 + math.sin((x * 0.03) + (p * 4 * math.pi)) * 35
        y2 = 180 + math.cos((x * 0.025) - (p * 3 * math.pi)) * 25
        pts1.append((x, int(y1)))
        pts2.append((x, int(y2)))
        
    for i in range(len(pts1) - 1):
        draw.line([pts1[i], pts1[i+1]], fill=(45, 212, 191, 220), width=3)
        draw.line([pts2[i], pts2[i+1]], fill=(94, 234, 212, 160), width=2)
        # Connecting neural bridges
        if i % 6 == 0:
            draw.line([pts1[i], pts2[i]], fill=(45, 212, 191, 80), width=1)
            draw.ellipse([pts1[i][0]-3, pts1[i][1]-3, pts1[i][0]+3, pts1[i][1]+3], fill=(204, 251, 241, 240))
            
    draw.rectangle([20, 15, 300, 45], fill=(5, 30, 30, 210), outline=(45, 212, 191, 140))
    draw.text((30, 22), "EMPATHIC LINK // CONSCIOUSNESS HARMONY", fill=(45, 212, 191), font=font_bold)
    draw.rectangle([W - 220, H - 45, W - 20, H - 15], fill=(5, 30, 30, 210), outline=(45, 212, 191, 100))
    draw.text((W - 205, H - 35), "UNSPOKEN TRUTH: VERIFIED", fill=(204, 251, 241), font=font_small)
    return frame.convert('RGB')

create_video('mind_resonance.mp4', render_mind)

# 5. ECHO (Object Memory / Echo Touch)
def render_echo(f, p):
    frame = bg_origin.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    draw.rectangle([0, 0, W, H], fill=(28, 20, 5, 150))
    
    cx, cy = 320, 210
    # Golden chronological ripples
    for ring in range(4):
        phase = (p + ring * 0.25) % 1.0
        r = int(phase * 160) + 10
        alpha = int((1.0 - phase) * 200)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(251, 191, 36, alpha), width=2)
        
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(251, 191, 36, 240))
    
    # Holographic ghost memory timeline
    time_yr = 2026 - int(p * 8)
    draw.rectangle([20, 15, 320, 45], fill=(30, 20, 5, 210), outline=(251, 191, 36, 140))
    draw.text((30, 22), f"ECHO RECALL // TIMELINE: {time_yr} A.D.", fill=(251, 191, 36), font=font_bold)
    
    # Audio waveform timeline at bottom
    for bar in range(30):
        bx = 140 + bar * 12
        bh = int(10 + 25 * abs(math.sin(bar * 0.4 + p * 6 * math.pi)))
        draw.line([(bx, H - 30 - bh), (bx, H - 30)], fill=(252, 211, 77, 180), width=4)
    draw.text((140, H - 55), "RESIDUAL SOUND & TOUCH WAVEFORM", fill=(251, 191, 36), font=font_small)
    return frame.convert('RGB')

create_video('echo.mp4', render_echo)

# 6. SIGNAL BLEED (Power Overload / Reality Glitch)
bg_root = Image.open('frontend/public/assets/root_access_bg.jpg').convert('RGB').resize((W, H))
def render_bleed(f, p):
    frame = bg_root.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    draw.rectangle([0, 0, W, H], fill=(25, 5, 5, 140))
    
    # Glitch chromatic cuts
    glitch_phase = int(f % 5)
    if glitch_phase == 0 or glitch_phase == 2:
        band_y = int((f * 29) % (H - 40))
        draw.rectangle([0, band_y, W, band_y + 18], fill=(239, 68, 68, 80))
        draw.line([(0, band_y + 9), (W, band_y + 9)], fill=(255, 255, 255, 180), width=1)
        
    # Scan lines
    for y in range(0, H, 6):
        draw.line([(0, y), (W, y)], fill=(0, 0, 0, 80), width=1)
        
    # Warning sign & glitch text
    draw.rectangle([20, 15, 330, 45], fill=(35, 5, 5, 220), outline=(239, 68, 68, 180))
    draw.text((30, 22), "SIGNAL BLEED // CRITICAL OVERLOAD", fill=(239, 68, 68), font=font_bold)
    
    overload_pct = 100 + int(abs(math.sin(p * 8 * math.pi)) * 48)
    draw.rectangle([W - 240, H - 50, W - 20, H - 15], fill=(35, 5, 5, 220), outline=(239, 68, 68, 150))
    draw.text((W - 225, H - 42), f"REALITY DISTORTION: {overload_pct}%", fill=(248, 113, 113), font=font_small)
    draw.text((W - 225, H - 28), "TEMPORAL STATIC ESCALATING", fill=(252, 165, 165), font=font_small)
    return frame.convert('RGB')

create_video('signal_bleed.mp4', render_bleed)

print("ALL 6 ABILITY VIDEOS GENERATED SUCCESSFULLY!")
