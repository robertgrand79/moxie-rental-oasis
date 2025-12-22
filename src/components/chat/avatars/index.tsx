import CaptainMoxieAvatar from './CaptainMoxieAvatar';
import PopArtMoxieAvatar from './PopArtMoxieAvatar';
import ActionMoxieAvatar from './ActionMoxieAvatar';
import RetroComicHostAvatar from './RetroComicHostAvatar';
import MoxieMascotAvatar from './MoxieMascotAvatar';
import InkStyleMoxieAvatar from './InkStyleMoxieAvatar';
import BerryMascotAvatar from './BerryMascotAvatar';
import BlazeMascotAvatar from './BlazeMascotAvatar';
import CoolMascotAvatar from './CoolMascotAvatar';
import MintMascotAvatar from './MintMascotAvatar';
import RoseMascotAvatar from './RoseMascotAvatar';
import SparkMascotAvatar from './SparkMascotAvatar';
import SunnyMascotAvatar from './SunnyMascotAvatar';
import { AvatarProps } from './types';

export type { AvatarProps };

export type AvatarType = 
  | 'captain-moxie' | 'pop-art-moxie' | 'action-moxie' 
  | 'retro-comic-host' | 'moxie-mascot' | 'ink-style-moxie'
  | 'berry-mascot' | 'blaze-mascot' | 'cool-mascot' 
  | 'mint-mascot' | 'rose-mascot' | 'spark-mascot' | 'sunny-mascot';

export const avatarComponents: Record<AvatarType, React.ComponentType<AvatarProps>> = {
  'captain-moxie': CaptainMoxieAvatar,
  'pop-art-moxie': PopArtMoxieAvatar,
  'action-moxie': ActionMoxieAvatar,
  'retro-comic-host': RetroComicHostAvatar,
  'moxie-mascot': MoxieMascotAvatar,
  'ink-style-moxie': InkStyleMoxieAvatar,
  'berry-mascot': BerryMascotAvatar,
  'blaze-mascot': BlazeMascotAvatar,
  'cool-mascot': CoolMascotAvatar,
  'mint-mascot': MintMascotAvatar,
  'rose-mascot': RoseMascotAvatar,
  'spark-mascot': SparkMascotAvatar,
  'sunny-mascot': SunnyMascotAvatar,
};

export const avatarInfo: Record<AvatarType, { name: string; description: string }> = {
  'captain-moxie': { name: 'Captain Moxie', description: 'Heroic superhero host' },
  'pop-art-moxie': { name: 'Pop Art Moxie', description: 'Warhol-inspired bold style' },
  'action-moxie': { name: 'Action Moxie', description: 'Dynamic manga-inspired assistant' },
  'retro-comic-host': { name: 'Retro Comic Host', description: 'Classic 50s comic book style' },
  'moxie-mascot': { name: 'Moxie Mascot', description: 'Bold mascot with speech bubble energy' },
  'ink-style-moxie': { name: 'Ink Style Moxie', description: 'Hand-drawn indie comic aesthetic' },
  'berry-mascot': { name: 'Berry', description: 'Playful purple pigtails and cheerful vibes' },
  'blaze-mascot': { name: 'Blaze', description: 'Fiery and determined with flame hair' },
  'cool-mascot': { name: 'Cool', description: 'Laid-back blue swoosh style' },
  'mint-mascot': { name: 'Mint', description: 'Music-loving with headphones' },
  'rose-mascot': { name: 'Rose', description: 'Sweet with flower crown and wavy hair' },
  'spark-mascot': { name: 'Spark', description: 'Electric yellow lightning energy' },
  'sunny-mascot': { name: 'Sunny', description: 'Warm vibes with curly hair and shades' },
};

export {
  CaptainMoxieAvatar, PopArtMoxieAvatar, ActionMoxieAvatar, 
  RetroComicHostAvatar, MoxieMascotAvatar, InkStyleMoxieAvatar,
  BerryMascotAvatar, BlazeMascotAvatar, CoolMascotAvatar,
  MintMascotAvatar, RoseMascotAvatar, SparkMascotAvatar, SunnyMascotAvatar,
};
