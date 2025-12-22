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
// New diverse character avatars
import MoxieFoxAvatar from './MoxieFoxAvatar';
import HootOwlAvatar from './HootOwlAvatar';
import CasitaHouseAvatar from './CasitaHouseAvatar';
import GenieMoAvatar from './GenieMoAvatar';
import BlobbyAvatar from './BlobbyAvatar';
import PawDogAvatar from './PawDogAvatar';
import RoboHostAvatar from './RoboHostAvatar';
import TropicoDrinkAvatar from './TropicoDrinkAvatar';
import { AvatarProps } from './types';

export type { AvatarProps };

export type AvatarType = 
  | 'captain-moxie' | 'pop-art-moxie' | 'action-moxie' 
  | 'retro-comic-host' | 'moxie-mascot' | 'ink-style-moxie'
  | 'berry-mascot' | 'blaze-mascot' | 'cool-mascot' 
  | 'mint-mascot' | 'rose-mascot' | 'spark-mascot' | 'sunny-mascot'
  // New diverse characters
  | 'moxie-fox' | 'hoot-owl' | 'casita-house' | 'genie-mo'
  | 'blobby' | 'paw-dog' | 'robo-host' | 'tropico-drink';

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
  // New diverse characters
  'moxie-fox': MoxieFoxAvatar,
  'hoot-owl': HootOwlAvatar,
  'casita-house': CasitaHouseAvatar,
  'genie-mo': GenieMoAvatar,
  'blobby': BlobbyAvatar,
  'paw-dog': PawDogAvatar,
  'robo-host': RoboHostAvatar,
  'tropico-drink': TropicoDrinkAvatar,
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
  // New diverse characters
  'moxie-fox': { name: 'Moxie Fox', description: 'Clever & friendly fox guide' },
  'hoot-owl': { name: 'Hoot the Owl', description: 'Wise travel companion' },
  'casita-house': { name: 'Casita', description: 'Friendly house character' },
  'genie-mo': { name: 'Genie Mo', description: 'Magical wish-granter' },
  'blobby': { name: 'Blobby', description: 'Cute morphing blob friend' },
  'paw-dog': { name: 'Paw the Dog', description: 'Loyal travel buddy' },
  'robo-host': { name: 'Robo Host', description: 'Friendly AI helper bot' },
  'tropico-drink': { name: 'Tropico', description: 'Vacation vibes cocktail' },
};

export {
  CaptainMoxieAvatar, PopArtMoxieAvatar, ActionMoxieAvatar, 
  RetroComicHostAvatar, MoxieMascotAvatar, InkStyleMoxieAvatar,
  BerryMascotAvatar, BlazeMascotAvatar, CoolMascotAvatar,
  MintMascotAvatar, RoseMascotAvatar, SparkMascotAvatar, SunnyMascotAvatar,
  // New diverse characters
  MoxieFoxAvatar, HootOwlAvatar, CasitaHouseAvatar, GenieMoAvatar,
  BlobbyAvatar, PawDogAvatar, RoboHostAvatar, TropicoDrinkAvatar,
};