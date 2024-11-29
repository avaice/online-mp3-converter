import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { getExt } from "./ext";

export const mp3ConverterWorker = async (
  file: File,
  bitrate: number,
  output: "audio/mpeg" | "audio/wav" | "audio/flac" | "audio/ogg" | "audio/aac",
  progress: (arg: { ratio: number }) => void
): Promise<File> => {
  const outputExt = getExt(output);
  const outputFileName = `${file.name.split(".")[0]}.${outputExt}`;
  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  });
  ffmpeg.setProgress(progress);
  await ffmpeg.load();
  ffmpeg.FS("writeFile", "sound", await fetchFile(file));
  await ffmpeg.run("-i", "sound", "-b:a", `${bitrate}k`, outputFileName);
  const data = ffmpeg.FS("readFile", outputFileName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = new Blob([data.buffer as any], { type: output });

  // cleanup
  ffmpeg.FS("unlink", outputFileName);
  ffmpeg.FS("unlink", "sound");

  return new File([blob], outputFileName);
};
