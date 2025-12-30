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
// Diverse character avatars
import MoxieFoxAvatar from './MoxieFoxAvatar';
import HootOwlAvatar from './HootOwlAvatar';
import CasitaHouseAvatar from './CasitaHouseAvatar';
import GenieMoAvatar from './GenieMoAvatar';
import BlobbyAvatar from './BlobbyAvatar';
import PawDogAvatar from './PawDogAvatar';
import RoboHostAvatar from './RoboHostAvatar';
import TropicoDrinkAvatar from './TropicoDrinkAvatar';
// Big Ten mascot avatars
import BrutusBuckeyeAvatar from './BrutusBuckeyeAvatar';
import SpartyAvatar from './SpartyAvatar';
import HerkyHawkAvatar from './HerkyHawkAvatar';
import BuckyBadgerAvatar from './BuckyBadgerAvatar';
import GoldyGopherAvatar from './GoldyGopherAvatar';
import NittanyLionAvatar from './NittanyLionAvatar';
import PurduePeteAvatar from './PurduePeteAvatar';
import WolverineAvatar from './WolverineAvatar';
import HerbieHuskerAvatar from './HerbieHuskerAvatar';
import WillieWildcatAvatar from './WillieWildcatAvatar';
import TestudoAvatar from './TestudoAvatar';
import ScarletKnightAvatar from './ScarletKnightAvatar';
import OregonDuckAvatar from './OregonDuckAvatar';
import JoeBruinAvatar from './JoeBruinAvatar';
import TommyTrojanAvatar from './TommyTrojanAvatar';
import HarryHuskyAvatar from './HarryHuskyAvatar';
import IlliniAvatar from './IlliniAvatar';
import HoosiersAvatar from './HoosiersAvatar';
import { AvatarProps } from './types';

export type { AvatarProps };

export type AvatarType = 
  | 'captain-moxie' | 'pop-art-moxie' | 'action-moxie' 
  | 'retro-comic-host' | 'moxie-mascot' | 'ink-style-moxie'
  | 'berry-mascot' | 'blaze-mascot' | 'cool-mascot' 
  | 'mint-mascot' | 'rose-mascot' | 'spark-mascot' | 'sunny-mascot'
  | 'moxie-fox' | 'hoot-owl' | 'casita-house' | 'genie-mo'
  | 'blobby' | 'paw-dog' | 'robo-host' | 'tropico-drink'
  // Big Ten mascots
  | 'brutus-buckeye' | 'sparty' | 'herky-hawk' | 'bucky-badger'
  | 'goldy-gopher' | 'nittany-lion' | 'purdue-pete' | 'wolverine'
  | 'herbie-husker' | 'willie-wildcat' | 'testudo' | 'scarlet-knight'
  | 'oregon-duck' | 'joe-bruin' | 'tommy-trojan' | 'harry-husky'
  | 'illini' | 'hoosiers';

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
  'moxie-fox': MoxieFoxAvatar,
  'hoot-owl': HootOwlAvatar,
  'casita-house': CasitaHouseAvatar,
  'genie-mo': GenieMoAvatar,
  'blobby': BlobbyAvatar,
  'paw-dog': PawDogAvatar,
  'robo-host': RoboHostAvatar,
  'tropico-drink': TropicoDrinkAvatar,
  // Big Ten mascots
  'brutus-buckeye': BrutusBuckeyeAvatar,
  'sparty': SpartyAvatar,
  'herky-hawk': HerkyHawkAvatar,
  'bucky-badger': BuckyBadgerAvatar,
  'goldy-gopher': GoldyGopherAvatar,
  'nittany-lion': NittanyLionAvatar,
  'purdue-pete': PurduePeteAvatar,
  'wolverine': WolverineAvatar,
  'herbie-husker': HerbieHuskerAvatar,
  'willie-wildcat': WillieWildcatAvatar,
  'testudo': TestudoAvatar,
  'scarlet-knight': ScarletKnightAvatar,
  'oregon-duck': OregonDuckAvatar,
  'joe-bruin': JoeBruinAvatar,
  'tommy-trojan': TommyTrojanAvatar,
  'harry-husky': HarryHuskyAvatar,
  'illini': IlliniAvatar,
  'hoosiers': HoosiersAvatar,
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
  'moxie-fox': { name: 'Moxie Fox', description: 'Clever & friendly fox guide' },
  'hoot-owl': { name: 'Hoot the Owl', description: 'Wise travel companion' },
  'casita-house': { name: 'Casita', description: 'Friendly house character' },
  'genie-mo': { name: 'Genie Mo', description: 'Magical wish-granter' },
  'blobby': { name: 'Blobby', description: 'Cute morphing blob friend' },
  'paw-dog': { name: 'Paw the Dog', description: 'Loyal travel buddy' },
  'robo-host': { name: 'Robo Host', description: 'Friendly AI helper bot' },
  'tropico-drink': { name: 'Tropico', description: 'Vacation vibes cocktail' },
  // Big Ten mascots
  'brutus-buckeye': { name: 'Brutus Buckeye', description: 'Ohio State mascot' },
  'sparty': { name: 'Sparty', description: 'Michigan State Spartan warrior' },
  'herky-hawk': { name: 'Herky the Hawk', description: 'Iowa Hawkeye mascot' },
  'bucky-badger': { name: 'Bucky Badger', description: 'Wisconsin badger mascot' },
  'goldy-gopher': { name: 'Goldy Gopher', description: 'Minnesota golden gopher' },
  'nittany-lion': { name: 'Nittany Lion', description: 'Penn State lion mascot' },
  'purdue-pete': { name: 'Purdue Pete', description: 'Purdue Boilermaker mascot' },
  'wolverine': { name: 'The Wolverine', description: 'Michigan wolverine mascot' },
  'herbie-husker': { name: 'Herbie Husker', description: 'Nebraska cornhusker mascot' },
  'willie-wildcat': { name: 'Willie the Wildcat', description: 'Northwestern wildcat mascot' },
  'testudo': { name: 'Testudo', description: 'Maryland terrapin turtle' },
  'scarlet-knight': { name: 'Scarlet Knight', description: 'Rutgers knight mascot' },
  'oregon-duck': { name: 'The Duck', description: 'Oregon Ducks mascot' },
  'joe-bruin': { name: 'Joe Bruin', description: 'UCLA bear mascot' },
  'tommy-trojan': { name: 'Tommy Trojan', description: 'USC Trojan warrior' },
  'harry-husky': { name: 'Harry the Husky', description: 'Washington husky mascot' },
  'illini': { name: 'Fighting Illini', description: 'Illinois mascot shield' },
  'hoosiers': { name: 'Hoosiers', description: 'Indiana bison mascot' },
};

export {
  CaptainMoxieAvatar, PopArtMoxieAvatar, ActionMoxieAvatar, 
  RetroComicHostAvatar, MoxieMascotAvatar, InkStyleMoxieAvatar,
  BerryMascotAvatar, BlazeMascotAvatar, CoolMascotAvatar,
  MintMascotAvatar, RoseMascotAvatar, SparkMascotAvatar, SunnyMascotAvatar,
  MoxieFoxAvatar, HootOwlAvatar, CasitaHouseAvatar, GenieMoAvatar,
  BlobbyAvatar, PawDogAvatar, RoboHostAvatar, TropicoDrinkAvatar,
  // Big Ten mascots
  BrutusBuckeyeAvatar, SpartyAvatar, HerkyHawkAvatar, BuckyBadgerAvatar,
  GoldyGopherAvatar, NittanyLionAvatar, PurduePeteAvatar, WolverineAvatar,
  HerbieHuskerAvatar, WillieWildcatAvatar, TestudoAvatar, ScarletKnightAvatar,
  OregonDuckAvatar, JoeBruinAvatar, TommyTrojanAvatar, HarryHuskyAvatar,
  IlliniAvatar, HoosiersAvatar,
};