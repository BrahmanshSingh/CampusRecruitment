import os
import cv2
from PIL import Image

def extract_24fps():
    video_path = "Camera_pans_down_Lego_cityscape_20260912231437.mp4"
    output_dir = "frames"
    os.makedirs(output_dir, exist_ok=True)

    # Clean existing frames
    for f in os.listdir(output_dir):
        if f.endswith(".jpg") or f.endswith(".webp"):
            try:
                os.remove(os.path.join(output_dir, f))
            except Exception:
                pass

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return

    orig_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / orig_fps if orig_fps > 0 else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Extracting all native frames: {width}x{height}, {orig_fps:.2f} FPS, {total_frames} frames...")

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_idx += 1
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)
        
        # Save as optimized JPEG
        filename = f"frame_{frame_idx:04d}.jpg"
        filepath = os.path.join(output_dir, filename)
        img.save(filepath, "JPEG", quality=82, optimize=True)

    cap.release()
    print(f"Successfully extracted {frame_idx} native frames to '{output_dir}/' at 24 FPS.")

if __name__ == "__main__":
    extract_24fps()
