/**
 * Type declarations for piexifjs
 * piexifjs is a pure-JS library for reading/writing EXIF in JPEG images.
 * It ships no built-in types, so we declare them here.
 */
declare module "piexifjs" {
  /** IFD tag constants for the main image (IFD0 / "0th") */
  interface ImageIFDTags {
    ImageDescription: number;
    XPTitle: number;
    XPComment: number;
    XPKeywords: number;
    XPSubject: number;
    Artist: number;
    Software: number;
    [key: string]: number;
  }

  /** IFD tag constants for EXIF-specific data */
  interface ExifIFDTags {
    UserComment: number;
    [key: string]: number;
  }

  /** IFD tag constants for GPS data */
  interface GPSIFD {
    [key: string]: number;
  }

  /** Structure returned by piexif.load() */
  interface ExifObject {
    "0th": Record<number, any>;
    Exif: Record<number, any>;
    GPS: Record<number, any>;
    Interop: Record<number, any>;
    "1st": Record<number, any>;
    thumbnail?: string | null;
  }

  /** Load EXIF data from a JPEG data URL string */
  function load(dataUrl: string): ExifObject;

  /** Serialize an ExifObject into a binary string for insertion */
  function dump(exifObj: ExifObject): string;

  /** Insert EXIF binary string into a JPEG data URL, returning a new data URL */
  function insert(exifBytes: string, dataUrl: string): string;

  /** Remove all EXIF data from a JPEG data URL */
  function remove(dataUrl: string): string;

  const ImageIFD: ImageIFDTags;
  const ExifIFD: ExifIFDTags;
  const GPSIFD: GPSIFD;

  const piexif: {
    load: typeof load;
    dump: typeof dump;
    insert: typeof insert;
    remove: typeof remove;
    ImageIFD: ImageIFDTags;
    ExifIFD: ExifIFDTags;
    GPSIFD: GPSIFD;
  };

  export default piexif;
}
