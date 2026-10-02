// src/lib/cloudinary.ts
// ================================================================
// Cloudinary Upload Utility untuk PackWise AI
// ================================================================
// Cara kerja:
//   1. Upload file foto ke Cloudinary (langsung dari browser)
//   2. Cloudinary return URL publik
//   3. URL tersebut yang disimpan ke kolom image_url di Supabase
// ================================================================

export interface CloudinaryUploadResult {
  secure_url: string;      // URL HTTPS final yang disimpan ke database
  public_id: string;       // ID unik file di Cloudinary (untuk delete nanti jika perlu)
  width: number;
  height: number;
  format: string;
}

/**
 * Upload satu file gambar ke Cloudinary.
 * Menggunakan "unsigned upload" via Upload Preset (tidak butuh API Secret di frontend).
 *
 * @param file - File gambar yang akan diupload
 * @param folder - Sub-folder di Cloudinary (default: "packwise/product-images")
 * @returns URL publik gambar atau null jika gagal
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "packwise/product-images"
): Promise<string | null> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName === "YOUR_CLOUD_NAME_HERE") {
    console.error(
      "[Cloudinary] VITE_CLOUDINARY_CLOUD_NAME atau VITE_CLOUDINARY_UPLOAD_PRESET belum diset di .env"
    );
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);


  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );


    if (!response.ok) {
      const errText = await response.text();
      console.error("[Cloudinary] Upload gagal:", errText);
      return null;
    }

    const data: CloudinaryUploadResult = await response.json();
    return data.secure_url;
  } catch (err) {
    console.error("[Cloudinary] Network error saat upload:", err);
    return null;
  }
}

/**
 * Upload base64 image string ke Cloudinary.
 * Berguna untuk upload annotated image (hasil YOLO) yang formatnya base64.
 *
 * @param base64DataUrl - String base64 (format: "data:image/jpeg;base64,...")
 * @param folder - Sub-folder di Cloudinary
 * @returns URL publik gambar atau null jika gagal
 */
export async function uploadBase64ToCloudinary(
  base64DataUrl: string,
  folder: string = "packwise/annotated-images"
): Promise<string | null> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName === "YOUR_CLOUD_NAME_HERE") {
    console.error("[Cloudinary] Env vars belum diset.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", base64DataUrl); // Cloudinary menerima base64 string langsung
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );


    if (!response.ok) {
      const errText = await response.text();
      console.error("[Cloudinary] Upload base64 gagal:", errText);
      return null;
    }

    const data: CloudinaryUploadResult = await response.json();
    return data.secure_url;
  } catch (err) {
    console.error("[Cloudinary] Network error:", err);
    return null;
  }
}
