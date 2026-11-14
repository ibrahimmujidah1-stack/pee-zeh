import os
import sys
import asyncio
import subprocess
from pathlib import Path
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont
import edge_tts

# Paths
BASE_DIR = Path("C:/Users/HP/p-zeh")
SCRATCH_DIR = BASE_DIR / "demo_temp"
SCRATCH_DIR.mkdir(exist_ok=True)
OUTPUT_MP4 = BASE_DIR / "p-zeh-mobile-demo.mp4"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

# Mobile Video Dimensions (9:16 Vertical Video: 720 x 1280 HD)
WIDTH = 720
HEIGHT = 1280

SCENES = [
    {
        "id": 1,
        "title": "The Cultural Problem & Why p-zeh Was Built",
        "route": "http://127.0.0.1:5173/onboarding",
        "badge": "1. THE CULTURAL PROBLEM",
        "text": (
            "Welcome to p-zeh: the real-time digital money-spraying platform built for Nigerian Owambe parties on Stellar and Pollar rails. "
            "In Nigerian culture, spraying cash at weddings and birthdays is the ultimate expression of honor and celebration. "
            "However, physical banknotes create massive problems: cash gets stolen on dance floors, notes get torn and dirty, "
            "celebrants spend four hours counting money late at night, and family in London, Atlanta, and Houston are completely excluded from spraying. "
            "p-zeh solves this by digitizing the entire Owambe dance floor."
        ),
    },
    {
        "id": 2,
        "title": "First-Time Host Onboarding & PIN Setup",
        "route": "http://127.0.0.1:5173/onboarding",
        "badge": "2. HOST ONBOARDING & PIN",
        "text": (
            "Getting started takes under sixty seconds. The event host begins with an intuitive onboarding flow, entering the celebration title, "
            "celebrant names, and venue. Next, the host creates their own personal four-digit security PIN and optional biometric Face ID "
            "to protect their payout vault. We eliminated all hardcoded demo PINs: this is production-grade security from day one."
        ),
    },
    {
        "id": 3,
        "title": "Live NIBSS Bank Account Resolution (OPay)",
        "route": "http://127.0.0.1:5173/bank",
        "badge": "3. LIVE NIBSS RESOLUTION",
        "text": (
            "Next is bank settlement. When the host selects OPay Digital Bank and enters their ten-digit account number, 9136447931, "
            "p-zeh’s live verification service instantly resolves the account via Central Bank of Nigeria and NIBSS standards, "
            "automatically pre-filling the verified account holder name: Ibrahim Mujidah. Real bank verification, guaranteed."
        ),
    },
    {
        "id": 4,
        "title": "Table QR Tent Card Distribution",
        "route": "http://127.0.0.1:5173/qr",
        "badge": "4. TABLE QR CARDS",
        "text": (
            "Once setup is complete, the host displays high-resolution QR tent cards across guest dining tables and the venue entrance. "
            "Guests do not need to download an app or register an account. They simply point their smartphone camera at the table QR card "
            "to launch the mobile spray pad directly in their mobile browser."
        ),
    },
    {
        "id": 5,
        "title": "Guest Mobile Spray Pad & Pollar Integration",
        "route": "http://127.0.0.1:5173/spray/owambe-2026",
        "badge": "5. GUEST SPRAY PAD",
        "text": (
            "On the guest mobile phone, spraying is fast and fun. Guests pick preset baller tiers like Otunba Baller for fifty dollars, "
            "type a personal shoutout like 'Soft life forever! Cheers to the couple!', and sign in with Google in one tap via Pollar. "
            "There are zero seed phrases, zero gas tokens, and zero crypto friction."
        ),
    },
    {
        "id": 6,
        "title": "Stellar Horizon Testnet Blockchain Settlement",
        "route": "http://127.0.0.1:5173/spray/owambe-2026",
        "badge": "6. STELLAR HORIZON RAILS",
        "text": (
            "When the guest hits Spray Now, the transaction executes directly on the Stellar Horizon testnet blockchain. "
            "Real value moves on-chain with sub-second finality and near-zero network fees, providing an immutable cryptographic "
            "transaction hash linked directly to the Stellar Expert public ledger."
        ),
    },
    {
        "id": 7,
        "title": "Venue TV Projector Live Wall & Afrobeats Celebration",
        "route": "http://127.0.0.1:5173/wall/owambe-2026",
        "badge": "7. PROJECTOR LIVE WALL",
        "text": (
            "Simultaneously, the venue projector wall explodes! Afrobeats brass fanfares sound, procedural cash register chimes chime, "
            "digital Nigerian one-thousand Naira notes and hundred-dollar bills cascade across the screen, and the guest’s shoutout takes center stage. "
            "The Top Ballers Tonight leaderboard updates live, creating electrifying competition across the hall."
        ),
    },
    {
        "id": 8,
        "title": "Instant Bank Auto-Settlement & Host Audit",
        "route": "http://127.0.0.1:5173/host",
        "badge": "8. INSTANT AUTO-OFFRAMP",
        "text": (
            "Finally, the host receives immediate gratification. Through Pollar’s automated off-ramp rails, the fifty dollars in USDC is instantly "
            "credited in Naira to the host’s verified OPay account: no waiting till the next day, no manual counting. "
            "The host can unlock the vault with their PIN and download the complete CSV audit ledger with one tap. "
            "p-zeh: African celebration culture, powered frictionlessly by Stellar and Pollar. Thank you!"
        ),
    },
]

async def generate_all_tts():
    print("Generating Nigerian voiceover audio tracks via Edge TTS...")
    for s in SCENES:
        audio_path = SCRATCH_DIR / f"scene_{s['id']}.mp3"
        print(f"  -> Generating Scene {s['id']} audio...")
        comm = edge_tts.Communicate(s["text"], "en-NG-AbeoNeural")
        await comm.save(str(audio_path))
    print("All audio tracks generated successfully!")

def capture_screenshot(url, out_path):
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--window-size=430,932", # iPhone 15 Pro Max aspect
        f"--screenshot={out_path}",
        url,
    ]
    subprocess.run(cmd, check=True)

def get_audio_duration(audio_file):
    cmd = [
        FFMPEG_EXE,
        "-i", str(audio_file),
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 20.0

def create_scene_frame(shot_path, scene_info, out_frame_path):
    # Create 720 x 1280 Canvas
    base = Image.new("RGB", (WIDTH, HEIGHT), (5, 10, 8))
    draw = ImageDraw.Draw(base)

    # Top Header Bar (Height: 110px)
    draw.rectangle([(0, 0), (WIDTH, 110)], fill=(10, 20, 16))
    draw.rectangle([(0, 108), (WIDTH, 110)], fill=(16, 185, 129)) # Emerald accent line

    # Top Brand
    draw.text((30, 20), "🍾 p-zeh Owambe", fill=(255, 255, 255))
    draw.text((30, 48), scene_info["badge"], fill=(52, 211, 153))
    draw.text((30, 75), scene_info["title"], fill=(209, 213, 219))

    # Center Mobile Phone Content
    if os.path.exists(shot_path):
        shot = Image.open(shot_path)
        # Scale to fit center: width ~ 430, height ~ 880
        shot_w = 430
        shot_h = int(shot.height * (shot_w / shot.width))
        shot_resized = shot.resize((shot_w, shot_h), Image.Resampling.LANCZOS)
        
        # Phone chassis container
        phone_x = (WIDTH - shot_w) // 2
        phone_y = 130
        
        # Draw phone outer border
        draw.rounded_rectangle(
            [(phone_x - 6, phone_y - 6), (phone_x + shot_w + 6, phone_y + shot_h + 6)],
            radius=24,
            outline=(30, 41, 59),
            width=5
        )
        base.paste(shot_resized, (phone_x, phone_y))

    # Bottom Caption / Subtitle Bar (Height: 200px)
    bot_y = HEIGHT - 200
    draw.rectangle([(0, bot_y), (WIDTH, HEIGHT)], fill=(10, 18, 14))
    draw.rectangle([(0, bot_y), (WIDTH, bot_y + 2)], fill=(16, 185, 129))
    
    # Subtitle Text Wrapping
    draw.text((30, bot_y + 15), "AUDIO NARRATION & ARCHITECTURE:", fill=(52, 211, 153))
    
    # Break text into 3-4 readable lines
    words = scene_info["text"].split()
    lines = []
    cur_line = []
    for w in words:
        cur_line.append(w)
        if len(" ".join(cur_line)) > 65:
            lines.append(" ".join(cur_line))
            cur_line = []
    if cur_line:
        lines.append(" ".join(cur_line))

    # Render up to 5 lines of subtitles
    for i, line in enumerate(lines[:5]):
        draw.text((30, bot_y + 40 + i * 26), line, fill=(243, 244, 246))

    base.save(out_frame_path)

def render_scene_video(scene, frame_path, audio_path, out_video_path):
    duration = get_audio_duration(audio_path) + 1.0
    print(f"  -> Rendering Scene {scene['id']} MP4 ({duration:.1f}s)...")
    cmd = [
        FFMPEG_EXE,
        "-y",
        "-loop", "1",
        "-i", str(frame_path),
        "-i", str(audio_path),
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-t", str(duration),
        "-shortest",
        str(out_video_path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def concat_all_scenes():
    print("Concatenating all 8 scenes into final broadcast MP4 video...")
    concat_txt = SCRATCH_DIR / "concat_list.txt"
    with open(concat_txt, "w") as f:
        for s in SCENES:
            v_path = SCRATCH_DIR / f"scene_{s['id']}.mp4"
            # Format for ffmpeg concat demuxer
            safe_p = str(v_path).replace("\\", "/")
            f.write(f"file '{safe_p}'\n")

    cmd = [
        FFMPEG_EXE,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_txt),
        "-c", "copy",
        str(OUTPUT_MP4),
    ]
    subprocess.run(cmd, check=True)
    print(f"Final MP4 Video created successfully: {OUTPUT_MP4}")

def main():
    # 1. Generate Voiceovers
    asyncio.run(generate_all_tts())

    # 2. Capture Screenshots & Build Frames
    print("Capturing live Chrome screenshots and compositing frames...")
    for s in SCENES:
        shot_path = SCRATCH_DIR / f"shot_{s['id']}.png"
        frame_path = SCRATCH_DIR / f"frame_{s['id']}.png"
        print(f"  -> Capturing {s['route']} for Scene {s['id']}...")
        capture_screenshot(s["route"], shot_path)
        create_scene_frame(shot_path, s, frame_path)

    # 3. Render Each Scene Clip
    for s in SCENES:
        frame_path = SCRATCH_DIR / f"frame_{s['id']}.png"
        audio_path = SCRATCH_DIR / f"scene_{s['id']}.mp3"
        video_path = SCRATCH_DIR / f"scene_{s['id']}.mp4"
        render_scene_video(s, frame_path, audio_path, video_path)

    # 4. Concatenate into Final Video
    concat_all_scenes()
    print("ALL DONE!")

if __name__ == "__main__":
    main()
