let upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
let cloud_name = import.meta.env.VITE_CLOUD_NAME;
let cloudinary_api = import.meta.env.VITE_CLOUDINARY_API;
export default async function uploadImage(image) {
  let data = new FormData();
  data.append("file", image);
  data.append("upload_preset", upload_preset);
  data.append("cloud_name", cloud_name);
  let res = await fetch(cloudinary_api, {
    method: "POST",
    body: data,
  });
  let imageUrl = await res.json();
  return imageUrl.url;
}
