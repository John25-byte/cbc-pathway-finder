export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          admin_notes: string | null
          chosen_pathway_id: string
          created_at: string
          id: string
          recommended_pathway_id: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          chosen_pathway_id: string
          created_at?: string
          id?: string
          recommended_pathway_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          chosen_pathway_id?: string
          created_at?: string
          id?: string
          recommended_pathway_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_chosen_pathway_id_fkey"
            columns: ["chosen_pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_recommended_pathway_id_fkey"
            columns: ["recommended_pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      cluster_requirements: {
        Row: {
          id: string
          min_score: number
          pathway_id: string
          required_subjects: Json | null
        }
        Insert: {
          id?: string
          min_score?: number
          pathway_id: string
          required_subjects?: Json | null
        }
        Update: {
          id?: string
          min_score?: number
          pathway_id?: string
          required_subjects?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cluster_requirements_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: true
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_questions: {
        Row: {
          created_at: string
          id: string
          pathway_weights: Json
          question_text: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          pathway_weights?: Json
          question_text: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          pathway_weights?: Json
          question_text?: string
          sort_order?: number
        }
        Relationships: []
      }
      interest_responses: {
        Row: {
          answer_value: number
          created_at: string
          id: string
          question_id: string
          student_id: string
        }
        Insert: {
          answer_value: number
          created_at?: string
          id?: string
          question_id: string
          student_id: string
        }
        Update: {
          answer_value?: number
          created_at?: string
          id?: string
          question_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interest_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interest_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      pathway_weights: {
        Row: {
          id: string
          pathway_id: string
          subject_id: string
          weight_value: number
        }
        Insert: {
          id?: string
          pathway_id: string
          subject_id: string
          weight_value?: number
        }
        Update: {
          id?: string
          pathway_id?: string
          subject_id?: string
          weight_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pathway_weights_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pathway_weights_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      pathways: {
        Row: {
          careers: Json | null
          color: string
          created_at: string
          description: string | null
          focus_areas: Json | null
          id: string
          name: string
          progression: Json | null
          required_strengths: Json | null
        }
        Insert: {
          careers?: Json | null
          color?: string
          created_at?: string
          description?: string | null
          focus_areas?: Json | null
          id?: string
          name: string
          progression?: Json | null
          required_strengths?: Json | null
        }
        Update: {
          careers?: Json | null
          color?: string
          created_at?: string
          description?: string | null
          focus_areas?: Json | null
          id?: string
          name?: string
          progression?: Json | null
          required_strengths?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          kcpe_index: string | null
          school: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          kcpe_index?: string | null
          school?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          kcpe_index?: string | null
          school?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          academic_score: number
          confidence: number
          created_at: string
          explanation: string | null
          final_score: number
          id: string
          interest_score: number
          pathway_id: string
          student_id: string
        }
        Insert: {
          academic_score?: number
          confidence?: number
          created_at?: string
          explanation?: string | null
          final_score?: number
          id?: string
          interest_score?: number
          pathway_id: string
          student_id: string
        }
        Update: {
          academic_score?: number
          confidence?: number
          created_at?: string
          explanation?: string | null
          final_score?: number
          id?: string
          interest_score?: number
          pathway_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          created_at: string
          examiner_id: string
          id: string
          score: number
          student_id: string
          subject_id: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          examiner_id: string
          id?: string
          score: number
          student_id: string
          subject_id: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          examiner_id?: string
          id?: string
          score?: number
          student_id?: string
          subject_id?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "examiner" | "student"
      application_status: "pending" | "approved" | "adjusted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "examiner", "student"],
      application_status: ["pending", "approved", "adjusted"],
    },
  },
} as const
