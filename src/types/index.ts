export interface Sample {
  id: string;
  name: string;
  scene_type: string;
  flight_height: number;
  sensor_type: string;
  terrain: string;
  weather: string;
  target_classes: string;
  thumbnail_url: string;
  description: string;
  captured_at: string;
  created_at: string;
}

export interface Annotation {
  id: string;
  sample_id: string;
  type: string;
  coordinates: { x: number; y: number; width: number; height: number }[];
  label: string;
}

export interface Trajectory {
  id: string;
  sample_id: string;
  path: { lat: number; lng: number }[];
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  sample_id: string;
  note: string;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  sample_ids: string[];
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  review_comment?: string;
}

export interface Download {
  id: string;
  application_id: string;
  downloaded_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  institution: string;
  created_at: string;
}

export interface FilterState {
  flightHeight: { min: number; max: number };
  sensorTypes: string[];
  terrains: string[];
  weathers: string[];
  targetClasses: string[];
}

export interface SearchResult {
  samples: Sample[];
  total: number;
  page: number;
  pageSize: number;
}