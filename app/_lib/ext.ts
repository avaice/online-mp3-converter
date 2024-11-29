export const getExt = (
  output: "audio/mpeg" | "audio/wav" | "audio/flac" | "audio/ogg" | "audio/aac"
) => {
  switch (output) {
    case "audio/mpeg":
      return "mp3";
    case "audio/wav":
      return "wav";
    case "audio/flac":
      return "flac";
    case "audio/ogg":
      return "ogg";
    case "audio/aac":
      return "m4a";
    default:
      throw new Error("Invalid output");
  }
};

export const getMimeType = (ext: "mp3" | "wav" | "flac" | "ogg" | "m4a") => {
  switch (ext) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "flac":
      return "audio/flac";
    case "ogg":
      return "audio/ogg";
    case "m4a":
      return "audio/aac";
    default:
      throw new Error("Invalid ext");
  }
};
