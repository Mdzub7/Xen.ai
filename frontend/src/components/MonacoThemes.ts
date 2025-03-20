// Monaco Editor Theme Definitions

export const defineMonacoThemes = (monaco: any) => {
  // Define Xen Dark theme (GitHub Dark variant)
  monaco.editor.defineTheme('xen-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '#7d8590' },
      { token: 'keyword', foreground: '#ff7b72' },
      { token: 'string', foreground: '#a5d6ff' },
      { token: 'number', foreground: '#79c0ff' },
      { token: 'type', foreground: '#ff7b72' }
    ],
    colors: {
      'editor.background': '#0A192F',
      'editor.foreground': '#e6edf3',
      'editorCursor.foreground': '#e6edf3',
      'editor.lineHighlightBackground': '#0F1A2B',
      'editorLineNumber.foreground': '#7d8590',
      'editor.selectionBackground': '#2d4f7c',
      'editor.inactiveSelectionBackground': '#1a2333',
      'editorIndentGuide.background': '#1a2333',
      'scrollbarSlider.background': '#1a2333',
      'scrollbarSlider.hoverBackground': '#243044',
      'scrollbarSlider.activeBackground': '#243044',
      'minimap.background': '#0A192F',
      'minimap.foregroundOpacity': '#243044'
    }
  });

  // Define GitHub Light theme
  monaco.editor.defineTheme('github-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '#6e7781' },
      { token: 'keyword', foreground: '#cf222e' },
      { token: 'string', foreground: '#0a3069' },
      { token: 'number', foreground: '#0550ae' },
      { token: 'type', foreground: '#953800' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editorCursor.foreground': '#24292f',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editorLineNumber.foreground': '#57606a',
      'editor.selectionBackground': '#add6ff',
      'editor.inactiveSelectionBackground': '#e8f2ff',
      'editorIndentGuide.background': '#d0d7de',
      'scrollbarSlider.background': '#d0d7de',
      'scrollbarSlider.hoverBackground': '#afb8c1',
      'scrollbarSlider.activeBackground': '#afb8c1',
      'minimap.background': '#ffffff'
    }
  });

  // Define Monokai theme
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '#75715e' },
      { token: 'keyword', foreground: '#f92672' },
      { token: 'string', foreground: '#e6db74' },
      { token: 'number', foreground: '#ae81ff' },
      { token: 'type', foreground: '#66d9ef', fontStyle: 'italic' },
      { token: 'function', foreground: '#a6e22e' },
      { token: 'variable', foreground: '#f8f8f2' },
      { token: 'constant', foreground: '#ae81ff' }
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorCursor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorLineNumber.foreground': '#75715e',
      'editor.selectionBackground': '#49483e',
      'editor.inactiveSelectionBackground': '#3e3d32',
      'editorIndentGuide.background': '#3b3a32',
      'scrollbarSlider.background': '#3b3a32',
      'scrollbarSlider.hoverBackground': '#4e4d4a',
      'scrollbarSlider.activeBackground': '#4e4d4a',
      'minimap.background': '#272822'
    }
  });
};