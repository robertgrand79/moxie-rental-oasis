import CaptainMoxieAvatar from './CaptainMoxieAvatar';
import PopArtMoxieAvatar from './PopArtMoxieAvatar';
import ActionMoxieAvatar from './ActionMoxieAvatar';
import RetroComicHostAvatar from './RetroComicHostAvatar';
import MoxieMascotAvatar from './MoxieMascotAvatar';
import InkStyleMoxieAvatar from './InkStyleMoxieAvatar';
import { AvatarProps } from './types';

export type { AvatarProps };

export type AvatarType = 
  | 'captain-moxie' | 'pop-art-moxie' | 'action-moxie' 
  | 'retro-comic-host' | 'moxie-mascot' | 'ink-style-moxie';

export const avatarComponents: Record<AvatarType, React.ComponentType<AvatarProps>> = {
  'captain-moxie': CaptainMoxieAvatar,
  'pop-art-moxie': PopArtMoxieAvatar,
  'action-moxie': ActionMoxieAvatar,
  'retro-comic-host': RetroComicHostAvatar,
  'moxie-mascot': MoxieMascotAvatar,
  'ink-style-moxie': InkStyleMoxieAvatar,
};

export const avatarInfo: Record<AvatarType, { name: string; description: string }> = {
  'captain-moxie': { name: 'Captain Moxie', description: 'Heroic superhero host' },
  'pop-art-moxie': { name: 'Pop Art Moxie', description: 'Warhol-inspired bold style' },
  'action-moxie': { name: 'Action Moxie', description: 'Dynamic manga-inspired assistant' },
  'retro-comic-host': { name: 'Retro Comic Host', description: 'Classic 50s comic book style' },
  'moxie-mascot': { name: 'Moxie Mascot', description: 'Bold mascot with speech bubble energy' },
  'ink-style-moxie': { name: 'Ink Style Moxie', description: 'Hand-drawn indie comic aesthetic' },
};

export {
  CaptainMoxieAvatar, PopArtMoxieAvatar, ActionMoxieAvatar, 
  RetroComicHostAvatar, MoxieMascotAvatar, InkStyleMoxieAvatar,
};
