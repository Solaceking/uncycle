import os
import requests
from PIL import Image
from io import BytesIO

def download_image(url, filename, directory):
    """Download and save image with error handling"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Process image
        img = Image.open(BytesIO(response.content))
        
        # Convert to PNG if needed
        if img.format != 'PNG':
            img = img.convert('RGBA')
        
        # Resize if too large
        max_size = (400, 400)
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save
        filepath = os.path.join(directory, filename)
        img.save(filepath, 'PNG')
        print(f"Downloaded: {filename}")
        
    except Exception as e:
        print(f"Error downloading {filename}: {str(e)}")

def main():
    # Create directories if they don't exist
    logos_dir = 'src/static/images/logos'
    os.makedirs(logos_dir, exist_ok=True)
    
    # Academic Logos
    academic_logos = {
        'logo-univie.png': 'https://www.univie.ac.at/fileadmin/_processed_/csm_uni_logo_d6a2f7.png',
        'logo-boku.png': 'https://boku.ac.at/fileadmin/data/H01000/H10090/CD-Labor/BOKU-Logo_2019_cmyk.png',
    }
    
    # Government Logos
    government_logos = {
        'logo-austria-gov.png': 'https://www.bundeskanzleramt.gv.at/...',
        'logo-vienna-city.png': 'https://www.wien.gv.at/...',
    }
    
    # International Organizations
    international_logos = {
        'logo-un.png': 'https://www.un.org/...',
        'logo-unep.png': 'https://www.unep.org/...',
    }
    
    # NGO Logos
    ngo_logos = {
        'logo-greenpeace.png': 'https://media.greenpeace.org/...',
        'logo-wwf.png': 'https://wwf.panda.org/...',
        'logo-zero-waste.png': 'https://zerowasteeurope.eu/...',
    }
    
    # Combine all logos
    all_logos = {
        **academic_logos,
        **government_logos,
        **international_logos,
        **ngo_logos
    }
    
    # Download images
    for filename, url in all_logos.items():
        download_image(url, filename, logos_dir)

if __name__ == "__main__":
    main() 