import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import PropTypes from "prop-types";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop, cropShape = "rect") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  if (cropShape === "round") {
    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  if (cropShape === "round") {
    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      },
      cropShape === "round" ? "image/png" : "image/jpeg",
    );
  });
}

export default function ImageCropperModal({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
  title = "Crop Image",
  cropShape = "rect",
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedBlob = await getCroppedImg(
        image,
        croppedAreaPixels,
        cropShape,
      );
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  }, [croppedAreaPixels, cropShape, image, onCropComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-lg bg-[#2A2A2A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <h2 className="montserratFont text-xl font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[40vh] bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="bg-[#2A2A2A] px-6 py-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="montserratFont rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCropConfirm}
              className="montserratFont rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ImageCropperModal.propTypes = {
  image: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  aspectRatio: PropTypes.number,
  title: PropTypes.string,
  cropShape: PropTypes.oneOf(["rect", "round"]),
};
