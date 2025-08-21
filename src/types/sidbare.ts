export interface EssentialLinkProps {
  title: string;
  caption?: string;
  icon?: string;
  routeName: string;
  routeParams?: Record<string, any>;
  tag?: string;
}
