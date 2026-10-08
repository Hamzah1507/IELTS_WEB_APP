import fitz
import os
import glob

def compress_pdfs():
    input_dir = r"c:\Users\admin\Desktop\IELTS-WEB_APP\public\Study Material"
    output_dir = r"c:\Users\admin\Desktop\IELTS-WEB_APP\public\Study Material\Compressed"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))
    
    print(f"Found {len(pdf_files)} PDF files to compress...")
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        out_path = os.path.join(output_dir, filename)
        
        print(f"Compressing: {filename}")
        try:
            doc = fitz.open(pdf_path)
            # Use max garbage collection and deflate to compress
            doc.save(out_path, garbage=4, deflate=True, clean=True)
            
            orig_size = os.path.getsize(pdf_path) / (1024 * 1024)
            new_size = os.path.getsize(out_path) / (1024 * 1024)
            print(f"  -> Reduced from {orig_size:.2f}MB to {new_size:.2f}MB")
        except Exception as e:
            print(f"  -> Failed to compress {filename}: {e}")

if __name__ == "__main__":
    compress_pdfs()
