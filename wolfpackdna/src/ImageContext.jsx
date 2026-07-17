import React, { createContext, useContext, useState } from "react";

// Each site slot maps to a fixed, well-known public URL in the GCS bucket.
// Uploads always overwrite the same object name, so the URL never changes and
// is the same for every session/device. We simply render this URL directly
// and rely on the <img onError> handler to fall back to a placeholder when the
// object does not exist (404) in the bucket.
const BUCKET = "wolfpackdna-images";
const slotUrl = (key) => `https://storage.googleapis.com/${BUCKET}/site/${key}`;

// All slots default to an empty string. The website renders a placeholder for
// any slot whose image does not exist in the bucket.
const defaultImages = {
  logo: "",
  banner: "",
  about: "",
  donate: "",
  "genetic-genealogy": "",
  "law-enforcement": "",
};

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  // Slots whose image failed to load (the bucket object doesn't exist or
  // errored). Components use `failed` to decide between the image and the
  // placeholder. Resetting a slot (e.g. after a (re)upload) clears the flag.
  const [failed, setFailed] = useState({});

  // Local override used by the admin for instant feedback right after an
  // upload in the same session. It does not affect other clients.
  const [overrides, setOverrides] = useState({});

  const markFailed = (key) => {
    setFailed((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const clearFailed = (key) => {
    setFailed((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateImage = (key, dataUrl) => {
    // Admin just uploaded: show it immediately and clear any failed flag.
    clearFailed(key);
    setOverrides((prev) => ({ ...prev, [key]: dataUrl }));
  };

  const deleteImage = (key) => {
    // Clear the override so the fixed URL is used again (and will onError to
    // the placeholder once the bucket object is gone).
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFailed((prev) => ({ ...prev, [key]: true }));
  };

  // Returns the URL to render. An override (same-session upload) wins;
  // otherwise the constant public URL. Callers combine this with `failed`
  // (and onError) to show a placeholder when the image is missing.
  const getImage = (key) => {
    if (overrides[key]) return overrides[key];
    return slotUrl(key);
  };

  return (
    <ImageContext.Provider
      value={{ failed, markFailed, clearFailed, updateImage, deleteImage, getImage, defaultImages }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => useContext(ImageContext);

export default ImageContext;
