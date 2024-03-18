export interface MediaBlock {
  src: string;
  alt: string;
  height?: string | number;
  width?: string | number;
  marginBottom?: string | number;
  textAlign?: string;
  justifyContent?: string;
}

export interface TextBlock {
  type: 'text';
  content: string;
  marginBottom?: string | number;
  textAlign?: string;
  justifyContent?: string;
  isCode?: boolean;
}

export interface ImageBlock extends MediaBlock {
  type: 'image';
}

export interface GifBlock extends MediaBlock {
  type: 'gif';
}

export interface VideoBlock extends MediaBlock {
  type: 'video';
}

export type ContentBlock = TextBlock | ImageBlock | GifBlock | VideoBlock;
