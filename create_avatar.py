from PIL import Image

def create_avatar():
    # Open original image (update with your photo's name)
    img = Image.open('your_photo.jpg')  # or .png, .jpeg etc.
    
    # Convert to square if not already
    size = min(img.size)
    left = (img.width - size) // 2
    top = (img.height - size) // 2
    img = img.crop((left, top, left + size, top + size))
    
    # Resize to 400x400 (high quality base size)
    img = img.resize((400, 400), Image.Resampling.LANCZOS)
    
    # Save in the correct location
    img.save('src/static/images/avatar.png', 
            'PNG', 
            quality=95, 
            optimize=True)
    
    # Create smaller version for testing
    img_small = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_small.save('src/static/images/avatar_small.png', 
                  'PNG', 
                  quality=95, 
                  optimize=True)

if __name__ == "__main__":
    create_avatar() 