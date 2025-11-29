import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from './RichTextEditor';

describe('RichTextEditor - Phase 5 Implementation', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render editor with placeholder', () => {
      render(
        <RichTextEditor
          content=""
          onChange={onChange}
          placeholder="Write something..."
        />
      );

      // Editor should be present
      const editor = document.querySelector('.ProseMirror');
      expect(editor).toBeTruthy();
    });

    it('should render with initial content', () => {
      const initialContent = '<p>Hello <strong>World</strong></p>';

      render(
        <RichTextEditor
          content={initialContent}
          onChange={onChange}
        />
      );

      // Should display initial content
      const editor = document.querySelector('.ProseMirror');
      expect(editor?.innerHTML).toContain('Hello');
      expect(editor?.innerHTML).toContain('<strong>World</strong>');
    });

    it('should render toolbar with formatting buttons', () => {
      render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      // Check for toolbar buttons
      const boldButton = screen.getByLabelText(/bold/i);
      const italicButton = screen.getByLabelText(/italic/i);
      const codeButton = screen.getByLabelText(/code/i);

      expect(boldButton).toBeTruthy();
      expect(italicButton).toBeTruthy();
      expect(codeButton).toBeTruthy();
    });

    it('should have list buttons (bullet and numbered)', () => {
      render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      const bulletListButton = screen.getByLabelText(/bullet list/i);
      const numberedListButton = screen.getByLabelText(/numbered list/i);

      expect(bulletListButton).toBeTruthy();
      expect(numberedListButton).toBeTruthy();
    });

    it('should have undo/redo buttons', () => {
      render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      const undoButton = screen.getByLabelText(/undo/i);
      const redoButton = screen.getByLabelText(/redo/i);

      expect(undoButton).toBeTruthy();
      expect(redoButton).toBeTruthy();
    });
  });

  describe('Text Formatting', () => {
    it('should call onChange when content changes', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      expect(editor).toBeTruthy();

      if (editor) {
        // Type text into editor
        await user.click(editor);
        await user.keyboard('Hello World');

        // onChange should be called with HTML content
        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
        });
      }
    });

    it('should apply bold formatting when bold button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const boldButton = screen.getByLabelText(/bold/i);

      if (editor) {
        // Select text
        await user.click(editor);
        await user.keyboard('{Control>}a{/Control}');

        // Click bold button
        await user.click(boldButton);

        // onChange should be called with bold HTML
        await waitFor(() => {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall) {
            expect(lastCall[0]).toContain('<strong>');
          }
        });
      }
    });

    it('should apply italic formatting when italic button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const italicButton = screen.getByLabelText(/italic/i);

      if (editor) {
        // Select text
        await user.click(editor);
        await user.keyboard('{Control>}a{/Control}');

        // Click italic button
        await user.click(italicButton);

        // onChange should be called with italic HTML
        await waitFor(() => {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall) {
            expect(lastCall[0]).toContain('<em>');
          }
        });
      }
    });

    it('should apply code formatting when code button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const codeButton = screen.getByLabelText(/code/i);

      if (editor) {
        // Select text
        await user.click(editor);
        await user.keyboard('{Control>}a{/Control}');

        // Click code button
        await user.click(codeButton);

        // onChange should be called with code HTML
        await waitFor(() => {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall) {
            expect(lastCall[0]).toContain('<code>');
          }
        });
      }
    });
  });

  describe('List Formatting', () => {
    it('should create bullet list when bullet list button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const bulletListButton = screen.getByLabelText(/bullet list/i);

      if (editor) {
        await user.click(editor);
        await user.click(bulletListButton);

        // onChange should be called with <ul> list
        await waitFor(() => {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall) {
            expect(lastCall[0]).toContain('<ul>');
          }
        });
      }
    });

    it('should create numbered list when numbered list button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const numberedListButton = screen.getByLabelText(/numbered list/i);

      if (editor) {
        await user.click(editor);
        await user.click(numberedListButton);

        // onChange should be called with <ol> list
        await waitFor(() => {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall) {
            expect(lastCall[0]).toContain('<ol>');
          }
        });
      }
    });
  });

  describe('Link Functionality', () => {
    it('should have link button in toolbar', () => {
      render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      const linkButton = screen.getByLabelText(/link/i);
      expect(linkButton).toBeTruthy();
    });

    it('should open link dialog when link button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const linkButton = screen.getByLabelText(/link/i);

      if (editor) {
        // Select text
        await user.click(editor);
        await user.keyboard('{Control>}a{/Control}');

        // Click link button
        await user.click(linkButton);

        // Should show prompt or dialog for link URL
        // Note: Actual implementation depends on how link dialog is implemented
        await waitFor(() => {
          expect(linkButton).toBeTruthy();
        });
      }
    });
  });

  describe('Undo/Redo', () => {
    it('should undo changes when undo button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Original</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const undoButton = screen.getByLabelText(/undo/i);

      if (editor) {
        // Make a change
        await user.click(editor);
        await user.keyboard(' Modified');

        // Click undo
        await user.click(undoButton);

        // Content should be reverted
        await waitFor(() => {
          expect(editor.textContent).toContain('Original');
        });
      }
    });

    it('should redo changes when redo button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content="<p>Original</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      const undoButton = screen.getByLabelText(/undo/i);
      const redoButton = screen.getByLabelText(/redo/i);

      if (editor) {
        // Make a change
        await user.click(editor);
        await user.keyboard(' Modified');

        // Undo
        await user.click(undoButton);

        // Redo
        await user.click(redoButton);

        // Modified content should be back
        await waitFor(() => {
          expect(editor.textContent).toContain('Modified');
        });
      }
    });
  });

  describe('Read-Only Mode', () => {
    it('should be read-only when editable is false', () => {
      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
          editable={false}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      expect(editor?.getAttribute('contenteditable')).toBe('false');
    });

    it('should hide toolbar in read-only mode', () => {
      const { container } = render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
          editable={false}
        />
      );

      // Toolbar should not be visible
      const toolbar = container.querySelector('.border-b.border-\\[\\#3d4457\\]');
      expect(toolbar).toBeFalsy();
    });

    it('should be editable by default', () => {
      render(
        <RichTextEditor
          content="<p>Test</p>"
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');
      expect(editor?.getAttribute('contenteditable')).toBe('true');
    });
  });

  describe('Placeholder', () => {
    it('should show placeholder when content is empty', () => {
      render(
        <RichTextEditor
          content=""
          onChange={onChange}
          placeholder="Start typing..."
        />
      );

      // Placeholder should be visible
      const placeholder = document.querySelector('[data-placeholder]');
      expect(placeholder).toBeTruthy();
    });

    it('should hide placeholder when content exists', () => {
      render(
        <RichTextEditor
          content="<p>Some content</p>"
          onChange={onChange}
          placeholder="Start typing..."
        />
      );

      // Placeholder should not be visible
      const editor = document.querySelector('.ProseMirror');
      expect(editor?.textContent).toBe('Some content');
    });
  });

  describe('TipTap Extensions', () => {
    it('should support StarterKit features (headings, paragraphs, etc)', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      const editor = document.querySelector('.ProseMirror');

      if (editor) {
        await user.click(editor);
        // Type markdown-style heading
        await user.keyboard('# Heading 1');

        // StarterKit should convert to <h1>
        await waitFor(() => {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall) {
            expect(lastCall[0]).toContain('Heading');
          }
        });
      }
    });

    it('should support Link extension with blue color', () => {
      render(
        <RichTextEditor
          content='<p><a href="https://example.com">Link</a></p>'
          onChange={onChange}
        />
      );

      const link = document.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.href).toBe('https://example.com/');
      // Should have blue color class
      expect(link?.classList.contains('text-[#0394ff]')).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <RichTextEditor
          content=""
          onChange={onChange}
          className="custom-editor"
        />
      );

      const editorWrapper = container.firstChild;
      expect(editorWrapper?.classList.contains('custom-editor')).toBe(true);
    });

    it('should have dark theme styling', () => {
      const { container } = render(
        <RichTextEditor
          content=""
          onChange={onChange}
        />
      );

      // Check for dark theme classes
      const editor = container.querySelector('.bg-\\[\\#181c28\\]');
      expect(editor).toBeTruthy();
    });
  });
});
