from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon():
    """Create a simple icon for the application"""
    
    # Create directories if they don't exist
    os.makedirs('src/static/icons', exist_ok=True)
    
    # Create base image (256x256 with transparency)
    size = (256, 256)
    image = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Draw a circle background
    circle_color = (0, 255, 153, 255)  # #00ff99
    circle_bounds = [20, 20, 236, 236]  # Leave margin for anti-aliasing
    draw.ellipse(circle_bounds, fill=circle_color)
    
    # Add text
    text = "⚡"
    try:
        # Try to use a specific font, fall back to default
        font = ImageFont.truetype("arial.ttf", 120)
    except:
        font = ImageFont.load_default()
    
    # Center the text
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_position = (
        (size[0] - text_width) // 2,
        (size[1] - text_height) // 2
    )
    
    # Draw text in dark color
    draw.text(text_position, text, fill=(26, 26, 26, 255), font=font)
    
    # Save in different sizes
    sizes = [(192, 192), (512, 512)]
    for width, height in sizes:
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        filename = f'src/static/icons/icon-{width}x{height}.png'
        resized.save(filename, 'PNG')
        print(f"Created icon: {filename}")

if __name__ == "__main__":
    create_app_icon()