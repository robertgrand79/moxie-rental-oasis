import ConciergeAvatar from './ConciergeAvatar';
import TravelerAvatar from './TravelerAvatar';
import HostAvatar from './HostAvatar';
import AdvisorAvatar from './AdvisorAvatar';
import GuideAvatar from './GuideAvatar';
import AssistantAvatar from './AssistantAvatar';

export type AvatarType = 'concierge' | 'traveler' | 'host' | 'advisor' | 'guide' | 'assistant';

export const avatarComponents: Record<AvatarType, React.ComponentType<{ size?: number; className?: string }>> = {
  concierge: ConciergeAvatar,
  traveler: TravelerAvatar,
  host: HostAvatar,
  advisor: AdvisorAvatar,
  guide: GuideAvatar,
  assistant: AssistantAvatar,
};

export const avatarInfo: Record<AvatarType, { name: string; description: string }> = {
  concierge: {
    name: 'The Concierge',
    description: 'Professional and refined, like a luxury hotel concierge',
  },
  traveler: {
    name: 'The Traveler',
    description: 'Adventurous and fun-loving explorer',
  },
  host: {
    name: 'The Host',
    description: 'Warm and welcoming, like a friendly homeowner',
  },
  advisor: {
    name: 'The Advisor',
    description: 'Knowledgeable and professional travel expert',
  },
  guide: {
    name: 'The Guide',
    description: 'Enthusiastic local area expert and outdoors lover',
  },
  assistant: {
    name: 'The Assistant',
    description: 'Friendly and cheerful general helper',
  },
};

export {
  ConciergeAvatar,
  TravelerAvatar,
  HostAvatar,
  AdvisorAvatar,
  GuideAvatar,
  AssistantAvatar,
};
