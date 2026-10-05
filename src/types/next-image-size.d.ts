declare module "next/dist/compiled/image-size" {
  function imageSize(input: Uint8Array): { width?: number; height?: number; orientation?: number };
  export default imageSize;
}
