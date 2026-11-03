-- Integrated Man deep link ?p=dopamin sends root_problem "dopamin".
-- register_lead is unchanged. It already resolves the content flow with:
--   v_flow_name := coalesce(map_flow_name(p_source, p_onboarding_data->>'root_problem'), p_flow_name);
-- Today map_flow_name('integrated_man_flow', 'dopamin') falls through to
-- mens_relationship_flow. This adds the missing branch.
--
-- Do not treat this file as already applied. Apply it with the normal
-- migration process. After it runs:
--   select public.map_flow_name('integrated_man_flow', 'dopamin');
--   -- dopamine_detox_flow
-- Existing branches are unchanged. religion_selector stays unmapped on
-- purpose, so register_lead keeps using p_flow_name (bible_flow, islam_flow,
-- buddhism_flow).

CREATE OR REPLACE FUNCTION public.map_flow_name(p_source text, p_root_problem text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select case p_source
    when 'career_power_flow'      then 'career_flow'
    when 'elite_closer_flow'      then 'sales_flow'
    when 'path_to_lightness_flow' then 'leichtigkeit_flow'
    when 'integrated_soul_flow'   then 'secular_flow'
    when 'integrated_man_flow'    then case when p_root_problem = 'porn' then 'porn_recovery_flow'
                                            when p_root_problem = 'gettinggirls' then 'gettinggirls_flow'
                                            when p_root_problem = 'dopamin' then 'dopamine_detox_flow'
                                            else 'mens_relationship_flow' end
    when 'connected_couples_flow' then case when p_root_problem = 'intimacy' then 'fairplay_flow'
                                            else 'conflict_to_connection_flow' end
    when 'parent_in_peace_flow'   then case when p_root_problem = 'overwhelm' then 'parental_burnout_flow'
                                            else 'parenting_loop_flow' end  -- 3rd parenting flow TBD
    when 'loving_woman_flow'      then case when p_root_problem = 'somatic' then 'heartbreak_flow'
                                            when p_root_problem = 'dating'  then 'high_value_dating_flow'
                                            else 'main_character_flow' end
    else null
  end;
$function$;
