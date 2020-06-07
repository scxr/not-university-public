export type ImageLink = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Illustration_Bromus_tectorum0.jpg';
};

export type PrecipitationAmount = {
  cm: number;
  inches: number;
}

export type Plant = {
  common_name: string;
  images: ImageLink[];
  max_precip: PrecipitationAmount;
  min_precip: PrecipitationAmount;
  scientific_name: string;
  family: string;
};

export type LocationData = {
  city: string;
  state: string;
  rainfall: string;
  station: string;
  name: string;
  longitude: number;
  latitude: number;
};
