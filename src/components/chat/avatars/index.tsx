import ConciergeAvatar from './ConciergeAvatar';
import TravelerAvatar from './TravelerAvatar';
import HostAvatar from './HostAvatar';
import AdvisorAvatar from './AdvisorAvatar';
import GuideAvatar from './GuideAvatar';
import AssistantAvatar from './AssistantAvatar';
import ChefAvatar from './ChefAvatar';
import CaptainAvatar from './CaptainAvatar';
import RangerAvatar from './RangerAvatar';
import ArtistAvatar from './ArtistAvatar';
import LocalAvatar from './LocalAvatar';
import SommelierAvatar from './SommelierAvatar';
import { AvatarProps } from './types';

export type { AvatarProps };

export type AvatarType = 'concierge' | 'traveler' | 'host' | 'advisor' | 'guide' | 'assistant' | 'chef' | 'captain' | 'ranger' | 'artist' | 'local' | 'sommelier';

export const avatarComponents: Record<AvatarType, React.ComponentType<AvatarProps>> = {
  concierge: ConciergeAvatar,
  traveler: TravelerAvatar,
  host: HostAvatar,
  advisor: AdvisorAvatar,
  guide: GuideAvatar,
  assistant: AssistantAvatar,
  chef: ChefAvatar,
  captain: CaptainAvatar,
  ranger: RangerAvatar,
  artist: ArtistAvatar,
  local: LocalAvatar,
  sommelier: SommelierAvatar,
};

export const avatarInfo: Record<AvatarType, { name: string; description: string }> = {
  concierge: { name: 'The Concierge', description: 'Professional and refined, like a luxury hotel concierge' },
  traveler: { name: 'The Traveler', description: 'Adventurous and fun-loving explorer' },
  host: { name: 'The Host', description: 'Warm and welcoming, like a friendly homeowner' },
  advisor: { name: 'The Advisor', description: 'Knowledgeable and professional travel expert' },
  guide: { name: 'The Guide', description: 'Enthusiastic local area expert and outdoors lover' },
  assistant: { name: 'The Assistant', description: 'Friendly and cheerful general helper' },
  chef: { name: 'The Chef', description: 'Passionate about local cuisine and restaurant tips' },
  captain: { name: 'The Captain', description: 'Expert on coastal activities and water adventures' },
  ranger: { name: 'The Ranger', description: 'Nature expert who knows every trail and wildlife spot' },
  artist: { name: 'The Artist', description: 'Knows all the galleries and creative experiences' },
  local: { name: 'The Local', description: 'Born and raised here, knows all the hidden gems' },
  sommelier: { name: 'The Sommelier', description: 'Curated taste for wine country and fine experiences' },
};

export {
  ConciergeAvatar, TravelerAvatar, HostAvatar, AdvisorAvatar, GuideAvatar, AssistantAvatar,
  ChefAvatar, CaptainAvatar, RangerAvatar, ArtistAvatar, LocalAvatar, SommelierAvatar,
};
