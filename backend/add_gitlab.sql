-- Ajouter le service GitLab
INSERT INTO "Service" ("id", "name", "description", "type", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'gitlab', 'GitLab DevOps platform for version control and CI/CD', 'oauth', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  "updatedAt" = NOW();

-- Récupérer l'ID du service GitLab
DO $$
DECLARE gitlab_service_id UUID;
BEGIN
  SELECT id INTO gitlab_service_id FROM "Service" WHERE name = 'gitlab';

  -- Ajouter les Actions GitLab
  INSERT INTO "Action" ("id", "name", "description", "serviceId", "params", "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'new_issue', 'Triggers when a new issue is created in a project', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'merge_request_merged', 'Triggers when a merge request is merged', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'pipeline_completed', 'Triggers when a CI/CD pipeline completes (success or failure)', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'new_merge_request', 'Triggers when a new merge request is opened', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true}]'::jsonb,
     NOW(), NOW())
  ON CONFLICT (name, "serviceId") DO NOTHING;

  -- Ajouter les Reactions GitLab
  INSERT INTO "Reaction" ("id", "name", "description", "serviceId", "params", "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'create_issue', 'Create a new issue in a project', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true},{"name":"title","description":"Issue title","type":"string","required":true},{"name":"description","description":"Issue description","type":"string","required":false},{"name":"labels","description":"Comma-separated labels","type":"string","required":false},{"name":"assigneeIds","description":"Comma-separated assignee user IDs","type":"string","required":false}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'comment_merge_request', 'Add a comment to a merge request', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true},{"name":"mergeRequestIid","description":"Merge request IID (internal ID)","type":"number","required":true},{"name":"body","description":"Comment text","type":"string","required":true}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'add_label', 'Add labels to an issue', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true},{"name":"issueIid","description":"Issue IID (internal ID)","type":"number","required":true},{"name":"labels","description":"Comma-separated labels","type":"string","required":true}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'close_issue', 'Close an issue', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true},{"name":"issueIid","description":"Issue IID (internal ID)","type":"number","required":true}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'create_merge_request', 'Create a new merge request', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true},{"name":"sourceBranch","description":"Source branch name","type":"string","required":true},{"name":"targetBranch","description":"Target branch name","type":"string","required":true},{"name":"title","description":"Merge request title","type":"string","required":true},{"name":"description","description":"Merge request description","type":"string","required":false}]'::jsonb,
     NOW(), NOW()),
    (gen_random_uuid(), 'trigger_pipeline', 'Trigger a CI/CD pipeline for a branch', gitlab_service_id,
     '[{"name":"projectId","description":"GitLab project ID or URL-encoded path","type":"string","required":true},{"name":"ref","description":"Branch or tag name","type":"string","required":true}]'::jsonb,
     NOW(), NOW())
  ON CONFLICT (name, "serviceId") DO NOTHING;
END $$;
