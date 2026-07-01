import React, { createContext, useContext, useState, useEffect } from "react";
import defaultLogo from "./assets/logo.png";
import defaultBanner from "./assets/banner.jpg";

const STORAGE_KEY = "wolfpackdna_images";

const defaultImages = {
  logo: defaultLogo,
  banner: defaultBanner,
  about: "",
  "genetic-genealogy": "",
  "law-enforcement": "",
};

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultImages, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return { ...defaultImages };
  });

  useEffect(() => {
    try {
      const toStore = {};
      for (const key of Object.keys(images)) {
        if (images[key] && images[key] !== defaultImages[key]) {
          toStore[key] = images[key];
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      // ignore storage errors
    }
  }, [images]);

  const updateImage = (key, dataUrl) => {
    setImages((prev) => ({ ...prev, [key]: dataUrl }));
  };

  const deleteImage = (key) => {
    setImages((prev) => ({ ...prev, [key]: defaultImages[key] || "" }));
  };

  const getImage = (key) => {
    return images[key] || defaultImages[key] || "";
  };

  return (
    <ImageContext.Provider value={{ images, updateImage, deleteImage, getImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => useContext(ImageContext);

export default ImageContext;