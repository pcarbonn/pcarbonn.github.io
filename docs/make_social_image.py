# This script creates a 1200x630 social image with the left half as front_cover.png and the right half as text.
from PIL import Image, ImageDraw, ImageFont

# Load cover
cover = Image.open('front_cover.png')

# Create base image
w, h = 1200, 630
img = Image.new('RGB', (w, h), (26, 48, 32))  # deep forest green

# Resize cover to fit left half (maintain aspect ratio, crop if needed)
cover_aspect = cover.width / cover.height
left_h = 630
left_w = int(left_h * cover_aspect)
# if cover_aspect > left_w / left_h:
#     # Too wide, crop width
#     new_h = left_h
#     new_w = int(left_h * cover_aspect)
#     cover = cover.resize((new_w, new_h), Image.LANCZOS)
#     left = (new_w - left_w) // 2
#     cover = cover.crop((left, 0, left + left_w, left_h))
# else:
#     # Too tall, crop height
#     new_w = left_w
#     new_h = int(left_w / cover_aspect)
#     cover = cover.resize((new_w, new_h), Image.LANCZOS)
#     top = (new_h - left_h) // 2
#     cover = cover.crop((0, top, left_w, top + left_h))
cover = cover.resize((left_w, left_h), Image.LANCZOS)
img.paste(cover, (0, 0))

# Draw text on right
draw = ImageDraw.Draw(img)

# Load fonts (fallback to default if not found)
try:
    title_font = ImageFont.truetype('DejaVuSans-Bold.ttf', 64)
    subtitle_font = ImageFont.truetype('DejaVuSans.ttf', 32)
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()

# Title and subtitle
title = "100-year Agenda"
subtitle = "For a lasting record of your life’s journey."

# Calculate positions
right_x = left_w + 40
current_y = 180

# Draw title
_, th = draw.textsize(title, font=title_font)
draw.text((right_x, current_y), title, fill=(255, 255, 255), font=title_font)
current_y += th + 40

# Draw subtitle
_, sh = draw.textsize(subtitle, font=subtitle_font)
draw.text((right_x, current_y), subtitle, fill=(220, 220, 220), font=subtitle_font)

# Save
img.save('social.png')
print('social.png created.')
