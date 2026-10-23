export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Ensure we just return the base64 string including the data type prefix
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const createWavFile = (audioData: Blob): Blob => {
  // Simple pass-through for now, assuming MediaRecorder gives a usable container (webm/ogg).
  // For production Voice Cloning, converting to PCM WAV is ideal, 
  // but Gemini often accepts webm/mp4 audio inputs directly.
  return audioData;
};
