import React, { useRef } from 'react';

import { withRef } from '@udecode/cn';
import { useEditorRef } from '@udecode/plate-common';
import { useCOS } from '@/hooks';
import {
  type ELEMENT_IMAGE,
  type ELEMENT_MEDIA_EMBED,
  insertMedia,
} from '@udecode/plate-media';

import { Icons } from './icons';

import { ToolbarButton } from './toolbar';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const inputElementRef = useRef<HTMLInputElement>(null);
  const editorRef = useEditorRef();
  const { upload } = useCOS({ returnUrl: true, isPublic: true });

  const handleInsertImage = () => {
    if(!inputElementRef.current) return;

    inputElementRef.current.click();
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const { target: { files }} = e;
    if(!files || !files.length) return;

    const file = files.item(0)!;
    insertMedia(editorRef, { getUrl: () => upload(file) });
  };

  return (
    <ToolbarButton ref={ref} onClick={handleInsertImage} {...rest}>
      <input type="file" accept=".jpg,.png,.webp,.gif" style={{ display: 'none' }} ref={inputElementRef} onChange={handleUploadImage} />
      <Icons.image />
    </ToolbarButton>
  );
});
