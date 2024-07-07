import React from 'react';

import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
// import { MARK_COLOR } from '@udecode/plate-font';
import { useEditorReadOnly } from '@udecode/plate-common';

import { Icons } from './icons';

import { MarkToolbarButton } from './mark-toolbar-button';
// import { ColorDropdownMenu } from './color-dropdown-menu';
import { AlignDropdownMenu } from './align-dropdown-menu';

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <MarkToolbarButton nodeType={MARK_BOLD} tooltip="粗体 (⌘+B)">
            <Icons.bold />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_ITALIC} tooltip="斜体 (⌘+I)">
            <Icons.italic />
          </MarkToolbarButton>
          <MarkToolbarButton
            nodeType={MARK_UNDERLINE}
            tooltip="下划线 (⌘+U)"
          >
            <Icons.underline />
          </MarkToolbarButton>
          {/* 
            HTML Serielize 有 bug
            text 除了添加 bold 或者 italic attribute 时，fontColor 不会被视作 leafElement
            暂时屏蔽 fontColor 功能
            https://github.com/udecode/plate/issues/2853
          <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="字体颜色">
            <Icons.color />
          </ColorDropdownMenu> */}
          <AlignDropdownMenu />
        </>
      )}
    </>
  );
}
