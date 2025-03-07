import axios from "axios";

const uploadToCloudinary = (file) => {
  return new Promise(async (resolve, reject) => {
    if (!file) {
      return reject("No file selected");
    }

    try {
      const CLOUD_NAME = "db4cqrm9w"; // 🔹 Replace with your Cloudinary Cloud Name
      const UPLOAD_PRESET = "profile_uploads"; // 🔹 Replace with your Upload Preset

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      resolve(response.data.secure_url); // ✅ Return Cloudinary image URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      reject(error);
    }
  });
};

export default uploadToCloudinary;
