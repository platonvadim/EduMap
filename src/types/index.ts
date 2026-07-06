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
