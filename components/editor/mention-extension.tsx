import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import MentionList, { MentionListRef, MentionSuggestion } from '@/components/editor/mention-list';

export type { MentionSuggestion };

export const createMentionExtension = (getUsersFn: () => MentionSuggestion[]) => {
  return Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    renderLabel({ node }) {
      return `@${node.attrs.label}`;
    },
    suggestion: {
      items: ({ query }: { query: string }) => {
        const users = getUsersFn(); // Get users dynamically
        return users
          .filter((user) =>
            user.label.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5);
      },

      render: () => {
        let component: ReactRenderer<MentionListRef>;
        let popup: TippyInstance[];

        return {
          onStart: (props: any) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            popup = tippy('body', {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },

          onUpdate(props: any) {
            component.updateProps(props);

            if (!props.clientRect) {
              return;
            }

            if (popup && popup[0]) {
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            }
          },

          onKeyDown(props: any) {
            if (props.event.key === 'Escape') {
              if (popup && popup[0]) {
                popup[0].hide();
              }
              return true;
            }

            const handled = component.ref?.onKeyDown(props);
            return handled ?? false;
          },

          onExit() {
            if (popup && popup[0]) {
              popup[0].destroy();
            }
            if (component) {
              component.destroy();
            }
          },
        };
      },
      
      // This is the key fix: add a space after the mention
      command: ({ editor, range, props }) => {
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'mention',
              attrs: props,
            },
            {
              type: 'text',
              text: ' ',
            },
          ])
          .run();
      },
    },
  });
};
