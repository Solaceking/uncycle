from PIL import Image, ImageDraw

def create_favicon():
    # Create a 32x32 image with a transparent background
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a circle with the brand color
    draw.ellipse([2, 2, 30, 30], fill='#00A67E')
    
    # Save as ICO
    img.save('src/static/images/favicon.ico', format='ICO')

if __name__ == "__main__":
    create_favicon()