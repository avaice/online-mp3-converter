/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useMemo, useState } from "react";
import { AudioFormat } from "./types";
import { mp3ConverterWorker } from "./_lib/mp3ConverterWorker";
import { getMimeType } from "./_lib/ext";
import { Selector } from "./_components/Selector";
import { Slider } from "./_components/Slider";
import { createZip } from "./_lib/createZip";

export default function Home() {
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState(128);
  const [files, setFiles] = useState<
    {
      status: "idle" | "converting" | "done" | "error";
      progress?: number;
      output?: File;
      file: File;
    }[]
  >([]);

  const [isDragging, setIsDragging] = useState(false);

  const handleSelectFile = useCallback(() => {
    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";
    input.multiple = true;
    input.accept = ".mp3,.wav,.flac,.ogg,.m4a,.mp4";
    input.onchange = (e) => {
      const selectedFiles = (e.target as HTMLInputElement).files;
      if (selectedFiles) {
        setFiles((prev) => {
          return [
            ...prev,
            ...Array.from(selectedFiles).map(
              (file) => ({ status: "idle", file } as const)
            ),
          ];
        });
      }
    };
    input.click();
  }, []);

  const handleResetFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      setIsDragging(true);
      e.preventDefault();
    },
    []
  );

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      setIsDragging(false);
      e.preventDefault();
    },
    []
  );

  const handleDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      setIsDragging(false);
      e.preventDefault();
      const accept = [
        "audio/mpeg",
        "audio/wav",
        "audio/flac",
        "audio/ogg",
        "audio/aac",
        "video/mp4",
      ];
      const noAcceptedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => !accept.includes(file.type)
      );

      if (noAcceptedFiles.length > 0) {
        alert("対応していないファイルが含まれています");
        return;
      }

      const droppedFiles = e.dataTransfer.files;
      setFiles((prev) => {
        return [
          ...prev,
          ...Array.from(droppedFiles).map(
            (file) => ({ status: "idle", file } as const)
          ),
        ];
      });
    },
    []
  );

  const handleConvert = useCallback(async () => {
    for (const file of files) {
      if (file.status === "idle") {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.file.name === file.file.name) {
              return { ...f, status: "converting", progress: 0 };
            }
            return f;
          })
        );

        mp3ConverterWorker(
          file.file,
          bitrate,
          getMimeType(format),
          ({ ratio }) =>
            setFiles((prev) =>
              prev.map((f) => {
                if (f.file.name === file.file.name) {
                  return { ...f, progress: ratio * 100 };
                }
                return f;
              })
            )
        )
          .then(async (convertedFile) => {
            const output = await convertedFile;
            setFiles((prev) =>
              prev.map((f) => {
                if (f.file.name === file.file.name) {
                  return { ...f, status: "done", output: output };
                }
                return f;
              })
            );
          })
          .catch((e) => {
            console.error(e);
            setFiles((prev) =>
              prev.map((f) => {
                if (f.file.name === file.file.name) {
                  return { ...f, status: "error" };
                }
                return f;
              })
            );
          });
      }
    }
  }, [files, bitrate, format]);

  const handleDownloadAll = useCallback(async () => {
    const zip = await createZip(
      files.map((file) => {
        if (!file.output) throw new Error("output is not defined");
        return file.output;
      })
    );
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  const noFileLoaded = useMemo(() => {
    return (
      <div
        className={`py-8 h-full flex items-center justify-center flex-col gap-2 transition select-none ${
          isDragging ? "bg-gray-200" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <img
          src="/upload.svg"
          alt="ファイルをアップロード"
          className="size-[48px]"
        />
        <button
          type="button"
          className="rounded text-white px-4 py-1.5 shadow-md hover:opacity-90 bg-gray-600"
          onClick={handleSelectFile}
        >
          ファイルを選択
        </button>
        <p className="text-center text-gray-500 text-sm max-md:hidden">
          またはドロップ
        </p>
      </div>
    );
  }, [
    handleSelectFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    isDragging,
  ]);

  return (
    <>
      <div className="p-8 w-full max-w-[1024px] mx-auto flex gap-4 min-h-svh items-center max-md:flex-col">
        <div className="flex flex-col items-center gap-8 md:w-1/2 md:h-[495px]">
          <div className="flex items-center justify-center flex-col">
            <img
              src="/shibasuberi_danbo-ru_boy.png"
              alt="芝滑りをするぼうや"
              className="size-[96px]"
            />
            <h1 className="text-2xl font-bold pt-2">MP3変換ぼうや</h1>
            <p className="text-sm text-gray-500">https://bouya.cho-ice.xyz/</p>
          </div>

          <div>
            <p className="text-sm">
              MP3, MP4, WAVなどのファイルをMP3等に変換できます。
              <br />
              変換処理はブラウザ上で行われるため、サーバーにアップロードされることはありません。
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 border rounded p-4">
            <h2 className="font-bold">変換の設定</h2>
            <Selector
              items={["mp3", "wav", "flac", "ogg", "m4a"]}
              value={format}
              setValue={setFormat}
            />
            {!["wav", "flac"].includes(format) && (
              <div className="py-4 flex gap-4 items-center">
                <span>{bitrate}kbps</span>
                <Slider
                  value={bitrate}
                  setValue={setBitrate}
                  min={64}
                  max={320}
                  step={32}
                />
              </div>
            )}

            <button
              type="button"
              className="bg-green-600 enabled:hover:opacity-90 p-2 w-full rounded text-xl text-white transition shadow-md disabled:bg-gray-400"
              disabled={
                files.length === 0 ||
                files.some((file) => file.status !== "idle")
              }
              onClick={handleConvert}
            >
              変換
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex grow md:h-[535px] max-md:w-full relative">
          <div className="w-full h-full border rounded bg-gray-100 overflow-y-scroll">
            {files.length === 0 && noFileLoaded}
            {files.length > 0 && (
              <div className="px-4 h-full relative animate-fadeIn">
                <div className="sticky top-0 py-2 flex justify-end">
                  <div className="p-1 bg-gray-600/65 w-max rounded shadow flex text-white gap-2">
                    <button
                      type="button"
                      className="p-0.5 px-1 text-sm rounded hover:bg-gray-500 transition"
                      onClick={handleResetFiles}
                    >
                      リセット
                    </button>
                    <button
                      type="button"
                      className="p-0.5 px-1 text-sm rounded hover:bg-gray-500 transition disabled:bg-gray-400 disabled:text-gray-300"
                      disabled={!files.every((file) => file.status === "done")}
                      onClick={handleDownloadAll}
                    >
                      一括保存
                    </button>
                  </div>
                </div>
                <ul className="w-full pb-2 overflow-y-auto flex flex-col gap-2">
                  {files.map((file, index) => (
                    <li
                      key={`file-${file.file.name}-${index}`}
                      className="flex items-center gap-2 rounded p-2 bg-white shadow animate-fadeIn justify-between"
                    >
                      <div className="items-center flex gap-2">
                        <img src="/music.svg" alt="" className="size-[24px]" />
                        <span>{file.file.name}</span>
                      </div>
                      <div>
                        {file.status === "idle" && (
                          <button
                            type="button"
                            className="text-sm flex items-center hover:bg-gray-200 transition p-1 rounded"
                            onClick={() => {
                              setFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <img
                              src="/delete.svg"
                              alt="削除"
                              className="size-[18px]"
                            />
                          </button>
                        )}
                        {file.status === "converting" && (
                          <div className="text-sm flex items-center transition p-1 rounded">
                            <div className="relative size-[14px] rounded-full bg-gray-300 border-[1.5px] border-[#4d4d4d]">
                              <div
                                className="absolute inset-0 rounded-full animate-conic"
                                style={{
                                  background: `conic-gradient(#4d4d4d 0% ${file.progress}%, #fff 0% 100%)`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {file.status === "done" && (
                          <button
                            type="button"
                            className="text-sm flex items-center hover:bg-gray-200 transition p-1 rounded"
                            onClick={() => {
                              if (!file.output) return;
                              const url = URL.createObjectURL(file.output);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = file.output.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <img
                              src="/download.svg"
                              alt="ダウンロード"
                              className="size-[18px]"
                            />
                          </button>
                        )}
                        {file.status === "error" && (
                          <button
                            type="button"
                            className="text-sm flex items-center hover:bg-gray-200 transition p-1 rounded"
                            onClick={() => {
                              alert("変換中にエラーが発生しました");
                            }}
                          >
                            <img
                              src="/error.svg"
                              alt="エラー"
                              className="size-[18px]"
                            />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {!files.some((file) => file.status !== "idle") && (
                  <div
                    className={`select-none border-dashed p-4 border rounded flex-col text-sm flex text-gray-600 justify-center items-center transition ${
                      isDragging ? "bg-gray-200" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <span className="max-md:hidden">
                      ここにドラッグして追加
                    </span>
                    <button
                      type="button"
                      className="rounded underline hover:opacity-95 transition"
                      onClick={handleSelectFile}
                    >
                      <span className="max-md:hidden">または</span>選択
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
