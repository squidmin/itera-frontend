import React from 'react';
import {Box} from '@mui/material';
import {ContentBlock, GifBlock, ImageBlock, VideoBlock} from '../interfaces/ContentBlock';
import ReactMarkdown from 'react-markdown';
import '../styles/prism-nord.css';
import DOMPurify from 'dompurify';

import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus';

const ContentRenderer: React.FC<{ block: ContentBlock; renderHTML?: boolean }> = ({block, renderHTML}) => {

  // Helper function to determine if the block has width and height properties
  const isMediaBlock = (block: ContentBlock): block is ImageBlock | GifBlock | VideoBlock => {
    return ['image', 'gif', 'video'].includes(block.type);
  };

  // Determine styles based on block type
  const mediaStyles = isMediaBlock(block) ? {
    display: 'block',
    textAlign: block.textAlign ? block.textAlign : 'center',
    justifyContent: block.justifyContent ? block.justifyContent : 'center',
    width: block.width ? block.width : '100%', // Default to 100% if not specified
    height: block.height ? block.height : 'auto', // Default to auto if not specified
    marginTop: 2,
    marginBottom: 4,
    objectFit: 'contain',
  } : {};

  switch (block.type) {
    case 'text':
      const cleanHTML = DOMPurify.sanitize(block.content);
      return (
        <Box
          sx={{
            fontSize: '0.85rem',
            marginBottom: block.marginBottom ? block.marginBottom : 2,
            marginLeft: 5,
            marginRight: 5,
          }}
        >
          {
            block.isCode && renderHTML ?
              <div dangerouslySetInnerHTML={{__html: cleanHTML}}/> :
              block.isCode ?
                <ReactMarkdown rehypePlugins={[rehypeRaw, rehypePrism]}>{block.content}</ReactMarkdown>
                :
                <ReactMarkdown>{block.content}</ReactMarkdown>
          }
        </Box>
      );
    case 'image':
    case 'gif': // Treat GIFs the same as images
      return (
        <Box sx={{display: 'block', textAlign: 'center',}}>
          <Box
            component="img"
            src={block.src}
            alt={block.alt}
            sx={{
              width: '75%', // Ensure it takes up to 75% of its parent's width
              maxWidth: '100%', // Ensure it does not exceed the viewport width
              height: 'auto', // Maintain aspect ratio
              objectFit: 'contain', // Ensure the content is scaled to maintain its aspect ratio while fitting within the element's content box
              marginTop: 2,
              marginBottom: 4,
            }}
          />
        </Box>
      );
    case 'video':
      const isVideo = block.type === 'video';
      const Component = isVideo ? 'video' : 'img';
      // Add autoPlay, muted, and loop attributes directly if it's a video
      const videoProps = isVideo ? {autoPlay: true, muted: true, loop: true, controls: true} : {};

      return (
        <Box
          component={Component}
          src={block.src}
          alt={block.alt}
          sx={{...mediaStyles}}
          {...videoProps} // Spread the videoProps directly onto the Box component
        >
          {isVideo ? "Your browser does not support the video tag." : null}
        </Box>
      );
    default:
      return null;
  }

};

export default ContentRenderer;
