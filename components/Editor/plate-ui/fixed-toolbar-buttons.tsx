import React from 'react';

import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';

import { Icons } from './icons';

import { MarkToolbarButton } from './mark-toolbar-button';
import { ModeDropdownMenu } from './mode-dropdown-menu';
import { ToolbarGroup } from './toolbar';
// import { ColorDropdownMenu } from './color-dropdown-menu';
// import { MARK_COLOR } from '@udecode/plate-font';
import { EmojiDropdownMenu } from './emoji-dropdown-menu';
import { MediaToolbarButton } from './media-toolbar-button';
import { AlignDropdownMenu } from './align-dropdown-menu';

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup>
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
            </ToolbarGroup>

            <ToolbarGroup>
              <MediaToolbarButton />
              <EmojiDropdownMenu />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        <ToolbarGroup noSeparator>
          <ModeDropdownMenu />
        </ToolbarGroup>
      </div>
    </div>
  );
}
