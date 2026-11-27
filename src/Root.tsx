import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import cues from './cues.json';

export const Root: React.FC = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={Math.round(cues.dur * cues.fps)}
    fps={cues.fps}
    width={1920}
    height={1080}
  />
);
