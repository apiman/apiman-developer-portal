export interface IConfig {
  "language": string,
  "supportedLanguages": string[],
  "hero": IHero,
  "navigation": INavigation,
  "footer": IFooter
}

export interface IHero {
  title: string;
  subtitle: string;
  heroImgUrl: string;
  large: boolean;
  fontColor: {
    title: string;
    subtitle: string;
  }
  overlayColor: string;
}

export interface INavigation{
  links: ILink[],
  separator: string
}

export interface IFooter{
  links: ILink[],
  separator: string
}

export interface ILink{
  "name": string
  "link": string,
  "openInNewTab": boolean
}

