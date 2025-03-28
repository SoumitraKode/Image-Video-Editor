"use server"

import { UploadApiResponse, v2 as cloudinary } from "cloudinary"
import { actionClient } from "@/server/safe-action"
import z from "zod"

cloudinary.config({
  cloud_name: "dll60mjnq",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const formData = z.object({
  image: z.instanceof(FormData),
})

type UploadResult =
  | { success: UploadApiResponse; error?: never }
  | { error: string; success?: never }

export const uploadImage = actionClient
  .schema(formData)
  .action(async ({ parsedInput: { image } }): Promise<UploadResult> => {
    console.log(image)
    const formImage = image.get("image")

    if (!formImage) return { error: "No image provided" }
    if (!image) return { error: "No image provided" }

    const file = formImage as File

    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: "uploads", // Ensure you're not using AI analysis options
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error("Upload failed:", error);
              reject({ error: error.message });
            } else {
              resolve({ success: result });
            }
          }
        );

        uploadStream.end(buffer)
      })
    } catch (error) {
      console.error("Error processing file:", error)
      return { error: "Error processing file" }
    }
  })
