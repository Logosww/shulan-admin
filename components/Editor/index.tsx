'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { withProps } from '@udecode/cn';
import { createPlugins, Plate, PlateLeaf, Value, usePlateStates, withHOC, PlateController, useReplaceEditor } from '@udecode/plate-common';
import { createParagraphPlugin, ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { createImagePlugin, ELEMENT_IMAGE, withImageUpload } from '@udecode/plate-media';
import { createBoldPlugin, MARK_BOLD, createItalicPlugin, MARK_ITALIC, createUnderlinePlugin, MARK_UNDERLINE } from '@udecode/plate-basic-marks';
// import { createFontColorPlugin } from '@udecode/plate-font';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createEmojiPlugin, ELEMENT_EMOJI_INPUT } from '@udecode/plate-emoji';
import { createDeletePlugin } from '@udecode/plate-select';
import { serializeHtml } from '@udecode/plate-serializer-html';
import { convertDataURIToFile } from '@/utils';
import { useCOS } from '@/hooks';

import { ImageElement } from './plate-ui/image-element';
import { ParagraphElement } from './plate-ui/paragraph-element';
import { TooltipProvider } from './plate-ui/tooltip';
import { Editor as PlateEditor } from './plate-ui/editor';
import { FixedToolbar } from './plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from './plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from './plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from './plate-ui/floating-toolbar-buttons';
import { withPlaceholders } from './plate-ui/placeholder';
import { EmojiInputElement } from './plate-ui/emoji-input-element';

export type EditorRef = {
  generateHTML: () => string | null;
  getRawValue: () => Value | null;
  setRawValue: (value: Value) => void;
};

export const Editor = withHOC(PlateController, forwardRef<EditorRef>(function Editor(_, ref) {
  const states = usePlateStates();
  const [editor] = states.editor();
  const [value, setValue] = states.value();
  const resetEditor = useReplaceEditor();
  const { upload } = useCOS({ returnUrl: true, isPublic: true });

  const plugins = createPlugins(
    [
      createParagraphPlugin(),
      createBoldPlugin(),
      createItalicPlugin(),
      createUnderlinePlugin(),
      /**
       * HTML Serielize 有 bug
       * text 除了添加 bold 或者 italic attribute 时，fontColor 不会被视作 leafElement
       * 暂时屏蔽 fontColor 功能
       * https://github.com/udecode/plate/issues/2853
       */
      // createFontColorPlugin(),
      createImagePlugin({
        options: {
          uploadImage: (dataURI: string | ArrayBuffer) => upload(convertDataURIToFile(dataURI as string)),
        }
      }),
      createAlignPlugin({
        inject: {
          props: {
            validTypes: [
              ELEMENT_PARAGRAPH,
              ELEMENT_IMAGE,
              // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3
            ],
          },
        },
      }),
      createIndentPlugin({
        inject: {
          props: {
            validTypes: [
              ELEMENT_PARAGRAPH,
              // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK
            ],
          },
        },
      }),
      createEmojiPlugin(),
      createDeletePlugin(),
    ],
    {
      components: withPlaceholders({
        [ELEMENT_IMAGE]: ImageElement,
        [ELEMENT_PARAGRAPH]: ParagraphElement,
        [ELEMENT_EMOJI_INPUT]: EmojiInputElement,
        [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
        [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
        [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
      }),
    }
  );

  /**
   * HTML Serialize 的偶现 bug，img 元素的父元素由于 SSR 时宽度设置为 0，客户端水合后复用状态宽度依旧为 0
   * 必要替换相关字符串
   * https://github.com/udecode/plate/issues/3021
   */
  const generateHTML = () => editor ? serializeHtml(editor, { nodes: value }).replace(/(width:0;)|(width: 0;)/g, '') : null;
  const getRawValue = () => editor ? value : null;
  const setRawValue = (val: Value) => {
    resetEditor();
    setValue(val);
  };

  useImperativeHandle(ref, () => ({
    generateHTML,
    getRawValue,
    setRawValue,
  }));

  return (
    <TooltipProvider>
       <Plate plugins={plugins} initialValue={[{ type: 'p', children: [{ text: '' }] }]}>
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
        <PlateEditor />
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </TooltipProvider>
  );
}));