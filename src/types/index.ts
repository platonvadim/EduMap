export type Vacancy = {
  id: string;
  city: string;
  olsdi: string;
  institution_type: string;
  institution: string;
  specialty_code: string;
  specialty_name: string;
};

export type DataFile = Record<string, Vacancy[]>;

export type School = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: 'primary_school' | 'gymnasium' | 'lyceum' | 'other_school';
  district: string | null;
  locality: string | null;
  address: string | null;
  phone: string | null;
  instruction_language: string | null;
  students_count: number | null;
  grades: string[];
};

export type SpecialtyCategory = 
  | 'matematica'
  | 'limbi'
  | 'stiinte'
  | 'pedagogie'
  | 'psihologie'
  | 'arte'
  | 'sport'
  | 'istorie'
  | 'altele';
