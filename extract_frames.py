import cv2
import os

video_path = 'Camera_pans_down_Lego_cityscape_20260912231437.mp4'
output_dir = 'frames'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

vidcap = cv2.VideoCapture(video_path)
if not vidcap.isOpened():
    print("Error opening video file")
    exit()

success, image = vidcap.read()
count = 1

while success:
    cv2.imwrite(f"{output_dir}/frame_{count:04d}.jpg", image)
    success, image = vidcap.read()
    if count % 20 == 0:
        print(f"Extracted {count} frames...")
    count += 1

print(f"Finished extracting {count-1} frames to '{output_dir}' directory.")
