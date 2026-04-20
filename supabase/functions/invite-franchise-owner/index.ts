import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const reqSchema = z.object({
  email: z.string().email(),
  organization_id: z.string().uuid(),
  hq_restaurant_id: z.string().uuid().optional(),
  auto_confirm: z.boolean().optional().default(false),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase env vars missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing auth header')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Requires platform admin privileges')

    const body = await req.json()
    const { email, organization_id, hq_restaurant_id, auto_confirm } = reqSchema.parse(body)

    let newUserId: string;

    if (auto_confirm) {
      // Direct create bypassing email
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { role: 'owner', organization_id }
      })
      if (createError && !createError.message.includes('already')) throw createError;
      
      if (createError && createError.message.includes('already')) {
        // Find existing user
        const { data: existingData } = await supabase.auth.admin.listUsers() // hacky but works for small sets, or assume they exist
        const existingUser = existingData?.users.find(u => u.email === email);
        if (!existingUser) throw new Error('User exists but could not find ID');
        newUserId = existingUser.id;
      } else {
        newUserId = createData.user.id;
      }
    } else {
      // 1. Send Invite via Auth Admin
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { organization_id, role: 'owner' }
      })
      if (inviteError) throw inviteError
      newUserId = inviteData.user.id
    }

    // 2. Ensure Profile Exists & Set Role
    await supabase.from('profiles').upsert({
      id: newUserId,
      role: 'owner',
      restaurant_id: hq_restaurant_id || null,
      email: email,
    }, { onConflict: 'id' })

    // 3. Add to organization_members
    await supabase.from('organization_members').upsert({
      organization_id,
      user_id: newUserId,
      role: 'owner'
    })

    // 4. Update org settings: if auto-confirmed, clear pending
    const { data: org } = await supabase.from('organizations').select('settings').eq('id', organization_id).single()
    const settings = typeof org?.settings === 'object' && org.settings !== null ? org.settings : {}
    const updatedSettings = { ...settings }
    
    if (auto_confirm) {
      delete updatedSettings.pending_owner_email
    } else {
      updatedSettings.pending_owner_email = email
    }

    await supabase.from('organizations').update({ settings: updatedSettings }).eq('id', organization_id)

    return new Response(JSON.stringify({ success: true, user_id: newUserId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
