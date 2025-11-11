export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          user_id: string;
          use_demo_data: boolean | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          use_demo_data?: boolean | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          use_demo_data?: boolean | null;
          updated_at?: string;
        };
      };
      user_integrations: {
        Row: {
          user_id: string;
          provider_id: string;
          secrets: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          provider_id: string;
          secrets: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          provider_id?: string;
          secrets?: Json;
          updated_at?: string;
        };
      };
    };
    Views: never;
    Functions: never;
    Enums: never;
    CompositeTypes: never;
  };
}
