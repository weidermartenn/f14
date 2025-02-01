export const fileIcon = (extension: string) => {
    switch (extension) {
        case "pdf":
          return "fa-solid fa-file-pdf";
        case "doc":
        case "docx":
          return "fa-solid fa-file-word";
        case "xls":
        case "xlsx":
          return "fa-solid fa-file-excel";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
          return "fa-solid fa-file-image";
        case "txt":
          return "fa-solid fa-file-lines";
        case "cpp":
        case "py":
        case "js":
        case "ts":
        case "kt":
        case "dart":
        case "cs":
        case "java":
          return "fa-solid fa-file-code";
        case "rar":
        case "zip":
          return "fa-solid fa-file-zipper";
        case "mp4":
            return "fa-solid fa-file-video";
        case "mp3":
            return "fa-solid fa-file-audio";
        default:
          return "fa-solid fa-file";
    }
}