import JSZip from 'jszip';

export const createZip = async (files: File[]) => {
  const zip = new JSZip();

  // File[] を ZIP に追加
  for (const file of files) {
    const fileContent = await file.arrayBuffer(); // File を ArrayBuffer に変換
    zip.file(file.name, fileContent);
  }

  // ZIP ファイルを生成
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return zipBlob
};
