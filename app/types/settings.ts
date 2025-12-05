/**
 * Types de settings étendus pour le framework
 */

export type TextAlign = 'left' | 'center' | 'right' | 'justify'
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'

export interface TextStyle {
  content: string
  align?: TextAlign
  size?: FontSize
  weight?: FontWeight
  italic?: boolean
  color?: string
  lineHeight?: string
}

export interface TitleSettings extends TextStyle {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export interface SubtitleSettings extends TextStyle {
  tag?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
