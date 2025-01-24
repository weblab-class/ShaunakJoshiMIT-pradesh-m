import { Howl } from 'howler';
import dingSound from '../assets/sounds/click.mp3';
import backgroundMusicFile from '../assets/sounds/background-music.mp3';

export const ding = new Howl({
  src: [dingSound],
  volume: 0.5,
});

export const backgroundMusic = new Howl({
  src: [backgroundMusicFile],
  loop: true,
  volume: 0.3,
});
