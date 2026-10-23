export function convertBase64ToPcm(base64: string): Int16Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const numSamples = bytes.length / 2;
  return new Int16Array(bytes.buffer, bytes.byteOffset, numSamples);
}

export function pcmToFloat32(pcm: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    float32[i] = pcm[i] / 32768.0; // Normalise to [-1.0, 1.0]
  }
  return float32;
}

export function encodeWAV(samples: Int16Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* File length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* Format chunk identifier */
  writeString(view, 12, "fmt ");
  /* Format chunk length */
  view.setUint32(16, 16, true);
  /* Sample format (1 is uncompressed raw PCM) */
  view.setUint16(20, 1, true);
  /* Channel count (1 for mono) */
  view.setUint16(22, 1, true);
  /* Sample rate */
  view.setUint32(24, sampleRate, true);
  /* Byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* Block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* Bits per sample (16 bit) */
  view.setUint16(34, 16, true);
  /* Data chunk identifier */
  writeString(view, 36, "data");
  /* Data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return new Blob([view], { type: "audio/wav" });
}

// Generate an SVG-friendly path representing the waveform structure
export function generateWaveformPoints(pcm: Int16Array, pointsCount: number = 60): number[] {
  if (pcm.length === 0) return Array(pointsCount).fill(5);
  
  const step = Math.floor(pcm.length / pointsCount);
  const result: number[] = [];
  
  for (let i = 0; i < pointsCount; i++) {
    let sum = 0;
    const start = i * step;
    const end = Math.min(start + step, pcm.length);
    
    for (let j = start; j < end; j++) {
      sum += Math.abs(pcm[j]);
    }
    
    const average = sum / (end - start || 1);
    // Normalise to a scale of 2 to 40 for aesthetics
    const height = Math.max(3, Math.min(42, (average / 32768) * 80));
    result.push(height);
  }
  
  return result;
}
