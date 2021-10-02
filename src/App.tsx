import React from 'react';
import { Discord, DiscordBackgroundStyle, DiscordTextStyle } from './lib';

function App() {
  return (
    <>
      <Discord id={'182292736790102017'} bgStyle={DiscordBackgroundStyle.DARK} textStyle={DiscordTextStyle.LIGHT} />
    </>
  );
}

export default App;
