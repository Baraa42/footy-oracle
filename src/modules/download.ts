import FileSaver from "file-saver";
import { Result } from "postcss";

export const useDownload = () => {
  const isSupported = (): boolean => {
    try {
      const isFileSaverSupported = !!new Blob();
      return isFileSaverSupported;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const b64toBlob = async (base64: string) => {
    const result: any = await fetch(`${base64}`);
    return result.blob();
  };

  const downloadText = (text: any, fileName: string, fileType: string = "txt") => {
    const file = new File([text], fileName + "." + fileType, {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(file);
  };

  const downloadPNG = async (base64: string, fileName: string, isBlob: boolean = false) => {
    const blob = base64;
    if (!isBlob) {
      const blob: Blob = await b64toBlob(base64);
    }

    const file = new File([blob], fileName + ".png", {
      type: "image/png",
    });
    FileSaver.saveAs(file);
  };

  const downloadSVG = (svgContent: string, fileName: string) => {
    const file = new File([svgContent], fileName + ".svg", {
      type: "image/svg+xml",
    });
    FileSaver.saveAs(file);
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, fileName: string) => {
    canvas.toBlob((blob: any) => {
      saveAs(blob, fileName + ".png");
    });
  };

  return { downloadText, downloadPNG, downloadSVG, downloadCanvas };
};
