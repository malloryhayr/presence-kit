import React from 'react';
import { Discord, DiscordBackgroundStyle, DiscordTextStyle } from './lib';

function App() {
  return (
    <>
      <Discord id={''} bgStyle={DiscordBackgroundStyle.LIGHT} textStyle={DiscordTextStyle.DARK} />
    </>
  );
}

export default App;
