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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      business: {
        Row: {
          created_at: string
          description: string | null
          facebook_url: string | null
          id: string
          image_path: string | null
          image_url: string | null
          instagram_url: string | null
          is_active: boolean
          name: string
          owner_id: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean
          name: string
          owner_id: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_owner_id_fk_profile"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      business_current: {
        Row: {
          business_id: string
          set_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          set_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          set_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_current_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_current_user_id_fk_profile"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      business_invite: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          invited_by: string | null
          invited_user: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string | null
          invited_user?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string | null
          invited_user?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_invite_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_invite_invited_by_fk_profile"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "business_invite_invited_user_fk_profile"
            columns: ["invited_user"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      business_user: {
        Row: {
          business_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_user_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_user_user_id_fk_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gift: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_intent: {
        Row: {
          business_id: string
          consumed_at: string | null
          created_at: string
          customer_id: string | null
          expires_at: string | null
          gift_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          consumed_at?: string | null
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          gift_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          consumed_at?: string | null
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          gift_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_intent_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_intent_customer_id_fk_profile"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "gift_intent_gift_id_fk"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gift"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          business_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          created_at: string
          name: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          name?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string
          name?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      referral_intent: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          program_id: string
          referred_id: string | null
          referrer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          program_id: string
          referred_id?: string | null
          referrer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          program_id?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_intent_program_id_fk"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "referral_program"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_intent_referred_id_fk_profile"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_intent_referrer_id_fk_profile"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referral_program: {
        Row: {
          business_id: string
          code: string
          created_at: string
          id: string
          per_referrer_cap: number | null
          referred_reward: string | null
          referrer_reward: string | null
          status: string
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          business_id: string
          code: string
          created_at?: string
          id?: string
          per_referrer_cap?: number | null
          referred_reward?: string | null
          referrer_reward?: string | null
          status?: string
          title: string
          updated_at?: string
          valid_from?: string
          valid_to: string
        }
        Update: {
          business_id?: string
          code?: string
          created_at?: string
          id?: string
          per_referrer_cap?: number | null
          referred_reward?: string | null
          referrer_reward?: string | null
          status?: string
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_program_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_program_participant: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          note: string | null
          program_id: string
          referred_qty: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          note?: string | null
          program_id: string
          referred_qty?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          note?: string | null
          program_id?: string
          referred_qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_program_participant_customer_id_fk_profile"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_program_participant_program_id_fk"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "referral_program"
            referencedColumns: ["id"]
          },
        ]
      }
      response: {
        Row: {
          comment: string | null
          id: string
          rating: number
          respondent_id: string | null
          selected_traits: string[]
          submitted_at: string
          survey_id: string
        }
        Insert: {
          comment?: string | null
          id?: string
          rating: number
          respondent_id?: string | null
          selected_traits?: string[]
          submitted_at?: string
          survey_id: string
        }
        Update: {
          comment?: string | null
          id?: string
          rating?: number
          respondent_id?: string | null
          selected_traits?: string[]
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_respondent_id_fk_profile"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "response_survey_id_fk"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "survey"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_card: {
        Row: {
          business_id: string
          created_at: string
          goal_text: string
          id: string
          stamps_required: number
          status: string
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          business_id: string
          created_at?: string
          goal_text: string
          id?: string
          stamps_required: number
          status?: string
          title: string
          updated_at?: string
          valid_from?: string
          valid_to: string
        }
        Update: {
          business_id?: string
          created_at?: string
          goal_text?: string
          id?: string
          stamps_required?: number
          status?: string
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_card_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_card_product: {
        Row: {
          card_id: string
          product_id: string
        }
        Insert: {
          card_id: string
          product_id: string
        }
        Update: {
          card_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_card_product_card_id_fk"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "stamp_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_card_product_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_intent: {
        Row: {
          business_id: string
          card_id: string
          consumed_at: string | null
          created_at: string
          customer_id: string | null
          expires_at: string | null
          id: string
          note: string | null
          qty: number
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          card_id: string
          consumed_at?: string | null
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          note?: string | null
          qty: number
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          card_id?: string
          consumed_at?: string | null
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          note?: string | null
          qty?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_intent_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_intent_card_id_fk"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "stamp_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_intent_customer_id_fk_profile"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stamp_punch: {
        Row: {
          card_id: string
          created_at: string
          customer_id: string
          id: string
          note: string | null
          qty: number
        }
        Insert: {
          card_id: string
          created_at?: string
          customer_id: string
          id?: string
          note?: string | null
          qty?: number
        }
        Update: {
          card_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          note?: string | null
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "stamp_punch_card_id_fk"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "stamp_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_punch_customer_id_fk_profile"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          interval: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          interval?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          interval?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_user_id_fk_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_plan: {
        Row: {
          code: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          price_month: number
          price_year: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          price_month?: number
          price_year?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          price_month?: number
          price_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      survey: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          ends_at: string
          id: string
          is_anonymous: boolean
          max_responses: number
          product_id: string
          settings: Json
          starts_at: string
          status: string
          title: string
          traits: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          is_anonymous?: boolean
          max_responses?: number
          product_id: string
          settings?: Json
          starts_at?: string
          status?: string
          title: string
          traits?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_anonymous?: boolean
          max_responses?: number
          product_id?: string
          settings?: Json
          starts_at?: string
          status?: string
          title?: string
          traits?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_business_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_responses_for_survey: {
        Args: { p_survey_id: string }
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_business_member: {
        Args: { biz_id: string }
        Returns: boolean
      }
      is_business_owner: {
        Args: { biz_id: string }
        Returns: boolean
      }
      is_user_customer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_merchant: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
