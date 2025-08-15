
import React from 'react';

interface IconProps {
  className?: string;
}

export const SwordIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 2L3.44 5.56L2 7L7 12L12 7L7 2M13 6L11 8L16.04 13.04L13.17 15.9L15.29 18.03L18.16 15.16L22 19L23.42 17.58L19 13.17L21.87 10.29L19.75 8.17L16.88 11.04L13 7.17V6Z" />
  </svg>
);

export const SaberIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.58,4.42A1,1,0,0,0,16.17,3,1,1,0,0,0,15,4H12.83L11,2H9L10.83,4H6A1,1,0,0,0,5,5V8A1,1,0,0,0,6,9H12.83L11,11H9L10.83,13H6A1,1,0,0,0,5,14V17A1,1,0,0,0,6,18H10.83L9,20H11L12.83,18H15A1,1,0,0,0,16,17.17L19.5,13.67V11.5L16,8Z" />
  </svg>
);

export const SpearIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.8,4.2C20.4,3.8,20,3.8,19.6,4.2L18.1,5.7L16,3.6L12.5,7.1L14.6,9.2L12.5,11.3L3,1.8L1.8,3L11.3,12.5L9.2,14.6L7.1,12.5L3.6,16L5.7,18.1L4.2,19.6C3.8,20,3.8,20.4,4.2,20.8C4.4,21,4.7,21.1,5,21.1C5.3,21.1,5.6,21,5.8,20.8L12.6,14L20.8,5.8C21.2,5.4,21.2,4.6,20.8,4.2Z" />
  </svg>
);

export const DaggerIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,2L14.05,5.85L13.3,6.3C13.15,6.4,13.05,6.55,13,6.7V17.5L12,22L11,17.5V6.7C10.95,6.55,10.85,6.4,10.7,6.3L9.95,5.85L12,2M15,9V12H23V9H15M1,9V12H9V9H1Z" />
  </svg>
);

export const AxeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,2L22,8C22,12 18,14 12,14C6,14 2,12 2,8L12,2M12,15C18,15 22,17 22,21V22H2V21C2,17 6,15 12,15Z" />
  </svg>
);

export const BowIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M1,21H12.34C12.14,20.04 12.14,19.04 12.34,18.09L9.46,15.21L13.69,11L18.41,15.73L17,17.14L15.27,15.41L11,19.69C11.96,19.89 12.96,19.89 14,19.69L21.5,12.2L12.2,2.9L2.9,12.2L1,21Z" />
    </svg>
);

export const StaffIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.3,4.7C19.3,4.7 19.3,4.7 19.3,4.7C18.4,5.6 18.4,7.1 19.3,8L15,12.3L11.7,9L16,4.7C16.9,3.8 18.4,3.8 19.3,4.7M10.3,10.4L13.6,13.7L12.8,14.5C11.9,15.4 10.4,15.4 9.5,14.5C9.5,14.5 9.5,14.5 9.5,14.5L2.3,21.7L2.1,21.5C2,21.3 2,21.2 2,21C2,20.4 2.4,20 3,20C3.2,20 3.3,20 3.5,20.1L4,20.6L10.3,14.3C10.3,14.3 10.3,14.3 10.3,14.3C11.2,13.4 12.7,13.4 13.6,14.3L14.3,13.6L4.7,4C3.8,3.1 3.8,1.6 4.7,0.7C4.7,0.7 4.7,0.7 4.7,0.7C5.6,-0.2 7.1,-0.2 8,0.7L12.3,5L15.6,1.7L18.5,4.6L10.3,12.8L10.3,10.4Z" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z" />
  </svg>
);

export const HelmetIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,1C12,1 12,1 12,1L3,5V11C3,16.5 6.8,21.7 12,23C17.2,21.7 21,16.5 21,11V5L12,1M12,6A3,3 0 0,1 15,9C15,10.3 14.1,11.4 12.9,11.8L15,19H9L11.1,11.8C9.9,11.4 9,10.3 9,9A3,3 0 0,1 12,6Z" />
    </svg>
);

export const ChestplateIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,21.8C12.3,21.9 12.5,22 12.8,22H13C18,22 22,18 22,13V6.7C22,6.7 21.3,4.8 18.5,4.1C18.5,4.1 16.5,2 12,2C7.5,2 5.5,4.1 5.5,4.1C2.7,4.8 2,6.7 2,6.7V13C2,18 6,22 11,22H11.2C11.5,22 11.7,21.9 12,21.8M15,9.5L13,11.1V14H11V11.1L9,9.5L12,7.5L15,9.5Z" />
    </svg>
);

export const BootsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20,18.5C20.8,18.5 21.5,19.2 21.5,20C21.5,20.8 20.8,21.5 20,21.5H12C12,21.5 12,20.8 12,20C12,19.2 12.7,18.5 13.5,18.5H14.5V14L10,12V10L14.5,12V7.5C14.5,6.7 13.8,6 13,6H4C3.2,6 2.5,6.7 2.5,7.5V18.5H3.5C4.3,18.5 5,19.2 5,20C5,20.8 5,21.5 5,21.5H8.5L10,18.5H11.5V14.8L12.5,15.2V18.5H13.5C13.5,18.5 13.5,18.5 13.5,18.5H14.5C14.5,18.5 14.5,18.5 14.5,18.5Z" />
    </svg>
);

export const PotionIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13,3C13,3 15,5 15,7C15,9 13.5,10.6 13.5,12.4C13.5,14.3 15,15.9 15,18C15,20.2 11.5,22 11.5,22C11.5,22 8,20.2 8,18C8,15.9 9.5,14.3 9.5,12.4C9.5,10.6 8,9 8,7C8,5 10,3 10,3M10.5,3.5C10.5,3.5 10.5,3.5 10.5,3.5C10.5,3.5 10.5,3.5 10.5,3.5C10.5,4.3 10,5 10,5.8C10,6.6 10.5,7.3 10.5,8.1C10.5,8.9 10,9.6 10,10.4C10,11.2 10.5,11.9 10.5,12.7C10.5,13.5 10,14.2 10,15C10,15.8 10.5,16.5 10.5,17.3C10.5,18.1 10,18.8 10,19.6L10.5,20.5" />
  </svg>
);

export const PillIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M15.5,13.5L18.3,10.7C19.1,9.9 19.1,8.6 18.3,7.8L16.2,5.7C15.4,4.9 14.1,4.9 13.3,5.7L10.5,8.5L15.5,13.5M10,9L5,14L9,18L14,13L10,9Z" />
    </svg>
);

export const ScrollIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9,2C7.9,2 7,2.9 7,4V5C5.9,5 5,5.9 5,7V9C3.9,9 3,9.9 3,11V17C3,18.1 3.9,19 5,19V20C6.1,20 7,19.1 7,18V17H17V18C17,19.1 17.9,20 19,20V19C20.1,19 21,18.1 21,17V11C21,9.9 20.1,9 19,9V7C19,5.9 18.1,5 17,5V4C17,2.9 16.1,2 15,2H9M9,4H15V5H9V4M7,7H17V9H7V7M5,11H19V17H5V11Z" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18,2H6C4.9,2 4,2.9 4,4V20C4,21.1 4.9,22 6,22H18C19.1,22 20,21.1 20,20V4C20,2.9 19.1,2 18,2M9,4H11V12L10,11L9,12V4M18,20H6V4H8V13L10,12L12,13V4H18V20Z" />
  </svg>
);

export const RingIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
    </svg>
);

export const AmuletIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M6,3L4,5L12,13L20,5L18,3H6M12,15L3,6V16A2,2 0 0,0 5,18H19A2,2 0 0,0 21,16V6L12,15Z" />
    </svg>
);

export const GemIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,2L2,8.5L12,22L22,8.5L12,2M12,10.3L17.6,8.5L12,5L6.4,8.5L12,10.3M12,12.6L5,9.6V15.4L12,19.2V12.6M12,12.6V19.2L19,15.4V9.6L12,12.6Z" />
  </svg>
);

export const CoinIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8C12.8,8 13.5,8.7 13.5,9.5C13.5,10.1 13.1,10.6 12.6,10.9L13,14H11L11.4,11.1C10.9,10.8 10.5,10.2 10.5,9.5C10.5,8.7 11.2,8 12,8Z" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16.5,8A2.5,2.5 0 0,0 19,5.5A2.5,2.5 0 0,0 16.5,3A2.5,2.5 0 0,0 14,5.5A2.5,2.5 0 0,0 16.5,8M9,11C9,11 9,11 9,11C7.3,11 6,9.7 6,8C6,6.3 7.3,5 9,5V3H11V5C12.7,5 14,6.3 14,8C14,9.7 12.7,11 11,11V13H13V15H11V21H9V11Z" />
    </svg>
);

export const ChestIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3,3V9H21V3H3M3,11V21H21V11H3M12,13A1,1 0 0,1 13,14A1,1 0 0,1 12,15A1,1 0 0,1 11,14A1,1 0 0,1 12,13Z" />
    </svg>
);

export const MeatIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,12.3C12,12.3 12,12.3 12,12.3C12,11.2 12.4,10.1 13.2,9.3C14,8.5 15.1,8 16.2,8C17.3,8 18.4,8.5 19.2,9.3C20,10.1 20.5,11.2 20.5,12.3C20.5,13.4 20,14.5 19.2,15.3C18.4,16.1 17.3,16.5 16.2,16.5C15.1,16.5 14,16.1 13.2,15.3C12.4,14.5 12,13.4 12,12.3M9.8,11.5L6.5,8.2L5.1,9.6L8.4,12.9L5.1,16.2L6.5,17.6L9.8,14.3C10.4,15.4 11.4,16.2 12.6,16.6L12.1,22H14.1L14.6,16.6C15.8,16.2 16.8,15.4 17.4,14.3L20.7,17.6L22.1,16.2L18.8,12.9L22.1,9.6L20.7,8.2L17.4,11.5C16.8,10.4 15.8,9.6 14.6,9.2L14.1,3H12.1L12.6,9.2C11.4,9.6 10.4,10.4 9.8,11.5Z" />
    </svg>
);

export const NpcIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2C14.21,2 16,3.79 16,6C16,8.21 14.21,10 12,10C9.79,10 8,8.21 8,6C8,3.79 9.79,2 12,2M12,12C16.42,12 20,13.79 20,16V18H4V16C4,13.79 7.58,12 12,12Z" />
    </svg>
);

export const MapIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,4C14.2,4 16,5.8 16,8C16,11.1 12.4,15.9 12,15.9C11.6,15.9 8,11.1 8,8C8,5.8 9.8,4 12,4M12,2A6,6 0 0,0 6,8C6,12.2 11,18.1 11.5,18.8L12,19.3L12.5,18.8C13,18.1 18,12.2 18,8A6,6 0 0,0 12,2M12,6A2,2 0 0,1 14,8A2,2 0 0,1 12,10A2,2 0 0,1 10,8A2,2 0 0,1 12,6M3,21V23H21V21H3Z" />
    </svg>
);

export const FlagIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
  </svg>
);

export const BrokenHeartIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35M16.5,5C15.36,5 14.32,5.55 13.63,6.4L12,8.27L10.37,6.4C9.68,5.55 8.64,5 7.5,5C5.5,5 4,6.5 4,8.5C4,11.23 7,13.91 12,18.17C17,13.91 20,11.23 20,8.5C20,6.5 18.5,5 16.5,5Z" />
    </svg>
);

export const BandagedHeartIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35M17,8H21V10H17V8M17,12H19V14H17V12M3,12H5V14H3V12M7,16H5V18H7V16M13,16H11V18H13V16Z" />
    </svg>
);

export const PoisonIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13,9H11V7H13V9M12,2C11.4,2 11,2.4 11,3V6.2C8.3,6.6 6.2,8.8 6.2,11.5L6,11.6C5.5,11.8 5.2,12.2 5.2,12.8C5.2,13.4 5.7,14 6.3,14H7.2C7.6,16.7 9.9,18.8 12.5,18.8L12.4,19C12.2,19.5 12.6,20 13.2,20C13.8,20 14.3,19.5 14.5,19L14.6,18.8C17.1,18.8 19.4,16.7 19.8,14H20.7C21.3,14 21.8,13.4 21.8,12.8C21.8,12.2 21.5,11.8 21,11.6L20.8,11.5C20.8,8.8 18.7,6.6 16,6.2V3C16,2.4 15.6,2 15,2H12M13,13H11V11H13V13M17,13H15V11H17V13M9,13H7V11H9V13Z" />
    </svg>
);

export const SkullIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2A9,9 0 0,0 3,11V22H21V11A9,9 0 0,0 12,2M8,10H10V12H8V10M14,10H16V12H14V10M12,14A3,3 0 0,1 9,17H15A3,3 0 0,1 12,14Z" />
    </svg>
);

export const FireIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2C12,2 12,2.3 12,2.6C12,3.8 11.2,4.8 10.1,5.1C9,5.4 7.9,5.2 6.9,4.6C5.9,4 5.2,3 5.2,1.8C5.2,1.8 5.2,1.8 5.2,1.8C5.2,0.8 4.4,0 3.4,0C2.4,0 1.6,0.8 1.6,1.8C1.6,2.9 2.3,3.9 3.3,4.5C4.3,5.1 5.4,5.3 6.5,5C7.6,4.7 8.5,3.9 8.9,2.8C9.3,1.7 10.1,0.8 11.1,0.5C12.1,0.2 13.2,0.4 14.2,1C15.2,1.6 15.9,2.6 15.9,3.8C15.9,3.8 15.9,3.8 15.9,3.8C15.9,4.8 16.7,5.6 17.7,5.6C18.7,5.6 19.5,4.8 19.5,3.8C19.5,2.7 18.8,1.7 17.8,1.1C16.8,0.5 15.7,0.3 14.6,0.6C13.5,0.9 12.6,1.7 12.2,2.8C11.8,3.9 11,4.8 10,5.1C9,5.4 7.9,5.2 6.9,4.6C5.9,4 5.2,3 5.2,1.8C5.2,1.8 5.2,1.8 5.2,1.8C5.2,0.8 4.4,0 3.4,0C2.4,0 1.6,0.8 1.6,1.8C1.6,2.9 2.3,3.9 3.3,4.5C4.3,5.1 5.4,5.3 6.5,5C7.6,4.7 8.5,3.9 8.9,2.8C9.3,1.7 10.1,0.8 11.1,0.5C12.1,0.2 13.2,0.4 14.2,1C15.2,1.6 15.9,2.6 15.9,3.8C15.9,3.8 15.9,3.8 15.9,3.8C15.9,4.8 16.7,5.6 17.7,5.6C18.7,5.6 19.5,4.8 19.5,3.8C19.5,2.7 18.8,1.7 17.8,1.1L18.9,13.9C18.9,13.9 18.9,13.9 18.9,13.9C18.9,14.9 18.1,15.7 17.1,15.7C16.1,15.7 15.3,14.9 15.3,13.9C15.3,12.8 16,11.8 17,11.2C18,10.6 19.1,10.4 20.2,10.7C21.3,11 22.2,11.8 22.6,12.9C23,14 22.8,15.1 22.2,16.1C21.6,17.1 20.6,17.8 19.5,17.8C19.5,17.8 19.5,17.8 19.5,17.8C18.5,17.8 17.7,17 17.7,16L16.6,2.2C15.5,1.6 14.3,1.5 13.2,1.8C12.1,2.1 11,2.9 10.5,4C9.4,4.6 8.3,4.5 7.2,4.2C6.1,3.9 5,3.1 4.5,2C3.4,1.4 2.2,1.5 1.1,1.8L2.2,15.6C2.2,15.6 2.2,15.6 2.2,15.6C2.2,16.6 3,17.4 4,17.4C5,17.4 5.8,16.6 5.8,15.6C5.8,14.5 5.1,13.5 4.1,12.9C3.1,12.3 2,12.1 0.9,12.4C-0.2,12.7 -1.1,13.5 -1.5,14.6C-1.9,15.7 -1.7,16.8 -1.1,17.8C-0.5,18.8 0.5,19.5 1.6,19.5C1.6,19.5 1.6,19.5 1.6,19.5C2.6,19.5 3.4,18.7 3.4,17.7L4.5,4C5.6,3.4 6.8,3.3 7.9,3.6C9,3.9 10.1,4.7 10.6,5.8C11.7,5.2 12.9,5.3 14,5.6C15.1,5.9 16.2,6.7 16.7,7.8L15.6,21.6C15.6,21.6 15.6,21.6 15.6,21.6C15.6,22.6 14.8,23.4 13.8,23.4C12.8,23.4 12,22.6 12,21.6C12,20.5 12.7,19.5 13.7,18.9C14.7,18.3 15.8,18.1 16.9,18.4C18,18.7 18.9,19.5 19.3,20.6C19.7,21.7 19.5,22.8 18.9,23.8C18.3,24.8 17.3,25.5 16.2,25.5C16.2,25.5 16.2,25.5 16.2,25.5C15.2,25.5 14.4,24.7 14.4,23.7L13.3,10C12.2,9.4 11,9.5 9.9,9.8C8.8,10.1 7.7,10.9 7.2,12L6.1,25.8C6.1,25.8 6.1,25.8 6.1,25.8C6.1,26.8 6.9,27.6 7.9,27.6C8.9,27.6 9.7,26.8 9.7,25.8C9.7,24.7 9,23.7 8,23.1C7,22.5 5.9,22.3 4.8,22.6C3.7,22.9 2.8,23.7 2.4,24.8C2,25.9 2.2,27 2.8,28C3.4,29 4.4,29.7 5.5,29.7C5.5,29.7 5.5,29.7 5.5,29.7C6.5,29.7 7.3,28.9 7.3,28L8.4,14.2C9.5,13.6 10.7,13.5 11.8,13.8C12.9,14.1 14,14.9 14.5,16L15.6,29.8C15.6,29.8 15.6,29.8 15.6,29.8C15.6,30.8 16.4,31.6 17.4,31.6C18.4,31.6 19.2,30.8 19.2,29.8C19.2,28.7 18.5,27.7 17.5,27.1C16.5,26.5 15.4,26.3 14.3,26.6C13.2,26.9 12.3,27.7 11.9,28.8L12,2C12,2 12,2 12,2Z" />
    </svg>
);

export const LightningIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11,15H6L13,1V9H18L11,23V15Z" />
    </svg>
);

export const WaterDropIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2A7.5,7.5 0 0,0 4.5,9.5C4.5,14.33 12,22 12,22C12,22 19.5,14.33 19.5,9.5A7.5,7.5 0 0,0 12,2Z" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M12,2L9.5,8.5L3,11L9.5,13.5L12,20L14.5,13.5L21,11L14.5,8.5L12,2Z" />
    </svg>
);

export const FistIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.4 19.6,14.7 18.8,15.8L8.2,5.2C9.3,4.4 10.6,4 12,4M5.2,8.2L15.8,18.8C14.7,19.6 13.4,20 12,20A8,8 0 0,1 4,12C4,10.6 4.4,9.3 5.2,8.2Z" />
    </svg>
);

export const BootIcon_Skill: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5,12C21.3,12 22,12.7 22,13.5V20C22,20.8 21.3,21.5 20.5,21.5H19V20H20.5V13.5H19V12H20.5M12.5,12C13.3,12 14,12.7 14,13.5V20C14,20.8 13.3,21.5 12.5,21.5H4C3.2,21.5 2.5,20.8 2.5,20V13.5C2.5,12.7 3.2,12 4,12H12.5M4,13.5V20H12.5V13.5H4Z" />
    </svg>
);

export const FeatherIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9.6,3.1C10.7,3.6 11.6,4.6 12,5.8L16,4L18,6L13.8,10.2C13.8,10.2 13.8,10.2 13.8,10.2C13.4,11.3 12.4,12.2 11.2,12.6C10,13 8.8,12.9 7.7,12.4L3.5,16.6C3.1,17 2.5,17 2.1,16.6C1.7,16.2 1.7,15.6 2.1,15.2L6.3,11C5.8,9.9 5.9,8.7 6.4,7.5C6.8,6.3 7.7,5.3 8.9,4.9C9.1,4.8 9.3,4.8 9.5,4.8C9.6,4.8 9.6,4.8 9.7,4.8L9.6,3.1M18,11L20,9L22,11L20,13L18,11Z" />
    </svg>
);

export const BloodDropIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2C12,2 12,2 12,2C6.5,2 2,6.5 2,12C2,17.5 6.5,22 12,22C17.5,22 22,17.5 22,12C22,6.5 17.5,2 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
    </svg>
);

export const UpArrowIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" />
    </svg>
);

export const DownArrowIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
    </svg>
);

export const CheckmarkIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z" />
    </svg>
);

// --- Map Icons ---
export const MapPinIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
    </svg>
);
export const LocationCurrentIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10c-4.2 0-8 3.22-8 8.2 0 3.32 2.67 7.25 8 11.8 5.33-4.55 8-8.48 8-11.8C20 5.22 16.2 2 12 2z"/></svg>
);
export const TownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></svg>
);
export const CityIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
);
export const CapitalIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M1 21h22L12 2 1 21zM12 6l7 12H5l7-12z"/></svg>
);
export const SectIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM8 11h8v2H8z"/></svg>
);
export const ShopIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49A.996.996 0 0020.01 4H5.21l-.94-2H1v2h2l3.6 7.59L3.62 17H19v-2H7l1.1-2h8.35z"/></svg>
);
export const InnIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3H9v2h10V7zm0 4H9v2h10v-2zm-2 4h-8v2h8v-2z"/></svg>
);
export const ForestIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2L2 22h20L12 2zm-2 16h-2v-4h2v4zm4 0h-2v-4h2v4z"/></svg>
);
export const MountainIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="m14 6-3.75 5 2.85 3.8-1.6 1.2-4.2-5.6-3.3 4.4L1 18h22L14 6z"/></svg>
);
export const CaveIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11 4h2v12l5.5-5.5 1.42 1.42L12 19.84l-7.92-7.92L5.5 10.5 11 16V4z"/></svg>
);
export const DungeonIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2.14c1.72.45 3 2 3 3.86 0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86V7z"/></svg>
);
export const RuinsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M10 9h4V5h-4v4zm-6 8h4v-4H4v4zm0-6h4V7H4v4zm0-6h4V3H4v4zm6 14h4v-4h-4v4zm-6-2h4v-4H4v4zm6 0h4v-4h-4v4zm6-14h4V3h-4v4zm0 6h4V7h-4v4zm0 8h4v-4h-4v4zm-6-8h4v-4h-4v4zm6-6h4V3h-4v4z"/></svg>
);
export const WaterIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
);
export const LandmarkIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
);
export const DefaultLocationIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
);
