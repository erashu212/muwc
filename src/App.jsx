import React from 'react';
import { ThemeProvider } from 'styled-components';
import { getDefaultTheme } from '@elliemae/pui-theme';
import { GroupByColumn } from './story/GroupByColumn';
import './index.css';

const theme = getDefaultTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GroupByColumn />
    </ThemeProvider>
  );
}
