export interface InConfiguration {
  readMode: boolean;
  subject?:{
    title: string;
    image: string;
    link: string;
  };
  layout: {
    rtl: boolean;
    variant: string;
    theme_color: string;
    logo_bg_color: string;
    sidebar: {
      collapsed: boolean;
      backgroundColor: string;
    };
  };
}
